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


    // Tarea 3 con comentarios y validaciones

    const avisoId = document.body.dataset.avisoId;
    if (!avisoId) return; // Salir si no estamos en una pagina de detalle

    const listaComentarios = document.getElementById('lista-comentarios');
    const formComentario = document.getElementById('form-comentario');
    const erroresDiv = document.getElementById('errores-comentario');
    const submitButton = document.getElementById('btn-agregar-comentario');

    // Crea un elemento DOM para un comentario {nombre, texto, fecha}

    function crearElementoComentario(comentario) {
    const div = document.createElement('div');
    div.classList.add('comentario-item');

    const header = document.createElement('p');
    header.classList.add('comentario-header');
    
    // Formatear la fecha
    const fecha = new Date(comentario.fecha).toLocaleString('es-CL');
    
    // Crear el elemento span para el nombre
    const nombreSpan = document.createElement('span');
    nombreSpan.classList.add('comentario-nombre'); // Clase para el CSS
    nombreSpan.textContent = comentario.nombre; // Sanitizado

    // 2. Insertar el span y el resto del texto
    // Ej: "El [fecha], [nombre] dijo:"
    header.appendChild(document.createTextNode(`El ${fecha}, `));
    header.appendChild(nombreSpan);
    header.appendChild(document.createTextNode(' dijo:'));


    const texto = document.createElement('p');
    texto.classList.add('comentario-texto');
    texto.textContent = comentario.texto;

    div.appendChild(header);
    div.appendChild(texto);
    return div;
    }

    // cargar y mostrar comentarios existentes

    async function cargarComentarios() {
        try {
            const response = await fetch(`/api/avisos/${avisoId}/comentarios`);
            if (!response.ok) throw new Error('Error al cargar comentarios');
            
            const comentarios = await response.json();
            
            listaComentarios.innerHTML = ''; // Limpiar
            if (comentarios.length === 0) {
                listaComentarios.innerHTML = '<p>No hay comentarios aún. ¡Sé el primero!</p>';
            } else {
                comentarios.forEach(c => {
                    listaComentarios.appendChild(crearElementoComentario(c));
                });
            }
        } catch (error) {
            console.error('Error en cargarComentarios:', error);
            listaComentarios.innerHTML = '<p>Error al cargar comentarios.</p>';
        }
    }

    // manejar el envio del formulario
    
    formComentario.addEventListener('submit', async (e) => {
        e.preventDefault(); // Detener envio normal
        erroresDiv.innerHTML = ''; // Limpiar errores
        submitButton.disabled = true;

        const nombre = formComentario.nombre.value.trim();
        const texto = formComentario.texto.value.trim();

        // Validacion lado cliente 
        let erroresCliente = [];
        if (nombre.length < 3 || nombre.length > 80) {
            erroresCliente.push('El nombre debe tener entre 3 y 80 caracteres.');
        }
        if (texto.length < 5) { 
            erroresCliente.push('El comentario debe tener al menos 5 caracteres.');
        }
        if (texto.length > 300) {
            erroresCliente.push('El comentario no puede exceder los 300 caracteres.');
        }
        if (erroresCliente.length > 0) {
            erroresDiv.innerHTML = erroresCliente.join('<br>');
            submitButton.disabled = false;
            return;
        }

        // Envio con fetch a Flask
        try {
            const response = await fetch(`/api/avisos/${avisoId}/comentarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, texto })
            });

            const result = await response.json();

            if (response.ok) { // Exito (status 201)
                // Agregar el nuevo comentario al inicio de la lista
                const nuevoComentarioEl = crearElementoComentario(result.comentario);
                // Si NO hay comentarios (solo tiene el mensaje), limpiarlo
                if (!listaComentarios.querySelector('.comentario-item')) {
                        listaComentarios.innerHTML = '';
                }
                listaComentarios.prepend(nuevoComentarioEl);
                formComentario.reset();

            } else { // Error de validacion del servidor (status 400) 
                erroresDiv.innerHTML = result.errors.join('<br>');
            }

        } catch (error) {
            console.error('Error en fetch POST:', error);
            erroresDiv.innerHTML = 'Error de conexión. Intente nuevamente.';
        } finally {
            submitButton.disabled = false;
        }
    });

    // Carga inicial de comentarios
    cargarComentarios();

});