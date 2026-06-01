// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = "https://hagcsftbwbglyjdtvrnz.supabase.co";
// Usamos la clave anónima pública que ya tenías configurada
const SUPABASE_ANON_KEY = "sb_publishable_pX1pErOuGyzRWj9PTnqQtQ_Yno8idk5"; // REVISÁ QUE ESTA SEA TU CLAVE COMPLETA REAL

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos de la interfaz (DOM)
const loginNavBtn = document.getElementById("login-nav-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginModal = document.getElementById("login-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const authForm = document.getElementById("auth-form");
const commentForm = document.getElementById("comment-form");
const guestAlert = document.getElementById("guest-alert");
const commentContent = document.getElementById("comment-content");
const charCount = document.getElementById("char-count");
const commentList = document.getElementById("comment-list");
const loadingState = document.getElementById("loading-state");
const emptyState = document.getElementById("empty-state");

let usuarioLogueado = null;

// Control del modal flotante
if (loginNavBtn)
  loginNavBtn.addEventListener("click", () => {
    if (loginModal) loginModal.style.display = "flex";
  });
if (closeModalBtn)
  closeModalBtn.addEventListener("click", () => {
    if (loginModal) loginModal.style.display = "none";
  });

// ==========================================
// 1. CHEQUEO DE SESIÓN ACTIVA
// ==========================================
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

      usuarioLogueado = {
        id_usuario: session.user.id,
        email: session.user.email,
        nick:
          perfil?.nick ||
          perfil?.nombre ||
          session.user.user_metadata?.username ||
          "Usuario de la comunidad",
        avatar_url: perfil?.avatar_url || "",
        rol: perfil?.rol || "usuario",
      };

      if (document.getElementById("user-name"))
        document.getElementById("user-name").textContent = usuarioLogueado.nick;
      if (document.getElementById("user-role"))
        document.getElementById("user-role").textContent =
          usuarioLogueado.rol.toUpperCase();
      if (document.getElementById("user-avatar"))
        document.getElementById("user-avatar").textContent =
          usuarioLogueado.avatar_url;

      if (loginNavBtn) loginNavBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";
      if (guestAlert) guestAlert.style.display = "none";
      if (commentForm) commentForm.style.display = "block";
      if (loginModal) loginModal.style.display = "none";
    } else {
      usuarioLogueado = null;
      if (loginNavBtn) loginNavBtn.style.display = "block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (guestAlert) guestAlert.style.display = "block";
      if (commentForm) commentForm.style.display = "none";
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error.message);
  }
}

// Escuchar cambios de estado en Supabase
supabaseClient.auth.onAuthStateChange((event, session) => {
  chequearSesion();
});

// ==========================================
// 2. LOGUEARSE Y REGISTRARSE
// ==========================================
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const action = e.submitter.getAttribute("data-action");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const nick = document.getElementById("nick")
      ? document.getElementById("nick").value.trim()
      : "";
    const authFeedback = document.getElementById("auth-feedback");

    if (!authFeedback) return;
    authFeedback.textContent = "Procesando...";
    authFeedback.style.color = "#eab308";

    try {
      if (action === "register") {
        const { data: authData, error: signupError } =
          await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { username: nick } },
          });
        if (signupError) throw signupError;

        if (authData?.user) {
          await supabaseClient.from("usuario").insert([
            {
              id_usuario: authData.user.id,
              email: email,
              nick: nick || "Nuevo Miembro",
              rol: "usuario",
              avatar_url: "",
            },
          ]);
        }
        authFeedback.textContent = "¡Registro exitoso! Ya podés ingresar.";
        authFeedback.style.color = "#22c55e";
      } else {
        const { error: loginError } =
          await supabaseClient.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        authFeedback.textContent = "¡Ingreso correcto!";
        authFeedback.style.color = "#22c55e";
        authForm.reset();
        await chequearSesion();
        await cargarComentarios();
      }
    } catch (error) {
      console.error("Error de auth:", error.message);
      authFeedback.textContent = "Error: " + error.message;
      authFeedback.style.color = "#ff5555";
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

// ==========================================
// 3. RENDERIZAR COMENTARIOS DEL MURO
// ==========================================
async function cargarComentarios() {
  try {
    if (!loadingState || !commentList || !emptyState) return;

    // Limpiamos la pantalla antes de dibujar para evitar que se dupliquen
    commentList.innerHTML = "";
    loadingState.style.display = "block";
    emptyState.style.display = "none";

    const { data: comentarios, error } = await supabaseClient
      .from("comentario")
      .select("id_comentario, contenido, fecha, estado, id_usuario")
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

    if (document.getElementById("stat-comments"))
      document.getElementById("stat-comments").textContent = comentarios.length;

    comentarios.forEach((comentario) => {
      let autor = {
        username: "Usuario de la comunidad",
        avatar_url: "",
        rol: "usuario",
      };

      if (
        usuarioLogueado &&
        comentario.id_usuario === usuarioLogueado.id_usuario
      ) {
        autor = {
          username: usuarioLogueado.nick,
          avatar_url: usuarioLogueado.avatar_url,
          rol: usuarioLogueado.rol,
        };
      }

      const fechaBase = comentario.fecha
        ? new Date(comentario.fecha)
        : new Date();
      const fechaLegible = fechaBase.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const card = document.createElement("article");
      card.className = `comment-card`;
      card.innerHTML = `
                <div class="comment-header" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="avatar">${autor.avatar_url}</div>
                        <div>
                            <h4 style="margin:0; color:#cdd6f4;">${autor.username}</h4>
                            <small style="background:#313244; padding:2px 6px; border-radius:4px; color:#cba6f7;">${autor.rol.toUpperCase()}</small>
                        </div>
                    </div>
                    <small style="color:#6c7086;">${fechaLegible}</small>
                </div>
                <p style="margin:0; color:#a6adc8; font-size:15px; line-height:1.5;">${comentario.contenido}</p>
            `;
      commentList.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar comentarios:", error.message);
    if (loadingState) loadingState.style.display = "none";
  }
}

// ==========================================
// 4. PUBLICAR APORTE NUEVO
// ==========================================
if (commentForm) {
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formFeedback = document.getElementById("form-feedback");
    if (!formFeedback) return;

    const contenidoText = commentContent.value.trim();
    if (!contenidoText) return;

    try {
      const submitBtn = commentForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      formFeedback.textContent = "Publicando...";
      formFeedback.style.color = "#eab308";

      const payload = { contenido: contenidoText, estado: "publicado" };
      if (usuarioLogueado && usuarioLogueado.id_usuario) {
        payload.id_usuario = usuarioLogueado.id_usuario;
      }

      const { error } = await supabaseClient
        .from("comentario")
        .insert([payload]);

      if (error) {
        const { error: errorAlt } = await supabaseClient
          .from("comentario")
          .insert([{ contenido: contenidoText, estado: "publicado" }]);
        if (errorAlt) throw errorAlt;
      }

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

if (commentContent && charCount) {
  commentContent.addEventListener("input", () => {
    charCount.textContent = `${commentContent.value.length}/500`;
  });
}

// ==========================================
// INICIO CONTROLADO DE LA APP
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  await chequearSesion();
  await cargarComentarios(); // Se ejecuta una sola vez fija acá abajo
});
