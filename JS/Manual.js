let currentSpread = 0;
const spreads = document.querySelectorAll(".spread");

// Función para ABRIR el libro
function openBook() {
  document.getElementById("closed-folder").style.display = "none";
  document.getElementById("main-content").style.display = "flex";
}

// Función para CERRAR el libro
function closeBook() {
  document.getElementById("main-content").style.display = "none";
  document.getElementById("closed-folder").style.display = "flex";

  // Reiniciar a la portada interna
  spreads[currentSpread].classList.remove("active");
  currentSpread = 0;
  spreads[currentSpread].classList.add("active");
}

// Navegación de páginas
function movePage(direction) {
  // Quitar clase activa a la actual
  spreads[currentSpread].classList.remove("active");

  // Calcular nueva página
  currentSpread += direction;

  // Evitar salir de los límites
  if (currentSpread < 0) {
    currentSpread = 0;
  } else if (currentSpread >= spreads.length) {
    currentSpread = spreads.length - 1;
  }

  // Mostrar la nueva página
  spreads[currentSpread].classList.add("active");
}