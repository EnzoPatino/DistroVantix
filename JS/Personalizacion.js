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

let currentDistroSlide = 0;

function changeDistroSlide(direction) {
  const slides = document.querySelectorAll(".distro-slide");

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
}

/* ============================================ */
/* INICIALIZACIÓN                               */
/* ============================================ */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sistema de Distros DistroVantix cargado.");
});
