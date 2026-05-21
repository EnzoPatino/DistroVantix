/**
 * Lógica específica para la sección de Computación Gráfica
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("Sección de Computación Gráfica cargada correctamente.");
    
    // Aquí se podrían añadir animaciones específicas para mostrar capacidades gráficas
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
});
