// URL base de la API Spring Boot (usamos ruta relativa ya que corre en el mismo servidor)
const API_BASE_URL = '/api/avisos';

document.addEventListener('DOMContentLoaded', () => {
    // Obtener todos los botones de evaluar
    const botonesEvaluar = document.querySelectorAll('.btn-evaluar');
    
    botonesEvaluar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            const avisoId = boton.getAttribute('data-aviso-id');
            evaluarAviso(avisoId);
        });
    });
});

// Solicita al usuario una nota y la envía al servidor Spring Boot de forma asíncrona
// @param {number} avisoId - ID del aviso a evaluar
function evaluarAviso(avisoId) {
    // Solicitar nota al usuario
    let nota = prompt('Ingrese una nota del 1 al 7 para este aviso:');
    
    // Validar que el usuario no canceló
    if (nota === null) {
        return; // Usuario canceló
    }
    
    // Convertir a número entero
    nota = parseInt(nota);
    
    // Validar que sea un número entero entre 1 y 7
    if (isNaN(nota) || nota < 1 || nota > 7 || !Number.isInteger(parseFloat(nota))) {
        alert('Error: La nota debe ser un número entero entre 1 y 7.');
        return;
    }
    
    // Enviar la nota al servidor Spring Boot usando fetch (asíncrono)
    fetch(`${API_BASE_URL}/${avisoId}/notas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valor: nota })
    })
    .then(response => {
        if (!response.ok) {
            // Si hay error del servidor, lanzar excepción
            return response.json().then(data => {
                throw new Error(data.error || 'Error al agregar la nota');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Actualizar el promedio en la interfaz
            actualizarPromedio(avisoId, data.promedio);
            alert('¡Nota agregada exitosamente!');
        } else {
            alert('Error: ' + (data.error || 'No se pudo agregar la nota'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al comunicarse con el servidor: ' + error.message);
    });
}

// Actualiza el promedio de notas en la interfaz
// @param {number} avisoId - ID del aviso
// @param {number} promedio - Nuevo promedio calculado
function actualizarPromedio(avisoId, promedio) {
    const celdaNota = document.getElementById(`nota-${avisoId}`);
    if (celdaNota) {
        if (promedio !== null && promedio !== undefined) {
            // Mostrar con un decimal
            celdaNota.textContent = promedio.toFixed(1);
        } else {
            celdaNota.textContent = '-';
        }
    }
}