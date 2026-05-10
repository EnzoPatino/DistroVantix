let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function moveSlide(step) {
    if (slides.length === 0) return;
    
    // Quitamos la clase activa al actual
    slides[currentSlide].classList.remove('active');
    
    // Calculamos el siguiente índice
    currentSlide += step;

    // Si llegamos al final, volvemos al principio y viceversa
    if (currentSlide >= slides.length) { currentSlide = 0; }
    if (currentSlide < 0) { currentSlide = slides.length - 1; }

    // Agregamos la clase activa al nuevo
    slides[currentSlide].classList.add('active');
}

/* ============================================ */
/* LÓGICA DEL CARRUSEL DE DISTROS              */
/* ============================================ */

let currentDistroSlide = 0;
const distroSlides = document.querySelectorAll('.distro-slide');

function changeDistroSlide(direction) {
    if (distroSlides.length === 0) return;

    // Quitamos la clase active del slide actual
    distroSlides[currentDistroSlide].classList.remove('active');
    
    // Calculamos el nuevo índice
    currentDistroSlide += direction;
    
    // Si llegamos al final, volvemos al principio
    if (currentDistroSlide >= distroSlides.length) {
        currentDistroSlide = 0;
    }
    
    // Si estamos al principio y vamos para atrás, vamos al último
    if (currentDistroSlide < 0) {
        currentDistroSlide = distroSlides.length - 1;
    }
    
    // Activamos el nuevo slide
    distroSlides[currentDistroSlide].classList.add('active');
}

/* ============================================ */
/* INICIALIZACIÓN                               */
/* ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sector Desarrollo y Animación cargado.");
});
