/**
 * DistroVantix - Perfil Global
 * UI de login, registro y perfil. El estado de sesion vive en JS/authGlobal.js.
 */
(function () {
  const state = {
    profile: null,
  };

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

  function cargarEstilos() {
    const styleId = "perfil-global-styles";
    if (document.getElementById(styleId)) return;

    const link = document.createElement("link");
    link.id = styleId;
    link.rel = "stylesheet";
    link.href = `${getPathPrefix()}CSS/perfilGlobal.css`;
    document.head.appendChild(link);
  }

  function esEmoji(str) {
    return Boolean(str) && str.length <= 8 && !str.includes(".") && !str.includes("/");
  }

  function renderAvatar(container, value, className, altText) {
    if (!container) return;
    container.textContent = "";

    if (esEmoji(value)) {
      container.textContent = value || "🐧";
      return;
    }

    const img = document.createElement("img");
    img.src = value || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
    img.alt = altText || "Avatar de usuario";
    if (className) img.className = className;
    img.onerror = () => {
      img.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
    };
    container.appendChild(img);
  }

  function inyectarModalHTML() {
    if (document.getElementById("user-profile-modal")) return;

    const modalHTML = `
      <div id="user-profile-modal" class="dv-modal-overlay" aria-hidden="true" style="opacity: 0; visibility: hidden;">
        <div class="dv-modal-card">
          <button id="dv-close-modal" class="dv-modal-close" aria-label="Cerrar modal">&times;</button>

          <div id="dv-auth-view" class="dv-modal-view">
            <div class="dv-auth-tabs">
              <button id="dv-tab-login" class="dv-tab-btn active" type="button">Iniciar Sesión</button>
              <button id="dv-tab-register" class="dv-tab-btn" type="button">Crear Cuenta</button>
            </div>

            <form id="dv-login-form" class="dv-auth-form">
              <div class="dv-form-group">
                <label for="dv-login-email">Correo Electrónico</label>
                <input type="email" id="dv-login-email" required placeholder="correo@ejemplo.com" class="dv-input">
              </div>
              <div class="dv-form-group">
                <label for="dv-login-password">Contraseña</label>
                <input type="password" id="dv-login-password" required placeholder="••••••••" class="dv-input">
              </div>
              <div id="dv-login-feedback" class="dv-feedback"></div>
              <button type="submit" class="dv-btn-submit">Ingresar</button>
            </form>

            <form id="dv-register-form" class="dv-auth-form dv-hidden">
              <div class="dv-form-group">
                <label for="dv-register-nick">Nombre de Usuario (Nick)</label>
                <input type="text" id="dv-register-nick" required placeholder="Ej: LinuxVantix" class="dv-input" maxlength="30" minlength="3">
              </div>
              <div class="dv-form-group">
                <label for="dv-register-email">Correo Electrónico</label>
                <input type="email" id="dv-register-email" required placeholder="correo@ejemplo.com" class="dv-input">
              </div>
              <div class="dv-form-group">
                <label for="dv-register-password">Contraseña (Mín. 6 caracteres)</label>
                <input type="password" id="dv-register-password" required placeholder="••••••••" minlength="6" class="dv-input">
              </div>
              <div id="dv-register-feedback" class="dv-feedback"></div>
              <button type="submit" class="dv-btn-submit">Registrarse</button>
            </form>
          </div>

          <div id="dv-profile-view" class="dv-modal-view dv-hidden">
            <div class="dv-profile-header">
              <div class="dv-avatar-container">
                <span id="dv-profile-avatar-display" class="dv-avatar-display">🐧</span>
              </div>
              <div class="dv-profile-info">
                <h3 id="dv-profile-nick-display">Usuario</h3>
                <span id="dv-profile-role-display" class="dv-role-badge">usuario</span>
              </div>
            </div>

            <div class="dv-divider"></div>

            <form id="dv-profile-edit-form">
              <div class="dv-form-group">
                <label for="dv-profile-avatar-input">Foto de Perfil (Emoji o URL de Imagen)</label>
                <div class="dv-avatar-edit-wrapper">
                  <input type="text" id="dv-profile-avatar-input" class="dv-input" placeholder="Ej: 🐧 o enlace de imagen">
                  <div class="dv-avatar-presets">
                    <button type="button" class="dv-preset-btn" data-emoji="🐧">🐧</button>
                    <button type="button" class="dv-preset-btn" data-emoji="🚀">🚀</button>
                    <button type="button" class="dv-preset-btn" data-emoji="💻">💻</button>
                    <button type="button" class="dv-preset-btn" data-emoji="🔥">🔥</button>
                    <button type="button" class="dv-preset-btn" data-emoji="👾">👾</button>
                  </div>
                </div>
              </div>

              <div class="dv-form-group">
                <label for="dv-profile-desc-input">Sobre mí (Descripción)</label>
                <textarea id="dv-profile-desc-input" class="dv-textarea" placeholder="Escribe algo sobre ti..." maxlength="200"></textarea>
              </div>

              <div id="dv-profile-feedback" class="dv-feedback"></div>

              <div class="dv-modal-actions">
                <button type="submit" class="dv-btn-save">Guardar Cambios</button>
                <button type="button" id="dv-btn-logout" class="dv-btn-logout">Cerrar Sesión</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = modalHTML.trim();
    document.body.appendChild(wrapper.firstChild);
  }

  function configurarEventosDOM(auth) {
    const userArea = document.querySelector(".user-area");
    const modal = document.getElementById("user-profile-modal");
    const closeModal = document.getElementById("dv-close-modal");
    const tabLogin = document.getElementById("dv-tab-login");
    const tabRegister = document.getElementById("dv-tab-register");
    const loginForm = document.getElementById("dv-login-form");
    const registerForm = document.getElementById("dv-register-form");
    const profileEditForm = document.getElementById("dv-profile-edit-form");
    const logoutBtn = document.getElementById("dv-btn-logout");
    const avatarInput = document.getElementById("dv-profile-avatar-input");
    const avatarDisplay = document.getElementById("dv-profile-avatar-display");

    if (userArea) {
      userArea.addEventListener("click", (e) => {
        e.preventDefault();
        abrirModalUser();
      });
    }

    if (closeModal) closeModal.addEventListener("click", cerrarModalUser);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModalUser();
      });
    }

    if (tabLogin && tabRegister && loginForm && registerForm) {
      tabLogin.addEventListener("click", () => {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        loginForm.classList.remove("dv-hidden");
        registerForm.classList.add("dv-hidden");
      });

      tabRegister.addEventListener("click", () => {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        registerForm.classList.remove("dv-hidden");
        loginForm.classList.add("dv-hidden");
      });
    }

    document.querySelectorAll(".dv-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const emoji = btn.dataset.emoji || "🐧";
        if (avatarInput) avatarInput.value = emoji;
        if (avatarDisplay) renderAvatar(avatarDisplay, emoji, "dv-avatar-img");
      });
    });

    if (avatarInput) {
      avatarInput.addEventListener("input", (e) => {
        renderAvatar(avatarDisplay, e.target.value.trim() || "🐧", "dv-avatar-img");
      });
    }

    if (loginForm) loginForm.addEventListener("submit", (e) => manejarLogin(e, auth));
    if (registerForm) registerForm.addEventListener("submit", (e) => manejarRegistro(e, auth));
    if (profileEditForm) {
      profileEditForm.addEventListener("submit", (e) => manejarGuardarPerfil(e, auth));
    }
    if (logoutBtn) logoutBtn.addEventListener("click", () => manejarLogout(auth));
  }

  function renderNavbar(profile) {
    const userArea = document.querySelector(".user-area");
    if (!userArea) return;

    userArea.textContent = "";

    if (!profile) {
      const img = document.createElement("img");
      img.src = `${getPathPrefix()}IMGS/user-icon.png`;
      img.alt = "Perfil de Usuario";
      userArea.className = "user-area";
      userArea.appendChild(img);
      return;
    }

    const avatar = document.createElement("span");
    avatar.className = "user-area-avatar-display";
    renderAvatar(avatar, profile.avatar_url, "", profile.nick);

    const name = document.createElement("span");
    name.className = "user-area-name";
    name.textContent = profile.nick;

    userArea.className = "user-area user-area-logged-in";
    userArea.append(avatar, name);
  }

  function abrirModalUser() {
    const modal = document.getElementById("user-profile-modal");
    if (!modal) return;

    modal.style.opacity = "";
    modal.style.visibility = "";
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    ["dv-login-feedback", "dv-register-feedback", "dv-profile-feedback"].forEach((id) => {
      const feedback = document.getElementById(id);
      if (feedback) feedback.textContent = "";
    });

    const authView = document.getElementById("dv-auth-view");
    const profileView = document.getElementById("dv-profile-view");
    if (!authView || !profileView) return;

    if (!state.profile) {
      authView.classList.remove("dv-hidden");
      profileView.classList.add("dv-hidden");
      return;
    }

    authView.classList.add("dv-hidden");
    profileView.classList.remove("dv-hidden");

    document.getElementById("dv-profile-nick-display").textContent = state.profile.nick;
    document.getElementById("dv-profile-role-display").textContent =
      state.profile.rol.toUpperCase();
    document.getElementById("dv-profile-avatar-input").value = state.profile.avatar_url || "";
    document.getElementById("dv-profile-desc-input").value = state.profile.descripcion || "";
    renderAvatar(
      document.getElementById("dv-profile-avatar-display"),
      state.profile.avatar_url,
      "dv-avatar-img",
      state.profile.nick,
    );
  }

  function cerrarModalUser() {
    const modal = document.getElementById("user-profile-modal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  async function manejarLogin(e, auth) {
    e.preventDefault();
    const email = document.getElementById("dv-login-email").value.trim();
    const password = document.getElementById("dv-login-password").value;
    const feedback = document.getElementById("dv-login-feedback");

    feedback.textContent = "Validando credenciales...";
    feedback.className = "dv-feedback info";

    try {
      await auth.signIn(email, password);
      feedback.textContent = "¡Ingreso correcto!";
      feedback.className = "dv-feedback success";
      document.getElementById("dv-login-form").reset();
      setTimeout(cerrarModalUser, 700);
    } catch (err) {
      console.error("Error al iniciar sesión:", err.message);
      feedback.textContent = "Credenciales incorrectas. Inténtalo de nuevo.";
      feedback.className = "dv-feedback error";
    }
  }

  async function manejarRegistro(e, auth) {
    e.preventDefault();
    const nick = document.getElementById("dv-register-nick").value.trim();
    const email = document.getElementById("dv-register-email").value.trim();
    const password = document.getElementById("dv-register-password").value;
    const feedback = document.getElementById("dv-register-feedback");

    if (nick.length < 3 || nick.length > 30) {
      feedback.textContent = "El nombre de usuario debe tener entre 3 y 30 caracteres.";
      feedback.className = "dv-feedback error";
      return;
    }

    feedback.textContent = "Creando cuenta...";
    feedback.className = "dv-feedback info";

    try {
      await auth.signUp({ nick, email, password });
      feedback.textContent = "¡Registro exitoso! Redirigiendo a inicio de sesión...";
      feedback.className = "dv-feedback success";
      document.getElementById("dv-register-form").reset();

      setTimeout(() => {
        document.getElementById("dv-tab-login").click();
        document.getElementById("dv-login-email").value = email;
        document.getElementById("dv-login-password").focus();
        feedback.textContent = "";
      }, 1200);
    } catch (err) {
      console.error("Error al registrarse:", err.message);
      feedback.textContent = err.message || "Error al procesar el registro.";
      feedback.className = "dv-feedback error";
    }
  }

  async function manejarGuardarPerfil(e, auth) {
    e.preventDefault();
    if (!state.profile) return;

    const avatarUrl = document.getElementById("dv-profile-avatar-input").value.trim() || "🐧";
    const descripcion = document.getElementById("dv-profile-desc-input").value.trim();
    const feedback = document.getElementById("dv-profile-feedback");

    feedback.textContent = "Guardando cambios...";
    feedback.className = "dv-feedback info";

    try {
      await auth.updateProfile({ avatar_url: avatarUrl, descripcion });
      feedback.textContent = "¡Cambios guardados con éxito!";
      feedback.className = "dv-feedback success";
      setTimeout(() => {
        feedback.textContent = "";
      }, 2500);
    } catch (err) {
      console.error("Error al actualizar perfil:", err.message);
      feedback.textContent = "Error al guardar los cambios: " + err.message;
      feedback.className = "dv-feedback error";
    }
  }

  async function manejarLogout(auth) {
    try {
      await auth.signOut();
      cerrarModalUser();
    } catch (err) {
      console.error("Error al cerrar sesión:", err.message);
    }
  }

  async function inicializarPerfil() {
    cargarEstilos();
    inyectarModalHTML();
    const auth = await ensureAuthModule();
    configurarEventosDOM(auth);
    auth.onChange(({ profile }) => {
      state.profile = profile;
      renderNavbar(profile);
    });
    await auth.ready();
  }

  window.DistroVantixProfile = {
    openModal: abrirModalUser,
    closeModal: cerrarModalUser,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarPerfil);
  } else {
    inicializarPerfil();
  }
})();
