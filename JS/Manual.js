let currentSpread = 0;
const spreads = document.querySelectorAll(".spread");
let totalPages = spreads.length;

// Función para ABRIR el libro
function openBook() {
  document.getElementById("closed-folder").style.display = "none";
  document.getElementById("main-content").style.display = "flex";
  updatePageIndicator();
}

// Función para CERRAR el libro
function closeBook() {
  document.getElementById("main-content").style.display = "none";
  document.getElementById("closed-folder").style.display = "flex";

  spreads[currentSpread].classList.remove("active");
  currentSpread = 0;
  spreads[currentSpread].classList.add("active");
}

// Navegación de páginas
function movePage(direction) {
  spreads[currentSpread].classList.remove("active");

  currentSpread += direction;

  if (currentSpread < 0) {
    currentSpread = 0;
  } else if (currentSpread >= spreads.length) {
    currentSpread = spreads.length - 1;
  }

  spreads[currentSpread].classList.add("active");
  updatePageIndicator();
}

// Actualizar indicador de página
function updatePageIndicator() {
  const indicator = document.getElementById("page-indicator");
  if (indicator) {
    indicator.textContent = `${currentSpread} / ${totalPages - 1}`;
  }
}
