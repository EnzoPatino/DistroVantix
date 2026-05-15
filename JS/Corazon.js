const btn = document.getElementById("btnDibujar");
const canvas = document.getElementById("canvasCorazon");
const ctx = canvas.getContext("2d");

// Función matemática idéntica a tu código de Python
function obtenerCoordenadasCorazon(n) {
  const x = 16 * Math.pow(Math.sin(n), 3);
  const y =
    13 * Math.cos(n) -
    5 * Math.cos(2 * n) -
    2 * Math.cos(3 * n) -
    Math.cos(4 * n);
  return { x, y };
}

// Función auxiliar para crear una pausa (simula la velocidad de Turtle)
// Milisegundos de pausa. Menor número = más rápido.
const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Función asíncrona para permitir la animación con pausas
async function dibujarSecuenciaCorazon() {
  // 1. Configuración inicial y limpieza
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  // Centrar el origen (como en Turtle)
  ctx.translate(canvas.width / 2, canvas.height / 2);
  // Invertir el eje Y para que apunte hacia arriba
  ctx.scale(1, -1);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.lineCap = "round"; // Bordes suaves

  const velocidadDibujo = 1; // ms de pausa entre puntos de cada capa.

  // 2. El bucle de las 1 capa, pero animado por puntos
  for (let i = 0; i < 15; i++) {
    // Iniciamos un nuevo trazo para cada capa
    ctx.beginPath();
    ctx.moveTo(0, 0);

    // Dibujamos los puntos de la forma del corazón
    for (let n = 0; n < 100; n += 2) {
      const pos = obtenerCoordenadasCorazon(n / 10);

      // Calculamos la posición final con la escala de la capa 'i'
      const finalX = pos.x * i;
      const finalY = pos.y * i;

      ctx.lineTo(finalX, finalY);

      // Dibujamos la línea *hasta este punto*
      ctx.stroke();

      // Pequeña pausa para ver cómo se une el punto actual al anterior
      await pausa(velocidadDibujo);
    }

    // Pequeña pausa adicional al finalizar cada una de las 15 capas
    await pausa(20);
  }

  // 3. Restaurar el estado del canvas y reactivar el botón
  ctx.restore();
  btn.disabled = false;
  btn.innerText = "Recomenzar Animación";

  // 4. Mostrar el mensaje de finalización
  const mensaje = document.getElementById("mensajeFinal");
  mensaje.classList.add("visible");
}

// Evento del botón
btn.addEventListener("click", () => {
  // Desactivamos el botón durante la animación
  btn.disabled = true;
  btn.innerText = "Dibujando...";
  dibujarSecuenciaCorazon();
});
