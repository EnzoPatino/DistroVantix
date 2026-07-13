/**
 * DistroVantix - Foro
 * UI del muro y perfil del foro. Auth/Supabase se centraliza en JS/authGlobal.js.
 */
(function () {
  const state = {
    auth: null,
    supabase: null,
    usuarioLogueado: null,
  };

  const els = {};

  function getPathPrefix() {
    return window.location.pathname.includes("/HTML/") ? "../" : "";
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function ensureAuthModule() {
    if (window.DistroVantixAuth) return window.DistroVantixAuth;
    await loadScriptOnce(`${getPathPrefix()}JS/authGlobal.js`);
    return window.DistroVantixAuth;
  }

  function cacheDOM() {
    els.loginNavBtn = document.getElementById("login-nav-btn");
    els.logoutBtn = document.getElementById("logout-btn");
    els.loginModal = document.getElementById("login-modal");
    els.closeModalBtn = document.getElementById("close-modal-btn");
    els.loginForm = document.getElementById("login-form");
    els.registerForm = document.getElementById("register-form");
    els.tabLogin = document.getElementById("tab-login");
    els.tabRegister = document.getElementById("tab-register");
    els.commentForm = document.getElementById("comment-form");
    els.guestAlert = document.getElementById("guest-alert");
    els.commentContent = document.getElementById("comment-content");
    els.charCount = document.getElementById("char-count");
    els.commentList = document.getElementById("comment-list");
    els.loadingState = document.getElementById("loading-state");
    els.emptyState = document.getElementById("empty-state");
    els.profileEditBtn = document.getElementById("profile-edit-btn");
    els.profileModal = document.getElementById("profile-modal");
    els.closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
    els.profileForm = document.getElementById("profile-form");
    els.profileNameInput = document.getElementById("profile-name-input");
    els.profileAvatarInput = document.getElementById("profile-avatar-input");
    els.profileFeedback = document.getElementById("profile-feedback");
    els.userName = document.getElementById("user-name");
    els.userRole = document.getElementById("user-role");
    els.userAvatar = document.getElementById("user-avatar");
    els.statComments = document.getElementById("stat-comments");
    els.formFeedback = document.getElementById("form-feedback");
  }

  function setFeedback(element, text, color) {
    if (!element) return;
    element.textContent = text;
    if (color) element.style.color = color;
  }

  function abrirLoginModal() {
    if (els.loginModal) els.loginModal.style.display = "flex";
    if (els.closeModalBtn) els.closeModalBtn.style.display = "block";
  }

  function cerrarLoginModal() {
    if (els.loginModal) els.loginModal.style.display = "none";
  }

  function abrirProfileModal() {
    const usuario = state.usuarioLogueado;
    if (!usuario || !els.profileModal) return;
    if (els.profileNameInput) els.profileNameInput.value = usuario.nick;
    if (els.profileAvatarInput) els.profileAvatarInput.value = usuario.avatar_url;
    if (els.profileFeedback) els.profileFeedback.textContent = "";
    els.profileModal.style.display = "flex";
  }

  function cerrarProfileModal() {
    if (els.profileModal) els.profileModal.style.display = "none";
  }

  function renderAuthState(profile) {
    state.usuarioLogueado = profile;

    if (profile) {
      if (els.userName) els.userName.textContent = profile.nick;
      if (els.userRole) els.userRole.textContent = profile.rol.toUpperCase();
      if (els.userAvatar) els.userAvatar.textContent = profile.avatar_url || "🐧";
      if (els.profileEditBtn) els.profileEditBtn.style.display = "inline-flex";
      if (els.loginNavBtn) els.loginNavBtn.style.display = "none";
      if (els.logoutBtn) els.logoutBtn.style.display = "block";
      if (els.guestAlert) els.guestAlert.style.display = "none";
      if (els.commentForm) els.commentForm.style.display = "block";
      cerrarLoginModal();
      return;
    }

    if (els.userName) els.userName.textContent = "Invitado";
    if (els.userRole) els.userRole.textContent = "SIN SESIÓN";
    if (els.userAvatar) els.userAvatar.textContent = "🐧";
    if (els.loginNavBtn) els.loginNavBtn.style.display = "block";
    if (els.logoutBtn) els.logoutBtn.style.display = "none";
    if (els.guestAlert) els.guestAlert.style.display = "block";
    if (els.commentForm) els.commentForm.style.display = "none";
    if (els.profileEditBtn) els.profileEditBtn.style.display = "none";
  }

  function configurarEventosAuth() {
    if (els.loginNavBtn) els.loginNavBtn.addEventListener("click", abrirLoginModal);
    if (els.closeModalBtn) els.closeModalBtn.addEventListener("click", cerrarLoginModal);
    if (els.profileEditBtn) els.profileEditBtn.addEventListener("click", abrirProfileModal);
    if (els.closeProfileModalBtn) {
      els.closeProfileModalBtn.addEventListener("click", cerrarProfileModal);
    }

    if (els.tabLogin && els.tabRegister && els.loginForm && els.registerForm) {
      els.tabLogin.addEventListener("click", () => {
        els.tabLogin.classList.add("active");
        els.tabRegister.classList.remove("active");
        els.loginForm.style.display = "block";
        els.registerForm.style.display = "none";
        setFeedback(document.getElementById("login-feedback"), "");
        setFeedback(document.getElementById("register-feedback"), "");
      });

      els.tabRegister.addEventListener("click", () => {
        els.tabRegister.classList.add("active");
        els.tabLogin.classList.remove("active");
        els.registerForm.style.display = "block";
        els.loginForm.style.display = "none";
        setFeedback(document.getElementById("login-feedback"), "");
        setFeedback(document.getElementById("register-feedback"), "");
      });
    }

    if (els.loginForm) els.loginForm.addEventListener("submit", manejarLogin);
    if (els.registerForm) els.registerForm.addEventListener("submit", manejarRegistro);
    if (els.logoutBtn) els.logoutBtn.addEventListener("click", manejarLogout);
    if (els.profileForm) els.profileForm.addEventListener("submit", manejarGuardarPerfil);
  }

  async function manejarLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const feedback = document.getElementById("login-feedback");
    const submitBtn = els.loginForm.querySelector('button[type="submit"]');

    // Capturar el token de Cloudflare Turnstile desde el formulario
    const turnstileToken = e.target.querySelector('[name="cf-turnstile-response"]')?.value || "";
    console.log("[Turnstile] Token de login capturado:", turnstileToken);

    // Validación básica en el frontend
    if (!turnstileToken) {
      setFeedback(feedback, "Por favor, resuelve el desafío de seguridad (Turnstile).", "#ff5555");
      return;
    }

    setFeedback(feedback, "Procesando...", "#eab308");
    if (submitBtn) submitBtn.disabled = true;

    try {
      // Nota: Aquí se pasará el token a Supabase en el futuro (options: { captchaToken: turnstileToken })
      await state.auth.signIn(email, password);
      setFeedback(feedback, "¡Ingreso correcto!", "#22c55e");
      els.loginForm.reset();
      
      // Reiniciar el widget tras un inicio de sesión exitoso
      if (window.turnstile) {
        window.turnstile.reset(e.target.querySelector('.cf-turnstile'));
      }
      
      cerrarLoginModal();
      await cargarComentarios();
    } catch (error) {
      console.error("Error de login:", error.message);
      setFeedback(feedback, "Credenciales inválidas. Verificá tu email y contraseña.", "#ff5555");
      
      // Reiniciar el widget en caso de error para permitir un nuevo intento
      if (window.turnstile) {
        window.turnstile.reset(e.target.querySelector('.cf-turnstile'));
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  async function manejarRegistro(e) {
    e.preventDefault();
    const nick = document.getElementById("register-nick").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const feedback = document.getElementById("register-feedback");
    const submitBtn = els.registerForm.querySelector('button[type="submit"]');

    // Capturar el token de Cloudflare Turnstile desde el formulario
    const turnstileToken = e.target.querySelector('[name="cf-turnstile-response"]')?.value || "";
    console.log("[Turnstile] Token de registro capturado:", turnstileToken);

    // Validación básica en el frontend
    if (!turnstileToken) {
      setFeedback(feedback, "Por favor, resuelve el desafío de seguridad (Turnstile).", "#ff5555");
      return;
    }

    if (nick.length < 3 || nick.length > 30) {
      setFeedback(feedback, "El nombre debe tener entre 3 y 30 caracteres.", "#ff5555");
      return;
    }

    setFeedback(feedback, "Procesando...", "#eab308");
    if (submitBtn) submitBtn.disabled = true;

    try {
      // Nota: Aquí se pasará el token a Supabase en el futuro (options: { captchaToken: turnstileToken })
      await state.auth.signUp({ nick, email, password });
      setFeedback(feedback, "¡Registro exitoso! Redirigiendo a inicio de sesión...", "#22c55e");

      // Reiniciar el widget tras un registro exitoso
      if (window.turnstile) {
        window.turnstile.reset(e.target.querySelector('.cf-turnstile'));
      }

      setTimeout(() => {
        els.registerForm.reset();
        if (els.tabLogin) els.tabLogin.click();
        const loginEmailInput = document.getElementById("login-email");
        const loginPassInput = document.getElementById("login-password");
        if (loginEmailInput) loginEmailInput.value = email;
        if (loginPassInput) loginPassInput.focus();
        setFeedback(feedback, "");
      }, 1200);
    } catch (error) {
      console.error("Error de registro:", error.message);
      setFeedback(feedback, "No se pudo completar el registro. Intentá de nuevo más tarde.", "#ff5555");
      
      // Reiniciar el widget en caso de error para permitir un nuevo intento
      if (window.turnstile) {
        window.turnstile.reset(e.target.querySelector('.cf-turnstile'));
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  async function manejarLogout() {
    try {
      await state.auth.signOut();
      cerrarLoginModal();
      cerrarProfileModal();
      await cargarComentarios();
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  }

  async function cargarComentarios() {
    try {
      if (!els.loadingState || !els.commentList || !els.emptyState) return;
      els.commentList.textContent = "";
      els.loadingState.style.display = "block";
      els.emptyState.style.display = "none";

      const { data: comentarios, error } = await state.supabase
        .from("comentario")
        .select(
          "id_comentario, contenido, fecha, estado, id_usuario, usuario(nick, avatar_url, distro_favorita, rol)",
        )
        .eq("estado", "publicado")
        .order("fecha", { ascending: false });

      if (error) throw error;

      els.loadingState.style.display = "none";
      if (els.statComments) els.statComments.textContent = String(comentarios?.length || 0);

      if (!comentarios || comentarios.length === 0) {
        els.emptyState.style.display = "block";
        return;
      }

      comentarios.forEach((comentario) => {
        els.commentList.appendChild(crearTarjetaComentario(comentario));
      });
    } catch (error) {
      console.error("Error al cargar comentarios:", error.message);
      if (els.loadingState) els.loadingState.style.display = "none";
    }
  }

  function crearTarjetaComentario(comentario) {
    const autor = comentario.usuario || {};
    const usuario = state.usuarioLogueado;
    const esMio = usuario && comentario.id_usuario === usuario.id_usuario;
    const esAdmin = usuario && String(usuario.rol).toLowerCase() === "admin";
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
    body.textContent = comentario.contenido || "";
    card.append(header, body);

    if (puedeModificar) {
      const actions = document.createElement("div");
      actions.className = "comment-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-comment-action";
      editBtn.textContent = esAdmin && !esMio ? "Moderar" : "Editar";
      editBtn.addEventListener("click", () => activarEdicionComentario(card, comentario));

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

    const editor = document.createElement("textarea");
    editor.className = "comment-edit-textarea";
    editor.maxLength = 500;
    editor.value = comentario.contenido;

    const editActions = document.createElement("div");
    editActions.className = "comment-edit-actions";

    const feedback = document.createElement("span");
    feedback.className = "comment-inline-feedback";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn-comment-action btn-comment-save";
    saveBtn.textContent = "Guardar";
    saveBtn.addEventListener("click", async () => {
      const textoModificado = editor.value.trim();
      if (!textoModificado) {
        setFeedback(feedback, "El comentario no puede quedar vacío.", "#ff5555");
        return;
      }

      saveBtn.disabled = true;
      setFeedback(feedback, "Guardando...", "#eab308");
      const resultado = await guardarEdicionComentario(comentario.id_comentario, textoModificado);

      if (resultado.ok) {
        await cargarComentarios();
      } else {
        setFeedback(feedback, "Error: " + resultado.msg, "#ff5555");
        saveBtn.disabled = false;
      }
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn-comment-action";
    cancelBtn.textContent = "Cancelar";
    cancelBtn.addEventListener("click", cargarComentarios);

    editActions.append(feedback, saveBtn, cancelBtn);
    body.replaceWith(editor);
    actions.replaceWith(editActions);
    editor.focus();
  }

  async function guardarEdicionComentario(idComentario, nuevoTexto) {
    try {
      const { error } = await state.supabase
        .from("comentario")
        .update({ contenido: nuevoTexto })
        .eq("id_comentario", idComentario);

      if (error) throw error;
      return { ok: true };
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
      const { error } = await state.supabase
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

  function configurarEventosForo() {
    if (els.commentForm) els.commentForm.addEventListener("submit", manejarPublicarComentario);
    if (els.commentContent && els.charCount) {
      els.commentContent.addEventListener("input", () => {
        els.charCount.textContent = `${els.commentContent.value.length}/500`;
      });
    }
  }

  async function manejarPublicarComentario(e) {
    e.preventDefault();
    const usuario = state.usuarioLogueado;
    const contenidoText = els.commentContent.value.trim();
    const submitBtn = els.commentForm.querySelector('button[type="submit"]');

    if (!contenidoText) {
      setFeedback(els.formFeedback, "Escribí un aporte antes de publicar.", "#fde68a");
      return;
    }
    if (!usuario) {
      setFeedback(els.formFeedback, "Iniciá sesión para publicar.", "#fde68a");
      return;
    }
    if (usuario.estado !== "activo") {
      setFeedback(els.formFeedback, "Tu cuenta no está activa para publicar.", "#ff5555");
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      setFeedback(els.formFeedback, "Publicando...", "#eab308");

      const { error } = await state.supabase.from("comentario").insert([
        {
          contenido: contenidoText,
          estado: "publicado",
          id_usuario: usuario.id_usuario,
        },
      ]);
      if (error) throw error;

      els.commentContent.value = "";
      if (els.charCount) els.charCount.textContent = "0/500";
      setFeedback(els.formFeedback, "¡Publicado!", "#22c55e");
      await cargarComentarios();
      setTimeout(() => setFeedback(els.formFeedback, ""), 3000);
    } catch (error) {
      console.error("Error al guardar comentario:", error.message);
      setFeedback(els.formFeedback, "Error al guardar.", "#ff5555");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  async function manejarGuardarPerfil(e) {
    e.preventDefault();
    const usuario = state.usuarioLogueado;
    if (!usuario || !els.profileFeedback) return;

    const nick = els.profileNameInput.value.trim();
    const avatarUrl = els.profileAvatarInput.value.trim() || "🐧";

    if (!nick || nick.length < 3 || nick.length > 30) {
      setFeedback(els.profileFeedback, "El nombre debe tener entre 3 y 30 caracteres.", "#fde68a");
      return;
    }

    try {
      setFeedback(els.profileFeedback, "Guardando perfil...", "#eab308");
      await state.auth.updateProfile({ nick, avatar_url: avatarUrl });
      setFeedback(els.profileFeedback, "Perfil actualizado.", "#22c55e");
      await cargarComentarios();
      setTimeout(() => {
        cerrarProfileModal();
        setFeedback(els.profileFeedback, "");
      }, 900);
    } catch (error) {
      console.error("Error al actualizar perfil:", error.message);
      setFeedback(els.profileFeedback, "No se pudo actualizar el perfil.", "#ff5555");
    }
  }

  async function inicializarForo() {
    cacheDOM();
    state.auth = await ensureAuthModule();
    const authState = await state.auth.ready();
    state.supabase = authState.client || (await state.auth.getClient());
    renderAuthState(authState.profile);

    state.auth.onChange(async ({ profile }, eventName) => {
      renderAuthState(profile);
      if (eventName !== "CURRENT_STATE") await cargarComentarios();
    });

    configurarEventosAuth();
    configurarEventosForo();
    await cargarComentarios();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarForo);
  } else {
    inicializarForo();
  }
})();
