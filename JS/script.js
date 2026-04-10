document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('btn-menu');
    const sidebar = document.getElementById('sidebar');

    // Abre y cierra el sidebar al hacer click en el botón
    boton.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Cierra el sidebar si se hace click fuera de él
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !boton.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Cierra el sidebar cuando se hace click en un botón de categoría
    const botonesCat = document.querySelectorAll('.cat-btn');
    botonesCat.forEach(btn => {
        btn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    });
});