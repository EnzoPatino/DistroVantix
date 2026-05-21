/* ============================================ */
/* JAVASCRIPT UNIFICADO PARA DISTROS            */
/* ============================================ */

/**
 * Inicialización principal que se ejecuta cuando el DOM está listo.
 * Detecta la distribución actual y aplica las configuraciones correspondientes.
 */
document.addEventListener("DOMContentLoaded", () => {
  const distroInfo = getDistroInfo();

  initNavigation(distroInfo.color);
  initScrollAnimations();
  initButtonInteractions();
  initInfoBoxes(distroInfo.color);
  initResponsiveBodyState();

  if (distroInfo.hasToolCards) {
    initToolCards(distroInfo.color, distroInfo.toolColor);
  }

  console.log(`${distroInfo.name} page loaded with interactive features`);
});

/**
 * Detecta la distribución basada en el título del documento.
 * @returns {Object} Objeto con el nombre y el color temático de la distro.
 */
function getDistroInfo() {
  const title = document.title.toLowerCase();

  if (title.includes("cachyos")) {
    return { name: "CachyOS", color: "rgba(0, 255, 204, 0.4)" };
  }
  if (title.includes("pop!_os")) {
    return { name: "Pop!_OS", color: "rgba(76, 175, 80, 0.4)" };
  }
  if (title.includes("bazzite")) {
    return { name: "Bazzite", color: "rgba(0, 191, 255, 0.4)" };
  }
  if (title.includes("garuda")) {
    return { name: "Garuda Linux", color: "rgba(233, 30, 99, 0.4)" };
  }
  if (title.includes("parrot os")) {
    return {
      name: "Parrot OS",
      color: "rgba(0, 229, 255, 0.4)",
      hasToolCards: true,
    };
  }
  if (title.includes("blackarch")) {
    return {
      name: "BlackArch Linux",
      color: "rgba(255, 0, 85, 0.4)",
      toolColor: "rgba(255, 0, 0, 0.3)",
      hasToolCards: true,
    };
  }
  if (title.includes("kali")) {
    return {
      name: "Kali Linux",
      color: "rgba(85, 112, 255, 0.4)",
      toolColor: "rgba(179, 226, 0, 0.3)",
      hasToolCards: true,
    };
  }
  if (title.includes("fedora")) {
    return { name: "Fedora Workstation", color: "rgba(41, 92, 178, 0.4)" };
  }
  if (title.includes("ubuntu")) {
    return { name: "Ubuntu Desktop", color: "rgba(233, 84, 32, 0.4)" };
  }
  if (title.includes("arch linux")) {
    return { name: "Arch Linux", color: "rgba(23, 147, 209, 0.4)" };
  }
  if (title.includes("kde")) {
    return { name: "KDE Plasma", color: "rgba(0, 120, 212, 0.4)" };
  }
  if (title.includes("hyprland")) {
    return { name: "Hyprland", color: "rgba(0, 242, 255, 0.4)" };
  }

  // Valor por defecto
  return { name: "Distro", color: "rgba(0, 255, 204, 0.4)" };
}

/**
 * Maneja la navegación responsive y el menú toggle.
 * @param {string} color - Color temático para el fondo del botón.
 */
function initNavigation(color) {
  const btnMenu = document.getElementById("btn-menu");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".navbar-links a");

  // Toggle navbar en mobile
  btnMenu?.addEventListener("click", () => {
    navbar?.classList.toggle("active");
    if (btnMenu) {
      btnMenu.style.background = navbar?.classList.contains("active")
        ? color.replace("0.4", "0.2")
        : "none";
    }
  });

  // Cerrar navbar al hacer click en un link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbar?.classList.remove("active");
      if (btnMenu) {
        btnMenu.style.background = "none";
      }
    });
  });

  // Cerrar navbar al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar-container")) {
      navbar?.classList.remove("active");
      if (btnMenu) {
        btnMenu.style.background = "none";
      }
    }
  });
}

/**
 * Configura las animaciones de scroll usando IntersectionObserver.
 */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    },
  );

  // Observar elementos animados
  document
    .querySelectorAll(".info-box, .intro-showcase, .comparison-section, .tools-grid, .tool-card")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
}

/**
 * Configura la interactividad de los botones, incluyendo efecto ripple y scroll suave.
 */
function initButtonInteractions() {
  const ctaButtons = document.querySelectorAll(".cta-button");

  ctaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Efecto de ripple
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("ripple");

      button.appendChild(ripple);

      // Scroll suave a la sección
      const sectionId = button.getAttribute("data-section");
      if (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      // Remover ripple después de la animación
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/**
 * Añade efectos de hover y animaciones a los cuadros de información.
 * @param {string} color - Color temático para el efecto glow.
 */
function initInfoBoxes(color) {
  const infoBoxes = document.querySelectorAll(".info-box");

  infoBoxes.forEach((box, index) => {
    // Añadir efecto de entrada escalonada
    box.style.animationDelay = `${index * 0.1}s`;

    box.addEventListener("mouseenter", () => {
      // Efecto de glow usando el color de la distro
      box.style.boxShadow = `0 0 30px ${color}, inset 0 0 30px ${color.replace("0.4", "0.05")}`;
    });

    box.addEventListener("mouseleave", () => {
      box.style.boxShadow = "";
    });
  });
}

/**
 * Inicializa las tarjetas de herramientas en distros de ciberseguridad.
 * @param {string} color - Color temático para el efecto.
 * @param {string} toolColor - Color destacado para tarjetas de herramientas.
 */
function initToolCards(color, toolColor = color.replace("0.4", "0.3")) {
  const toolCards = document.querySelectorAll(".tool-card");

  toolCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;

    card.addEventListener("mouseenter", () => {
      card.style.boxShadow = `0 0 25px ${toolColor}, 0 0 50px ${color.replace("0.4", "0.2")}`;
      card.style.transform = "translateY(-8px)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "";
      card.style.transform = "translateY(0)";
    });
  });
}

/**
 * Mantiene una clase de ayuda para estilos específicos de pantallas móviles.
 */
function initResponsiveBodyState() {
  const updateMobileClass = () => {
    document.body.classList.toggle("mobile", window.innerWidth <= 768);
  };

  updateMobileClass();
  window.addEventListener("resize", updateMobileClass);
}
