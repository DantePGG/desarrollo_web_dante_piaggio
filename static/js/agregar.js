/* Archivo: static/js/agregar.js (Versión Corregida) */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formAviso');
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    const fotosContainer = document.getElementById('fotosContainer');
    const btnAgregarFoto = document.getElementById('btnAgregarFoto');
    const redesContainer = document.getElementById('redesContainer');
    const btnAgregarRed = document.getElementById('btnAgregarRed');
    const fechaEntregaInput = document.getElementById('fechaEntrega');

    // Constantes para la logica de regiones/comunas
    const API_REGIONES_URL = '/api/regiones';
    let comunasPorRegion = {};
    let allRegiones = [];
    
    // Contador para los identificadores de redes (en teoria ya no se usa pero no quiero borrarlo)
    let contadorRedes = redesContainer.querySelectorAll('.redes-group-item').length - 1; 

    // ACA TENGO LOS ARREGLOS CON LOS BUGS DE REDES

    /**
     * Muestra/oculta el input de ID/URL correspondiente a la red seleccionada
     * @param {HTMLSelectElement} selectElement selectElement El select que disparo el cambio.
     */
    function handleRedesVisibility(selectElement) {
        // Busca el elemento .idRedContainer dentro del mismo .redes-group-item
        // Usamos .closest() para encontrar el ancestro común (.redes-group-item)
        const itemGroup = selectElement.closest('.redes-group-item'); 
        if (!itemGroup) return; // Salir si no encuentra el contenedor

        // El idRedContainer es el que contiene el input
        const idRedContainer = itemGroup.querySelector('.idRedContainer');
        const idRedInput = idRedContainer ? idRedContainer.querySelector('.idRedInput') : null;

        if (!idRedContainer || !idRedInput) return; // Salir si no encuentra el input

        // Si el valor del select es vacío ("" = "No contactar por otra red")
        if (selectElement.value === "") { 
            idRedContainer.style.display = 'none';
            idRedInput.removeAttribute('required');
            idRedInput.value = ''; // Limpiar el valor
        } else {
            idRedContainer.style.display = 'block';
            idRedInput.setAttribute('required', 'required');
        }
    }
    
    /**
     * Crea un nuevo grupo de selección de red social y su campo de ID/URL.
     * @param {number} index El índice para los atributos name/id (e.g., redes-1, idRed-1).
     * @returns {HTMLElement} El div que contiene el nuevo grupo.
     */
    function createRedesGroup(index) {
        const div = document.createElement('div');
        div.classList.add('redes-group-item'); // Wrapper para un manejo más limpio
        
        // 1. Label
        const label = document.createElement('label');
        label.setAttribute('for', `redes-${index}`);
        label.textContent = `Contactar por (Opción ${index + 1}):`;

        // 2. Select (Red Social)
        const select = document.createElement('select');
        select.id = `redes-${index}`;
        select.classList.add('redesSelect');
        select.name = `redes-${index}`; // Name para Flask
        select.innerHTML = `
            <option value="">No contactar por otra red</option>
            <option value="whatsapp">Whatsapp</option>
            <option value="telegram">Telegram</option>
            <option value="X">X (Twitter)</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">Tiktok</option>
            <option value="otra">Otra</option>
        `;
        
        // 3. Container (ID/URL Input) - **DEBE SER EL SIBLING INMEDIATO DEL SELECT**
        const idRedContainer = document.createElement('div');
        idRedContainer.classList.add('idRedContainer');
        idRedContainer.style.display = 'none'; // Inicialmente oculto

        // 4. Input (ID/URL)
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('idRedInput');
        input.name = `idRed-${index}`; // Name para Flask
        input.placeholder = 'ID o URL de la red';
        input.minLength = 4;
        input.maxLength = 150; 
        
        // 5. Botón de Eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('btn-eliminar-red');
        // Usa una función que navega al elemento padre para eliminar el grupo
        btnEliminar.onclick = () => div.remove();
        
        // 6. Montar los elementos en el DOM
        idRedContainer.appendChild(input);
        
        div.appendChild(label);
        div.appendChild(select);
        div.appendChild(idRedContainer); 
        div.appendChild(btnEliminar);
        
        // Agregar el listener al nuevo select
        select.addEventListener('change', (e) => handleRedesVisibility(e.target));
        
        return div;
    }


    // --- Lógica de Comunas/Regiones ---

    /** Obtiene y carga las regiones iniciales en el select */
    async function loadRegiones() {
        try {
            const response = await fetch(API_REGIONES_URL);
            if (!response.ok) throw new Error('Error al cargar la API de regiones.');
            
            allRegiones = await response.json();
            
            allRegiones.forEach(region => {
                // Almacenar las comunas para un acceso rápido
                comunasPorRegion[region.id] = region.comunas; 
                
                const option = document.createElement('option');
                option.value = region.id; // Usamos el ID para Flask (más robusto)
                option.textContent = region.nombre;
                regionSelect.appendChild(option);
            });

            // Forzar el evento 'change' si ya hay un valor seleccionado (por recarga de Flask con errores)
            if (regionSelect.value) {
                regionSelect.dispatchEvent(new Event('change'));
            }
            
        } catch (error) {
            console.error("Error en loadRegiones:", error);
        }
    }
    
    // Evento para cargar comunas al seleccionar una región
    regionSelect.addEventListener('change', () => {
        comunaSelect.innerHTML = '<option value="">Seleccione...</option>';
        comunaSelect.disabled = true;

        const regionId = parseInt(regionSelect.value); 
        
        if (regionId && comunasPorRegion[regionId]) {
            comunaSelect.disabled = false;
            comunasPorRegion[regionId].forEach(comuna => {
                const option = document.createElement('option');
                option.value = comuna.id; // Usamos el ID para Flask (más robusto)
                option.textContent = comuna.nombre;
                comunaSelect.appendChild(option);
            });
        }
    });


    // --- Inicialización y Eventos ---
    
    // 1. Inicializar la visibilidad de redes al cargar la página (FIX)
    const redesSocialesSelects = document.querySelectorAll('.redesSelect');

    redesSocialesSelects.forEach(select => {
        // Inicializar la visibilidad
        handleRedesVisibility(select); 
        // Agregar el listener para futuros cambios
        select.addEventListener('change', (e) => handleRedesVisibility(e.target));
    });


    // 2. Evento para agregar otra red
    btnAgregarRed.addEventListener('click', () => {
        // Obtenemos el nuevo índice basado en cuántos grupos ya existen
        const nextIndex = redesContainer.querySelectorAll('.redes-group-item').length; 
        const newGroup = createRedesGroup(nextIndex);
        redesContainer.appendChild(newGroup);
    });

    // 3. Evento para agregar otra foto
    btnAgregarFoto.addEventListener('click', () => {
        const div = document.createElement('div');
        div.classList.add('foto-group-item');
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.classList.add('fotoInput');
        fileInput.name = 'foto[]'; // Importante para Flask
        fileInput.accept = 'image/*';
        
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar foto';
        btnEliminar.classList.add('btn-eliminar-foto');
        btnEliminar.onclick = () => div.remove();
        
        div.appendChild(document.createTextNode('Fotos: '));
        div.appendChild(fileInput);
        div.appendChild(btnEliminar);
        
        fotosContainer.appendChild(div);
    });
    
    // --- Lógica de Fecha (Pre-llenado y Mínimo) ---

    // Pre-llenar fecha de entrega con la hora actual + 1 minuto
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); 

    // Formatear a 'YYYY-MM-DDTHH:MM'
    const pad = (num) => String(num).padStart(2, '0');
    const fechaPrellenadaString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    // Solo asignar si el campo no tiene un valor (ej: no hubo error de POST)
    if (!fechaEntregaInput.value) {
        fechaEntregaInput.value = fechaPrellenadaString;
    }
    
    fechaEntregaInput.min = fechaPrellenadaString; 
    const fechaPrellenada = new Date(fechaPrellenadaString);

    
    // --- Lógica de Validación (Cliente) ---

    form.addEventListener('submit', (e) => {
        const errores = [];

        // 1. Validaciones de Dónde
        if (!regionSelect.value) errores.push('La región es obligatoria.');
        if (!comunaSelect.value) errores.push('La comuna es obligatoria.');
        const sector = document.getElementById('sector').value.trim();
        if (sector.length > 0 && sector.length < 3) errores.push('El sector debe tener 3 o más caracteres o estar vacío.');
        
        // 2. Validaciones de Contacto
        const nombre = document.getElementById('nombre').value.trim();
        if (nombre.length < 3 || nombre.length > 200) errores.push('El nombre debe tener entre 3 y 200 caracteres.');
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) errores.push('El formato del email es inválido.');
        
        const celular = document.getElementById('celular').value.trim();
        const celularRegex = /^\+569\.\d{8}$/; // Formato +569.12345678
        if (celular && !celularRegex.test(celular)) errores.push('El formato del celular es inválido. Debe ser +569.12345678.');
        
        // Validar redes sociales (se confía en 'required' pero verificamos para el alert)
        const redesSeleccionadas = document.querySelectorAll('.redesSelect');
        redesSeleccionadas.forEach(select => {
            if (select.value) { // Si se ha seleccionado una red
                const itemGroup = select.closest('.redes-group-item');
                const idRedInput = itemGroup ? itemGroup.querySelector('.idRedInput') : null;
                
                if (idRedInput && !idRedInput.value.trim()) {
                     errores.push(`Debe ingresar el identificador para la red social: ${select.value}`);
                }
            }
        });
        
        // 3. Validaciones de Mascota
        if (!document.getElementById('tipo').value) errores.push('El tipo de mascota es obligatorio.');
        const cantidad = document.getElementById('cantidad').value;
        if (parseInt(cantidad) < 1 || !Number.isInteger(parseInt(cantidad))) errores.push('La cantidad debe ser un número entero mayor o igual a 1.');
        const edad = document.getElementById('edad').value;
        if (parseInt(edad) < 1 || !Number.isInteger(parseInt(edad))) errores.push('La edad debe ser un número entero mayor o igual a 1.');
        
        // Validación de fecha
        const fechaEntregaDate = new Date(fechaEntregaInput.value);
        if (fechaEntregaInput.value === '') {
             errores.push('La fecha de entrega es obligatoria.');
        } else if (fechaEntregaDate < fechaPrellenada) {
            errores.push('La fecha de entrega debe ser posterior a la fecha y hora actual.');
        }
        
        // Validación de fotos
        const fotos = document.querySelectorAll('.fotoInput');
        let fotoValida = false;
        fotos.forEach(foto => {
            if (foto.files.length > 0) fotoValida = true;
        });
        if (!fotoValida) errores.push('Debe subir al menos una foto.');
        
        
        // Detener el submit si hay errores de validación
        if (errores.length > 0) {
            e.preventDefault(); 
            alert('Por favor, corrige los siguientes errores:\n\n' + errores.join('\n'));
        } else {
             // Confirmación para el submit a Flask
             const confirmacion = confirm('¿Está seguro que desea agregar este aviso de adopción?');
             if (!confirmacion) {
                 e.preventDefault(); // Detener el submit si el usuario cancela
             }
        }
    });

    // Cargar las regiones al inicio
    loadRegiones(); 
});