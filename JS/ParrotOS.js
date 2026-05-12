/* ============================================ */
/* JAVASCRIPT INTERACTIVO PARA PARROT OS PAGE */
/* ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initScrollAnimations();
  initButtonInteractions();
  initInfoBoxes();
  initToolCards();
});

function initNavigation() {
  const btnMenu = document.getElementById("btn-menu");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".navbar-links a");

  btnMenu?.addEventListener("click", () => {
    navbar?.classList.toggle("active");
    btnMenu.style.background = navbar?.classList.contains("active")
      ? "rgba(0, 229, 255, 0.2)"
      : "none";
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbar?.classList.remove("active");
      if (btnMenu) btnMenu.style.background = "none";
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar-container")) {
      navbar?.classList.remove("active");
      if (btnMenu) btnMenu.style.background = "none";
    }
  });
}

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
    { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
  );

  document
    .querySelectorAll(".info-box, .intro-showcase, .comparison-section, .tools-grid, .tool-card")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
}

function initButtonInteractions() {
  const ctaButtons = document.querySelectorAll(".cta-button");

  ctaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const sectionId = button.getAttribute("data-section");
      if (sectionId) {
        const section = document.getElementById(sectionId);
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function initInfoBoxes() {
  const infoBoxes = document.querySelectorAll(".info-box");
  infoBoxes.forEach((box) => {
    box.addEventListener("mouseenter", () => {
      box.style.boxShadow = `0 0 30px rgba(0, 229, 255, 0.4), 
                             inset 0 0 30px rgba(0, 229, 255, 0.05)`;
    });
    box.addEventListener("mouseleave", () => {
      box.style.boxShadow = "";
    });
  });
}

function initToolCards() {
  const toolCards = document.querySelectorAll(".tool-card");
  toolCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.boxShadow = `0 0 25px rgba(29, 233, 182, 0.3), 
                             0 0 50px rgba(0, 229, 255, 0.2)`;
      card.style.transform = "translateY(-8px)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "";
      card.style.transform = "translateY(0)";
    });
  });
}
