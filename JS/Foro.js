// ========================================
// CONFIGURACIÓN DE SUPABASE
// ========================================
const SUPABASE_URL = "https://hagcsftbwbglyjdtvrnz.supabase.co";
// Asegurate de que esta sea tu clave anónima real completa
const SUPABASE_ANON_KEY = "sb_publishable_pX1pErOuGyzRWj9PTnqQtQ_Yno8idk5";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos de la interfaz (DOM)
const loginNavBtn = document.getElementById("login-nav-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginModal = document.getElementById("login-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const commentForm = document.getElementById("comment-form");
const guestAlert = document.getElementById("guest-alert");
const commentContent = document.getElementById("comment-content");
const charCount = document.getElementById("char-count");
const commentList = document.getElementById("comment-list");
const loadingState = document.getElementById("loading-state");
const emptyState = document.getElementById("empty-state");
const profileEditBtn = document.getElementById("profile-edit-btn");
const profileModal = document.getElementById("profile-modal");
const closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
const profileForm = document.getElementById("profile-form");
const profileNameInput = document.getElementById("profile-name-input");
const profileAvatarInput = document.getElementById("profile-avatar-input");
const profileFeedback = document.getElementById("profile-feedback");

let usuarioLogueado = null;

// Control del modal flotante de Login
if (loginNavBtn) {
  loginNavBtn.addEventListener("click", () => {
    if (loginModal) loginModal.style.display = "flex";
  });
}
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    if (loginModal) loginModal.style.display = "none";
  });
}

// Control del modal flotante de Perfil
if (profileEditBtn) {
  profileEditBtn.addEventListener("click", () => {
    if (!usuarioLogueado || !profileModal) return;
    if (profileNameInput) profileNameInput.value = usuarioLogueado.nick;
    if (profileAvatarInput)
      profileAvatarInput.value = usuarioLogueado.avatar_url;
    profileModal.style.display = "flex";
  });
}
if (closeProfileModalBtn) {
  closeProfileModalBtn.addEventListener("click", () => {
    if (profileModal) profileModal.style.display = "none";
  });
}

// Escuchar cambios de estado de autenticación en Supabase
supabaseClient.auth.onAuthStateChange((event, session) => {
  chequearSesion();
});

// ========================================
// 1. CHEQUEO DE SESIÓN ACTIVA
// ========================================
async function chequearSesion() {
  try {
    const {
      data: { session },
      error: authError,
    } = await supabaseClient.auth.getSession();
    if (authError) throw authError;

    if (session && session.user) {
      const { data: perfil } = await supabaseClient
        .from("usuario")
        .select("*")
        .eq("id_usuario", session.user.id)
        .single();

      if (!perfil) {
        await crearPerfilBasicoDesdeSesion(session.user);
      }

      usuarioLogueado = {
        id_usuario: session.user.id,
        email: session.user.email,
        nick:
          perfil?.nick ||
          session.user.user_metadata?.nombre_usuario ||
          "Usuario de la comunidad",
        avatar_url:
          perfil?.avatar_url ||
          session.user.user_metadata?.foto_usuario ||
          "🐧",
        distro_favorita: perfil?.distro_favorita || "No indicada",
        estado: perfil?.estado || "activo",
        rol: perfil?.rol || "usuario",
      };

      // Dibujar datos en el HTML aside
      if (document.getElementById("user-name"))
        document.getElementById("user-name").textContent = usuarioLogueado.nick;
      if (document.getElementById("user-role"))
        document.getElementById("user-role").textContent =
          usuarioLogueado.rol.toUpperCase();
      if (document.getElementById("user-avatar"))
        document.getElementById("user-avatar").textContent =
          usuarioLogueado.avatar_url;

      // Ajustar botones de la interfaz
      if (profileEditBtn) profileEditBtn.style.display = "inline-flex";
      if (loginNavBtn) loginNavBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";
      if (guestAlert) guestAlert.style.display = "none";
      if (commentForm) commentForm.style.display = "block";
      if (loginModal) loginModal.style.display = "none";
    } else {
      usuarioLogueado = null;
      if (document.getElementById("user-name"))
        document.getElementById("user-name").textContent = "Invitado";
      if (document.getElementById("user-role"))
        document.getElementById("user-role").textContent = "SIN SESIÓN";
      if (document.getElementById("user-avatar"))
        document.getElementById("user-avatar").textContent = "";
      if (loginNavBtn) loginNavBtn.style.display = "block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (guestAlert) guestAlert.style.display = "block";
      if (commentForm) commentForm.style.display = "none";
      if (profileEditBtn) profileEditBtn.style.display = "none";
      if (loginModal) {
        loginModal.style.display = "flex";
        if (closeModalBtn) closeModalBtn.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error.message);
  }
}

async function crearPerfilBasicoDesdeSesion(user) {
  const nombreUsuario =
    user.user_metadata?.nombre_usuario ||
    user.email?.split("@")[0] ||
    "Usuario de la comunidad";
  await supabaseClient.from("usuario").upsert(
    {
      id_usuario: user.id,
      email: user.email,
      nick: nombreUsuario,
      avatar_url: user.user_metadata?.foto_usuario || "🐧",
      descripcion: "",
      distro_favorita: "Distro favorita no indicada",
      estado: "activo",
      rol: "usuario",
    },
    { onConflict: "id_usuario" },
  );
}

// ========================================
// 2. LOGUEARSE Y REGISTRARSE
// ========================================

// Alternar pestañas del modal (Iniciar Sesión / Registro)
if (tabLogin && tabRegister && loginForm && registerForm) {
  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    
    // Limpiar feedback de ambos
    const loginFeedback = document.getElementById("login-feedback");
    const registerFeedback = document.getElementById("register-feedback");
    if (loginFeedback) loginFeedback.textContent = "";
    if (registerFeedback) registerFeedback.textContent = "";
  });

  tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.style.display = "block";
    loginForm.style.display = "none";

    // Limpiar feedback de ambos
    const loginFeedback = document.getElementById("login-feedback");
    const registerFeedback = document.getElementById("register-feedback");
    if (loginFeedback) loginFeedback.textContent = "";
    if (registerFeedback) registerFeedback.textContent = "";
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const feedback = document.getElementById("login-feedback");

    if (!feedback) return;
    feedback.textContent = "Procesando...";
    feedback.style.color = "#eab308";

    try {
      const { error: loginError } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      feedback.textContent = "¡Ingreso correcto!";
      feedback.style.color = "#22c55e";
      loginForm.reset();
      if (loginModal) loginModal.style.display = "none";
      await chequearSesion();
      await cargarComentarios();
    } catch (error) {
      console.error("Error de login:", error.message);
      feedback.textContent = "Error: " + error.message;
      feedback.style.color = "#ff5555";
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nick = document.getElementById("register-nick").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const feedback = document.getElementById("register-feedback");

    if (!feedback) return;
    feedback.textContent = "Procesando...";
    feedback.style.color = "#eab308";

    try {
      const { data: authData, error: signupError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_usuario: nick || "Nuevo miembro",
            foto_usuario: "🐧",
          },
        },
      });

      if (signupError) throw signupError;

      if (authData?.user) {
        await supabaseClient.from("usuario").insert([
          {
            id_usuario: authData.user.id,
            email: email,
            nick: nick || "Nuevo miembro",
            avatar_url: "🐧",
            descripcion: "",
            distro_favorita: "Distro favorita no indicada",
            estado: "activo",
            rol: "usuario",
          },
        ]);
        feedback.textContent = "¡Registro exitoso! Redirigiendo a inicio de sesión...";
        feedback.style.color = "#22c55e";
        
        setTimeout(() => {
          registerForm.reset();
          if (tabLogin) tabLogin.click();
          const loginEmailInput = document.getElementById("login-email");
          if (loginEmailInput) {
            loginEmailInput.value = email;
          }
          const loginPassInput = document.getElementById("login-password");
          if (loginPassInput) {
            loginPassInput.focus();
          }
          feedback.textContent = "";
        }, 2000);
      }
    } catch (error) {
      console.error("Error de registro:", error.message);
      feedback.textContent = "Error: " + error.message;
      feedback.style.color = "#ff5555";
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    usuarioLogueado = null;
    window.location.reload();
  });
}

// ========================================
// 3. RENDERIZAR COMENTARIOS DEL MURO
// ========================================
async function cargarComentarios() {
  try {
    if (!loadingState || !commentList || !emptyState) return;
    commentList.innerHTML = "";
    loadingState.style.display = "block";
    emptyState.style.display = "none";

    // Traemos comentarios y hacemos el JOIN seguro con 'usuario'
    const { data: comentarios, error } = await supabaseClient
      .from("comentario")
      .select(
        "id_comentario, contenido, fecha, estado, id_usuario, usuario(nick, avatar_url, distro_favorita, rol)",
      )
      .eq("estado", "publicado")
      .order("fecha", { ascending: false });

    if (error) throw error;

    loadingState.style.display = "none";

    if (!comentarios || comentarios.length === 0) {
      emptyState.style.display = "block";
      if (document.getElementById("stat-comments"))
        document.getElementById("stat-comments").textContent = "0";
      return;
    }

    if (document.getElementById("stat-comments")) {
      document.getElementById("stat-comments").textContent = comentarios.length;
    }

    comentarios.forEach((comentario) => {
      commentList.appendChild(crearTarjetaComentario(comentario));
    });
  } catch (error) {
    console.error("Error al cargar comentarios:", error.message);
    if (loadingState) loadingState.style.display = "none";
  }
}

function crearTarjetaComentario(comentario) {
  const autor = comentario.usuario || {};
  const esMio =
    usuarioLogueado && comentario.id_usuario === usuarioLogueado.id_usuario;
  const esAdmin = usuarioLogueado && usuarioLogueado.rol === "ADMIN";
  const puedeModificar = esMio || esAdmin;

  const card = document.createElement("article");
  card.className = "comment-card";
  card.dataset.commentId = comentario.id_comentario;

  const header = document.createElement("div");
  header.className = "comment-header";

  const authorBox = document.createElement("div");
  authorBox.className = "comment-author";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = autor.avatar_url || "🐧";

  const authorMeta = document.createElement("div");
  authorMeta.className = "comment-author-meta";

  const name = document.createElement("h4");
  name.textContent = autor.nick || "Usuario de la comunidad";

  const role = document.createElement("small");
  role.className = "role-badge";
  role.textContent = (autor.rol || "usuario").toUpperCase();

  const distro = document.createElement("span");
  distro.className = "comment-distro";
  distro.textContent = autor.distro_favorita || "Distro no indicada";

  authorMeta.append(name, role, distro);
  authorBox.append(avatar, authorMeta);

  const date = document.createElement("time");
  date.className = "comment-date";
  date.dateTime = comentario.fecha || "";
  date.textContent = obtenerFechaRelativa(comentario.fecha);

  header.append(authorBox, date);

  const body = document.createElement("p");
  body.className = "comment-body";
  body.textContent = comentario.contenido || ""; // Render seguro contra XSS

  card.append(header, body);

  if (puedeModificar) {
    const actions = document.createElement("div");
    actions.className = "comment-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-comment-action";
    editBtn.textContent = esAdmin && !esMio ? "Moderar" : "Editar";
    editBtn.addEventListener("click", () =>
      activarEdicionComentario(card, comentario),
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-comment-action btn-comment-danger";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.addEventListener("click", () =>
      mostrarConfirmacionEliminar(card, comentario.id_comentario),
    );

    actions.append(editBtn, deleteBtn);
    card.append(actions);
  }

  return card;
}

function activarEdicionComentario(card, comentario) {
  const body = card.querySelector(".comment-body");
  const actions = card.querySelector(".comment-actions");
  if (!body || !actions) return;

  // Crear el área de texto para editar
  const editor = document.createElement("textarea");
  editor.className = "comment-edit-textarea";
  editor.maxLength = 500;
  editor.value = comentario.contenido; // Ponemos el texto actual

  const editActions = document.createElement("div");
  editActions.className = "comment-edit-actions";

  const feedback = document.createElement("span");
  feedback.className = "comment-inline-feedback";

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "btn-comment-action btn-comment-save";
  saveBtn.textContent = "Guardar";

  // Al hacer clic en Guardar
  saveBtn.addEventListener("click", async () => {
    const textoModificado = editor.value.trim();
    if (!textoModificado) {
      feedback.textContent = "El comentario no puede quedar vacío.";
      feedback.style.color = "#ff5555";
      return;
    }

    saveBtn.disabled = true;
    feedback.textContent = "Guardando...";
    feedback.style.color = "#eab308";

    // Llamamos a la función encargada de hablar con Supabase
    const resultado = await guardarEdicionComentario(comentario.id_comentario, textoModificado);

    if (resultado.ok) {
      await cargarComentarios(); // Forzamos a la pantalla a traer los comentarios actualizados
    } else {
      feedback.textContent = "Error: " + resultado.msg;
      feedback.style.color = "#ff5555";
      saveBtn.disabled = false;
    }
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn-comment-action";
  cancelBtn.textContent = "Cancelar";
  cancelBtn.addEventListener("click", () => cargarComentarios());

  editActions.append(feedback, saveBtn, cancelBtn);
  body.replaceWith(editor);
  actions.replaceWith(editActions);
  editor.focus();
}

async function guardarEdicionComentario(idComentario, nuevoTexto) {
  try {
    // Le pasamos explícitamente a la columna 'contenido' el valor de 'nuevoTexto'
    const { error } = await supabaseClient
      .from("comentario")
      .update({ contenido: nuevoTexto })
      .eq("id_comentario", idComentario);

    if (error) throw error;
    return { ok: true }; // Retorna éxito si no hubo errores
  } catch (error) {
    console.error("Error al editar comentario en Supabase:", error.message);
    return { ok: false, msg: error.message };
  }
}

function mostrarConfirmacionEliminar(card, idComentario) {
  let confirmBox = card.querySelector(".delete-confirm-box");
  if (confirmBox) {
    confirmBox.remove();
    return;
  }

  confirmBox = document.createElement("div");
  confirmBox.className = "delete-confirm-box";

  const message = document.createElement("span");
  message.textContent = "¿Eliminar este comentario?";

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "btn-comment-action btn-comment-danger";
  confirmBtn.textContent = "Sí, eliminar";
  confirmBtn.addEventListener("click", () => eliminarComentario(idComentario));

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn-comment-action";
  cancelBtn.textContent = "Cancelar";
  cancelBtn.addEventListener("click", () => confirmBox.remove());

  confirmBox.append(message, confirmBtn, cancelBtn);
  card.append(confirmBox);
}

async function eliminarComentario(idComentario) {
  try {
    const { error } = await supabaseClient
      .from("comentario")
      .delete()
      .eq("id_comentario", idComentario);
    if (error) throw error;
    await cargarComentarios();
  } catch (error) {
    console.error("Error al eliminar comentario:", error.message);
  }
}

function obtenerFechaRelativa(fecha) {
  if (!fecha) return "Ahora";
  const diferenciaMs = Date.now() - new Date(fecha).getTime();
  const minutos = Math.floor(diferenciaMs / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (minutos < 1) return "Ahora";
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas} h`;
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;

  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ========================================
// 4. PUBLICAR APORTE NUEVO
// ========================================
if (commentForm) {
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formFeedback = document.getElementById("form-feedback");
    if (!formFeedback) return;

    const contenidoText = commentContent.value.trim();
    if (!contenidoText) {
      formFeedback.textContent = "Escribí un aporte antes de publicar.";
      formFeedback.style.color = "#fde68a";
      return;
    }
    if (!usuarioLogueado) {
      formFeedback.textContent = "Iniciá sesión para publicar.";
      formFeedback.style.color = "#fde68a";
      return;
    }
    if (usuarioLogueado.estado !== "activo") {
      formFeedback.textContent = "Tu cuenta no está activa para publicar.";
      formFeedback.style.color = "#ff5555";
      return;
    }

    try {
      const submitBtn = commentForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      formFeedback.textContent = "Publicando...";
      formFeedback.style.color = "#eab308";

      const payload = {
        contenido: contenidoText,
        estado: "publicado",
        id_usuario: usuarioLogueado.id_usuario,
      };

      const { error } = await supabaseClient
        .from("comentario")
        .insert([payload]);
      if (error) throw error;

      commentContent.value = "";
      if (charCount) charCount.textContent = "0/500";
      formFeedback.textContent = "¡Publicado!";
      formFeedback.style.color = "#22c55e";

      await cargarComentarios();
      if (submitBtn) submitBtn.disabled = false;

      setTimeout(() => {
        formFeedback.textContent = "";
      }, 3000);
    } catch (error) {
      console.error("Error al guardar comentario:", error.message);
      formFeedback.textContent = "Error al guardar.";
      formFeedback.style.color = "#ff5555";
      const submitBtn = commentForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Lógica de perfil
if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!usuarioLogueado || !profileFeedback) return;

    const nombre_usuario = profileNameInput.value.trim();
    const foto_usuario = profileAvatarInput.value.trim() || "🐧";

    if (!nombre_usuario) {
      profileFeedback.textContent =
        "El nombre de usuario no puede quedar vacío.";
      profileFeedback.style.color = "#fde68a";
      return;
    }

    try {
      profileFeedback.textContent = "Guardando perfil...";
      profileFeedback.style.color = "#eab308";

      const { error } = await supabaseClient
        .from("usuario")
        .update({ nick: nombre_usuario, avatar_url: foto_usuario })
        .eq("id_usuario", usuarioLogueado.id_usuario);

      if (error) throw error;

      usuarioLogueado.nick = nombre_usuario;
      usuarioLogueado.avatar_url = foto_usuario;

      if (document.getElementById("user-name"))
        document.getElementById("user-name").textContent = nombre_usuario;
      if (document.getElementById("user-avatar"))
        document.getElementById("user-avatar").textContent = foto_usuario;

      profileFeedback.textContent = "Perfil actualizado.";
      profileFeedback.style.color = "#22c55e";

      await cargarComentarios();

      setTimeout(() => {
        if (profileModal) profileModal.style.display = "none";
        profileFeedback.textContent = "";
      }, 900);
    } catch (error) {
      console.error("Error al actualizar perfil:", error.message);
      profileFeedback.textContent = "No se pudo actualizar el perfil.";
      profileFeedback.style.color = "#ff5555";
    }
  });
}

if (commentContent && charCount) {
  commentContent.addEventListener("input", () => {
    charCount.textContent = `${commentContent.value.length}/500`;
  });
}

// INICIO CONTROLADO DE LA APP
document.addEventListener("DOMContentLoaded", async () => {
  await chequearSesion();
  await cargarComentarios();
});
