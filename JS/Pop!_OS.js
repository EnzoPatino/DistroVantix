/* ============================================ */
/* JAVASCRIPT INTERACTIVO PARA POP!_OS PAGE     */
/* ============================================ */

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initScrollAnimations();
  initButtonInteractions();
  initInfoBoxes();
});

/* ============================================ */
/* NAVEGACIÓN RESPONSIVE                        */
/* ============================================ */

function initNavigation() {
  const btnMenu = document.getElementById("btn-menu");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".navbar-links a");

  // Toggle navbar en mobile
  btnMenu?.addEventListener("click", () => {
    navbar?.classList.toggle("active");
    btnMenu.style.background = navbar?.classList.contains("active")
      ? "rgba(76, 175, 80, 0.2)"
      : "none";
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

/* ============================================ */
/* ANIMACIONES DE SCROLL                        */
/* ============================================ */

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Agregar clase de animación cuando entra en vista
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

  // Observar todos los info-box y showcase
  document
    .querySelectorAll(".info-box, .intro-showcase, .comparison-section")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
}

/* ============================================ */
/* INTERACTIVIDAD DE BOTONES                    */
/* ============================================ */

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

/* ============================================ */
/* EFFECT HOVER EN INFO-BOX                     */
/* ============================================ */

function initInfoBoxes() {
  const infoBoxes = document.querySelectorAll(".info-box");

  infoBoxes.forEach((box, index) => {
    // Añadir efecto de entrada escalonada
    box.style.animationDelay = `${index * 0.1}s`;

    box.addEventListener("mouseenter", () => {
      // Efecto de glow mejorado con colores de Pop!_OS
      box.style.boxShadow = `0 0 30px rgba(76, 175, 80, 0.4), 
                             inset 0 0 30px rgba(76, 175, 80, 0.05)`;
    });

    box.addEventListener("mouseleave", () => {
      box.style.boxShadow = "";
    });
  });
}

/* ============================================ */
/* SMOOTH SCROLL BEHAVIOR                       */
/* ============================================ */

// Scroll suave nativo (CSS: scroll-behavior: smooth)
// Soportado en navegadores modernos

/* ============================================ */
/* UTILIDADES                                   */
/* ============================================ */

// Función para detectar si estamos en mobile
function isMobile() {
  return window.innerWidth <= 768;
}

// Función para agregar clase cuando pasa tiempo
function addClassAfterDelay(element, className, delay = 1000) {
  setTimeout(() => {
    element?.classList.add(className);
  }, delay);
}

// Log de inicialización
console.log("🖥️ Pop!_OS page loaded with interactive features");
