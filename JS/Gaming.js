let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function moveSlide(step) {
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