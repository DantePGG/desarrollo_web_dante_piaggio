document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formAviso');
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    const fotosContainer = document.getElementById('fotosContainer');
    const btnAgregarFoto = document.getElementById('btnAgregarFoto');
    const redesContainer = document.getElementById('redesContainer');
    const btnAgregarRed = document.getElementById('btnAgregarRed');
    const fechaEntregaInput = document.getElementById('fechaEntrega');

    // Llenar select de regiones con datos de region_comuna.js
    region_comuna.regiones.forEach(region => {
        const option = document.createElement('option');
        option.value = region.nombre;
        option.textContent = region.nombre;
        regionSelect.appendChild(option);
    });

    // Llenar select de comunas segun la region seleccionada
    regionSelect.addEventListener('change', () => {
        comunaSelect.innerHTML = '<option value="">Seleccione...</option>';
        if (regionSelect.value) {
            comunaSelect.disabled = false;
            const regionSeleccionada = region_comuna.regiones.find(region => region.nombre === regionSelect.value);
            regionSeleccionada.comunas.forEach(comuna => {
                const option = document.createElement('option');
                option.value = comuna.nombre;
                option.textContent = comuna.nombre;
                comunaSelect.appendChild(option);
            });
        } else {
            comunaSelect.disabled = true;
        }
    });

    // Funcion para manejar la visibilidad del input de ID/URL y del botón de "Agregar otra red"
    function handleRedesVisibility() {
        const redesSelects = document.querySelectorAll('.redesSelect');
        const ultimoSelect = redesSelects[redesSelects.length - 1];
        const idRedContainer = ultimoSelect.nextElementSibling;
        
        // Muestra/oculta el input de ID de la red social
        if (ultimoSelect.value) {
            idRedContainer.style.display = 'block';
        } else {
            idRedContainer.style.display = 'none';
        }

        // Muestra/oculta el boton de agregar red si se ha seleccionado una red
        if (ultimoSelect.value && redesSelects.length < 5) {
            btnAgregarRed.style.display = 'block';
        } else {
            btnAgregarRed.style.display = 'none';
        }
    }

    // Manejar la visibilidad inicial del input de ID/URL y del boton
    const initialRedesSelect = document.getElementById('redes-0');
    initialRedesSelect.addEventListener('change', handleRedesVisibility);

    // Ocultar el botón de agregar al inicio, ya que no se ha seleccionado ninguna red
    btnAgregarRed.style.display = 'none';

    // Contador de redes
    let redesCount = 1;

    // Agregar otra red social dinamicamente
    btnAgregarRed.addEventListener('click', () => {
        if (redesCount < 5) {
            const newRedDiv = document.createElement('div');
            newRedDiv.innerHTML = `
                <label for="redes-${redesCount}">Contactar por:</label> 
                <select id="redes-${redesCount}" class="redesSelect">
                    <option value="">No contactar por otra red</option>
                    <option value="whatsapp">Whatsapp</option>
                    <option value="telegram">Telegram</option>
                    <option value="X">X</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">Tiktok</option>
                    <option value="otra">Otra</option>
                </select>
                <div class="idRedContainer" style="display:none;">
                    <input type="text" class="idRedInput" placeholder="ID o URL" minlength="4" maxlength="50">
                </div>
            `;
            redesContainer.appendChild(newRedDiv);
            
            const newRedesSelect = document.getElementById(`redes-${redesCount}`);
            newRedesSelect.addEventListener('change', handleRedesVisibility);
            
            redesCount++;
            handleRedesVisibility(); // Actualiza la visibilidad de los botones despues de agregar
        }
    });

    // Prellenar la fecha de entrega
    const ahora = new Date();
    const fechaPrellenada = new Date(ahora.getTime() + 3 * 60 * 60 * 1000);

    function fechaLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
    }


    fechaEntregaInput.value = fechaLocal(fechaPrellenada);

    // Agregar fotos dinamicamente
    btnAgregarFoto.addEventListener('click', () => {
        const fotosActuales = document.querySelectorAll('.fotoInput');
        if (fotosActuales.length < 5) {
            const nuevaFotoInput = document.createElement('input');
            nuevaFotoInput.type = 'file';
            nuevaFotoInput.className = 'fotoInput';
            nuevaFotoInput.accept = 'image/*';
            fotosContainer.appendChild(nuevaFotoInput);
            if (fotosActuales.length + 1 === 5) {
                btnAgregarFoto.style.display = 'none';
            }
        }
    });

    // VALIDACIONES
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let errores = [];

        // Validacion del "¿Donde?"
        if (!regionSelect.value) errores.push('La región es obligatoria.');
        if (!comunaSelect.value) errores.push('La comuna es obligatoria.');
        const sector = document.getElementById('sector').value;
        if (sector.length > 100) errores.push('El sector no puede exceder los 100 caracteres.');

        // Validacion de "¿Contacto de esta publicacion?"
        const nombre = document.getElementById('nombre').value;
        if (nombre.length < 3 || nombre.length > 200) errores.push('El nombre debe tener entre 3 y 200 caracteres.');
        const email = document.getElementById('email').value;
        // regex de un aux
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 100) errores.push('El email debe tener un formato válido y no exceder los 100 caracteres.');
        const celular = document.getElementById('celular').value;
        // regex pal celu
        const celularRegex = /^\+\d{3}\.\d{8,9}$/;
        if (celular && !celularRegex.test(celular)) errores.push('El celular debe tener el formato +NNN.NNNNNNNN.');

        // Validacion de las redes sociales
        const redesSelects = document.querySelectorAll('.redesSelect');
        redesSelects.forEach(select => {
            const input = select.nextElementSibling.querySelector('.idRedInput');
            if (select.value && (input.value.length < 4 || input.value.length > 50)) {
                errores.push('El ID o URL de la red social debe tener entre 4 y 50 caracteres.');
            }
        });

        // Validacion de "¿Que mascota ofrece?"
        if (!document.getElementById('tipo').value) errores.push('El tipo de mascota es obligatorio.');
        const cantidad = document.getElementById('cantidad').value;
        if (parseInt(cantidad) < 1 || !Number.isInteger(parseInt(cantidad))) errores.push('La cantidad debe ser un número entero mayor o igual a 1.');
        const edad = document.getElementById('edad').value;
        if (parseInt(edad) < 1 || !Number.isInteger(parseInt(edad))) errores.push('La edad debe ser un número entero mayor o igual a 1.');
        const fechaEntrega = new Date(fechaEntregaInput.value);
        if (fechaEntrega < fechaPrellenada) errores.push('La fecha de entrega debe ser mayor o igual a la fecha y hora prellenada.');
        const fotos = document.querySelectorAll('.fotoInput');
        let fotoValida = false;
        fotos.forEach(foto => {
            if (foto.files.length > 0) fotoValida = true;
        });
        if (!fotoValida) errores.push('Debe subir al menos una foto.');

        // Mostrar errores o continuar
        if (errores.length > 0) {
            alert('Por favor, corrige los siguientes errores:\n\n' + errores.join('\n'));
        } else {
            const confirmacion = confirm('¿Está seguro que desea agregar este aviso de adopción?');
            if (confirmacion) {
                alert('Hemos recibido la información de adopción, muchas gracias y suerte!');
                window.location.href = 'index.html';
            }
        }
    });
});