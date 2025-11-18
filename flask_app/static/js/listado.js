/* Solo un evento que cuando se haga click pase al html de detelle*/
document.addEventListener('DOMContentLoaded', () => {
    const filas = document.querySelectorAll('#tablaListado tbody tr');
    
    filas.forEach(fila => {
        fila.addEventListener('click', () => {
            window.location.href = 'detalle.html';
        });
    });
});