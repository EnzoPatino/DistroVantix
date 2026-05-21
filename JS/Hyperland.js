/* ============================================ */
/* JAVASCRIPT INTERACTIVO PARA HYPRLAND PAGE    */
/* ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initScrollAnimations();
  initButtonInteractions();
  initInfoBoxes();
});

function initNavigation() {
  const btnMenu = document.getElementById("btn-menu");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".navbar-links a");

  btnMenu?.addEventListener("click", () => {
    navbar?.classList.toggle("active");
    btnMenu.style.background = navbar?.classList.contains("active")
      ? "rgba(0, 242, 255, 0.2)"
      : "none";
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbar?.classList.remove("active");
      if (btnMenu) btnMenu.style.background = "none";
    });
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
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  document
    .querySelectorAll(".info-box, .intro-showcase, .comparison-section")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
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
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}

function initInfoBoxes() {
  const infoBoxes = document.querySelectorAll(".info-box");

  infoBoxes.forEach((box) => {
    box.addEventListener("mouseenter", () => {
      box.style.boxShadow = `0 0 30px rgba(0, 242, 255, 0.3)`;
    });

    box.addEventListener("mouseleave", () => {
      box.style.boxShadow = "";
    });
  });
}

console.log("Hyprland page features initialized 🚀");
