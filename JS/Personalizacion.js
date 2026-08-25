let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function moveSlide(step) {
  // Quitamos la clase activa al actual
  slides[currentSlide].classList.remove("active");

  // Calculamos el siguiente índice
  currentSlide += step;

  // Si llegamos al final, volvemos al principio y viceversa
  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }
  if (currentSlide < 0) {
    currentSlide = slides.length - 1;
  }

  // Agregamos la clase activa al nuevo
  slides[currentSlide].classList.add("active");
}

/* ============================================ */
/* LÓGICA DEL CARRUSEL DE DISTROS (2 POR SLIDE) */
/* ============================================ */

// Índice actual independiente por carrusel (clave = selector de slides)
const carouselIndices = {};

function changeDistroSlide(direction, selector = ".distro-slide") {
  const slides = document.querySelectorAll(selector);

  if (slides.length === 0) {
    return;
  }

  // Cada carrusel mantiene su propio índice
  if (!(selector in carouselIndices)) {
    carouselIndices[selector] = 0;
  }
  let currentDistroSlide = carouselIndices[selector];

  // Quitamos la clase active del slide actual
  slides[currentDistroSlide].classList.remove("active");

  // Calculamos el nuevo índice
  currentDistroSlide += direction;

  // Si llegamos al final, volvemos al principio
  if (currentDistroSlide >= slides.length) {
    currentDistroSlide = 0;
  }

  // Si estamos al principio y vamos para atrás, vamos al último
  if (currentDistroSlide < 0) {
    currentDistroSlide = slides.length - 1;
  }

  // Activamos el nuevo slide
  slides[currentDistroSlide].classList.add("active");

  // Guardamos el índice del carrusel usado
  carouselIndices[selector] = currentDistroSlide;
}

/* ============================================ */
/* INICIALIZACIÓN                               */
/* ============================================ */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sistema de Distros DistroVantix cargado.");
});

/* ============================================ */
/* TABS DE SHELLS & DOTFILES                    */
/* ============================================ */
function switchTab(tabName) {
  // Desactivar todas las tabs y contenidos
  document.querySelectorAll(".shells-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".shells-tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // Activar la tab clickeada
  event.currentTarget.classList.add("active");

  // Activar el contenido correspondiente
  const target = document.getElementById("tab-" + tabName);
  if (target) {
    target.classList.add("active");
  }
}
