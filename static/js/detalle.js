document.addEventListener('DOMContentLoaded', () => {
    const visor = document.getElementById('visor');
    const imgGrande = document.getElementById('imgGrande');
    const btnCerrarVisor = document.getElementById('cerrarVisor');
    const fotosMini = document.querySelectorAll('.mini');

    // Evento para mostrar la imagen grande al hacer clic en la miniatura
    fotosMini.forEach(foto => {
        foto.addEventListener('click', (e) => {
            imgGrande.src = e.target.src;
            visor.style.display = 'flex'; // flex para que se puedan centrar
        });
    });

    // Evento para cerrar el visor
    btnCerrarVisor.addEventListener('click', () => {
        visor.style.display = 'none';
    });
});