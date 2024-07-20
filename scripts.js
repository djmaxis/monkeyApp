document.addEventListener("DOMContentLoaded", () => {
    const productoBusqueda = document.getElementById("productoBusqueda");
    const productosSelect = document.getElementById("productos");
    const comandaForm = document.getElementById("comandaForm");
    const comandaTable = document.getElementById("comandaTable").getElementsByTagName("tbody")[0];
    const mesaInput = document.getElementById("mesa");
    const enviarComandaButton = document.getElementById("enviarComanda");
    const nuevaComandaButton = document.getElementById("nuevaComanda");
    const validacionUsuario = document.getElementById("validacionUsuario");
    const usuarioForm = document.getElementById("usuarioForm");
    const usuarioBusqueda = document.getElementById("usuarioBusqueda");
    const passwordInput = document.getElementById("password");
    const closeModal = document.querySelectorAll(".close");
    const copiasComanda = document.getElementById("copiasComanda");
    const copiasForm = document.getElementById("copiasForm");
    const numCopiasSelect = document.getElementById("numCopias");
    const errorMessage = document.getElementById("error-message");

    let productos = []; // Almacenar productos cargados
    let usuarios = []; // Almacenar usuarios y contraseñas cargados

    // Función para cargar productos desde el archivo de texto
    function cargarProductos() {
        fetch("productos.txt")
            .then(response => response.text())
            .then(data => {
                productos = data.split("\n").map(producto => producto.trim()).filter(producto => producto !== "");
            })
            .catch(error => console.error("Error al cargar los productos:", error));
    }

    // Función para cargar usuarios desde el archivo de texto
    function cargarUsuarios() {
        fetch("usuarios.txt")
            .then(response => response.text())
            .then(data => {
                usuarios = data.split("\n").map(linea => {
                    const [usuario, contrasena] = linea.trim().split(" ");
                    return { usuario, contrasena };
                });
            })
            .catch(error => console.error("Error al cargar los usuarios:", error));
    }

    // Función para mostrar productos en la lista
    function mostrarProductos(productos) {
        productosSelect.innerHTML = '';
        productos.forEach(producto => {
            const option = document.createElement("option");
            option.value = producto;
            option.textContent = producto;
            productosSelect.appendChild(option);
        });
        productosSelect.classList.add('show');
    }

    // Limpiar todos los campos al iniciar la página
    function limpiarCampos() {
        productoBusqueda.value = '';
        productoBusqueda.classList.remove('error');
        productosSelect.classList.remove('show');
    }

    // Cargar productos al iniciar la página y limpiar campos
    cargarProductos();
    cargarUsuarios();
    limpiarCampos();

    // Convertir caracteres a mayúsculas en el campo de usuario
    usuarioBusqueda.addEventListener("input", () => {
        usuarioBusqueda.value = usuarioBusqueda.value.toUpperCase();
    });

    // Filtrar productos según el texto ingresado y mostrar la lista
    productoBusqueda.addEventListener("input", () => {
        const searchTerm = productoBusqueda.value.toLowerCase();
        if (searchTerm.length >= 1) { // Mostrar solo si hay una o más letras
            const filteredOptions = productos.filter(producto => producto.toLowerCase().includes(searchTerm));
            if (filteredOptions.length > 0) {
                mostrarProductos(filteredOptions);
            } else {
                productosSelect.classList.remove('show');
            }
        } else {
            productosSelect.classList.remove('show');
        }
    });

    // Seleccionar producto de la lista y ocultar la lista
    productosSelect.addEventListener("click", (event) => {
        if (event.target.tagName === 'OPTION') {
            productoBusqueda.value = event.target.value;
            productosSelect.classList.remove('show');
            productoBusqueda.classList.remove('error');
        }
    });

    // Ocultar la lista de productos cuando se hace clic fuera del campo de búsqueda
    document.addEventListener("click", (event) => {
        if (!productoBusqueda.contains(event.target) && !productosSelect.contains(event.target)) {
            productosSelect.classList.remove('show');
        }
    });

    // Función para agregar comanda a la tabla
    function agregarComanda(cantidad, producto) {
        // Verificar si el producto ya está en la tabla
        let existente = false;
        for (let row of comandaTable.rows) {
            if (row.cells[1].innerText === producto) {
                let nuevaCantidad = parseInt(row.cells[0].innerText) + parseInt(cantidad);
                row.cells[0].innerText = nuevaCantidad;
                existente = true;
                break;
            }
        }
        
        // Si no está en la tabla, agregar una nueva fila
        if (!existente) {
            let row = comandaTable.insertRow();
            row.insertCell(0).innerText = cantidad;
            row.insertCell(1).innerText = producto;
            let deleteCell = row.insertCell(2);
            let deleteButton = document.createElement("button");
            deleteButton.innerText = "[x]";
            deleteButton.classList.add("delete-button");
            deleteButton.onclick = function() {
                comandaTable.deleteRow(row.rowIndex - 1);
            };
            deleteCell.appendChild(deleteButton);
        }
    }

    // Al presionar el botón "Agregar Comanda", limpiar y enfocar el campo de búsqueda
    comandaForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const cantidad = document.getElementById("cant").value;
        const producto = productoBusqueda.value;

        // Verificar si hay un producto seleccionado
        if (!producto || !productos.includes(producto)) {
            productoBusqueda.classList.add('error');
            productoBusqueda.focus();
        } else {
            agregarComanda(cantidad, producto);
            limpiarCampos();
            productoBusqueda.focus();
        }
    });

    // Al presionar el botón "Enviar Comanda"
    enviarComandaButton.addEventListener("click", () => {
        const mesa = mesaInput.value;
        const producto = productoBusqueda.value;

        if (!mesa) {
            alert('No hay datos de mesa.');
            mesaInput.focus();
            return;
        }

        if (comandaTable.rows.length === 0) {
            alert('No hay datos agregados a la comanda.');
            return;
        }

        if (producto !== '') {
            const confirmacion = confirm('Tienes un producto escrito pero no agregado. ¿Quieres agregarlo?');
            if (!confirmacion) {
                return;
            } else {
                agregarComanda(document.getElementById("cant").value, producto);
                limpiarCampos();
            }
        }

        // Limpiar y enfocar el campo de búsqueda de usuarios
        usuarioBusqueda.value = '';
        usuarioBusqueda.focus();

        // Mostrar ventana de validación de usuario
        cargarUsuarios(); // Cargar usuarios al mostrar el modal
        validacionUsuario.style.display = "block";
    });

    // Cerrar los modales
    closeModal.forEach(button => button.onclick = function() {
        validacionUsuario.style.display = "none";
        copiasComanda.style.display = "none";
    });

    // Cerrar el modal si se hace clic fuera de él
    window.onclick = function(event) {
        if (event.target == validacionUsuario) {
            validacionUsuario.style.display = "none";
        } else if (event.target == copiasComanda) {
            copiasComanda.style.display = "none";
        }
    }

    // Validar usuario
    usuarioForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const usuario = usuarioBusqueda.value;
        const password = passwordInput.value;

        // Limpiar mensaje de error
        errorMessage.textContent = '';

        // Verificar la combinación de usuario y contraseña
        const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.contrasena === password);
        if (!usuarioEncontrado) {
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
            passwordInput.value = ''; // Borrar el campo de contraseña
            passwordInput.focus();
            return;
        }

        // Limpiar el campo de contraseña
        passwordInput.value = '';

        // Ocultar el modal de validación de usuario y mostrar el modal de selección de copias
        validacionUsuario.style.display = "none";
        copiasComanda.style.display = "block";
    });

    // Enviar comanda y generar documento imprimible
    copiasForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const numCopias = numCopiasSelect.value;
        const mesa = mesaInput.value;
        const fecha = new Date().toLocaleString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).replace(",", "").replace(" ", ", ");
        const usuario = usuarioBusqueda.value;

        let comandaHTML = `
            <div style="width: 3.125in; font-family: Arial, sans-serif;">
                <p>Fecha: ${fecha}</p>
                <p>Usuario: ${usuario}</p>
                <p>MESA: ${mesa}</p>
                <p>PRODUCTOS DE LA COMANDA:</p>
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Cant</th>
                            <th style="text-align: left;">Producto</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (let row of comandaTable.rows) {
            comandaHTML += `
                        <tr>
                            <td>${row.cells[0].innerText}</td>
                            <td>${row.cells[1].innerText}</td>
                        </tr>
            `;
        }

        comandaHTML += `
                    </tbody>
                </table>
                <p style="margin-bottom: 60px;"></p> <!-- 4 saltos de línea -->
            </div>
        `;

        const ventanaImpresion = window.open('', '', 'height=600,width=800');
        ventanaImpresion.document.write('<html><head><title>Comanda</title></head><body>');
        for (let i = 0; i < numCopias; i++) {
            ventanaImpresion.document.write(comandaHTML);
            if (i < numCopias - 1) {
                ventanaImpresion.document.write('<hr style="page-break-after: always;">');
            }
        }
        ventanaImpresion.document.write('</body></html>');
        ventanaImpresion.document.close();
        ventanaImpresion.print();

        // Ocultar el modal de selección de copias
        copiasComanda.style.display = "none";
    });

    // Nueva Comanda
    nuevaComandaButton.addEventListener("click", () => {
        const confirmacion = prompt("Desear crear nueva comanda, recuerda que se perderan los datos que ya tienes agregado, estas de acuerdo? Escribe 'Si' para confirmar.");
        if (confirmacion && confirmacion.toLowerCase() === 'si') {
            location.reload();
        } else {
            alert("Tienes que escribir 'Si' para confirmar que quieres una nueva comanda. Recuerda que se eliminarán los datos.");
        }
    });
});
