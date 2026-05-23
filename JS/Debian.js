/* ============================================ */
/* JAVASCRIPT INTERACTIVO PARA DEBIAN PAGE      */
/* ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const debianColor = "rgba(168, 0, 48, 0.4)";

  initNavigation(debianColor);
  initScrollAnimations();
  initButtonInteractions();
  initInfoBoxes(debianColor);
  initResponsiveBodyState();

  console.log("Debian page loaded with interactive features");
});

function initNavigation(color) {
  const btnMenu = document.getElementById("btn-menu");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".navbar-links a");

  btnMenu?.addEventListener("click", () => {
    navbar?.classList.toggle("active");
    btnMenu.style.background = navbar?.classList.contains("active")
      ? color.replace("0.4", "0.2")
      : "none";
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbar?.classList.remove("active");
      if (btnMenu) {
        btnMenu.style.background = "none";
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".navbar-container")) {
      navbar?.classList.remove("active");
      if (btnMenu) {
        btnMenu.style.background = "none";
      }
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
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    },
  );

  document
    .querySelectorAll(".info-box, .intro-showcase, .comparison-section, .tools-grid, .tool-card")
    .forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(30px)";
      element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(element);
    });
}

function initButtonInteractions() {
  const ctaButtons = document.querySelectorAll(".cta-button");

  ctaButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add("ripple");

      button.appendChild(ripple);

      const sectionId = button.getAttribute("data-section");
      if (sectionId) {
        const section = document.getElementById(sectionId);
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => ripple.remove(), 600);
    });
  });
}

function initInfoBoxes(color) {
  const infoBoxes = document.querySelectorAll(".info-box");

  infoBoxes.forEach((box, index) => {
    box.style.animationDelay = `${index * 0.1}s`;

    box.addEventListener("mouseenter", () => {
      box.style.boxShadow = `0 0 30px ${color}, inset 0 0 30px ${color.replace("0.4", "0.05")}`;
    });

    box.addEventListener("mouseleave", () => {
      box.style.boxShadow = "";
    });
  });
}

function initResponsiveBodyState() {
  const updateMobileClass = () => {
    document.body.classList.toggle("mobile", window.innerWidth <= 768);
  };

  updateMobileClass();
  window.addEventListener("resize", updateMobileClass);
}
