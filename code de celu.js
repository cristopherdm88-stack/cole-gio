const CORREO_CONTACTO = "tu-correo@ejemplo.com"; // <-- cambia esto por tu correo real

/* ===== MENÚ MÓVIL ===== */
const menuBoton = document.getElementById("menuBoton");
const menu = document.getElementById("menu");

function cerrarMenu() {
    menu.classList.remove("abierto");
    menuBoton.setAttribute("aria-expanded", "false");
    menuBoton.setAttribute("aria-label", "Abrir menú");
}

menuBoton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    menuBoton.setAttribute("aria-expanded", String(abierto));
    menuBoton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", cerrarMenu));

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("abierto")) {
        cerrarMenu();
        menuBoton.focus();
    }
});

/* ===== SKELETON (solo al pulsar el botón) ===== */
const skeletons = document.getElementById("skeletons");
const contenedorTarjetas = document.getElementById("tarjetasAmenazas");
const tarjetas = document.querySelectorAll(".tarjeta");
const repetir = document.getElementById("repetirSkeleton");
let temporizador;

repetir.addEventListener("click", () => {
    clearTimeout(temporizador);
    mostrarTodas();
    resultado.textContent = "";
    buscador.value = "";

    skeletons.classList.remove("oculto");
    contenedorTarjetas.classList.add("oculto");
    contenedorTarjetas.setAttribute("aria-busy", "true");
    location.hash = "#amenazas"; // las amenazas están en la sección Inicio

    temporizador = setTimeout(() => {
        skeletons.classList.add("oculto");
        contenedorTarjetas.classList.remove("oculto");
        contenedorTarjetas.setAttribute("aria-busy", "false");
    }, 1200);
});

/* ===== BUSCADOR (con skeleton mientras se actualizan los resultados) ===== */
const buscador = document.getElementById("buscador");
const buscarBtn = document.getElementById("buscarBtn");
const resultado = document.getElementById("resultadoBusqueda");
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

// Quita tildes y mayúsculas; "contrasena" también encuentra "contraseña"
const simplificar = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function mostrarTodas() {
    tarjetas.forEach((t) => t.classList.remove("oculto"));
}

function terminarCarga() {
    skeletons.classList.add("oculto");
    contenedorTarjetas.classList.remove("oculto");
    contenedorTarjetas.setAttribute("aria-busy", "false");
}

function filtrar(texto) {
    let encontrados = 0;
    tarjetas.forEach((t) => {
        const coincide = simplificar(t.textContent).includes(texto);
        t.classList.toggle("oculto", !coincide);
        if (coincide) encontrados++;
    });
    terminarCarga();
    expandirTarjetas(true);
    resultado.textContent = encontrados
        ? `Resultados encontrados: ${encontrados}`
        : "No se encontraron resultados. Prueba con otra palabra, por ejemplo: spyware.";
}

function buscarAmenaza() {
    clearTimeout(temporizador);
    const texto = simplificar(buscador.value.trim());

    if (!texto) {
        mostrarTodas();
        terminarCarga();
        resultado.textContent = "Mostrando todas las amenazas.";
        return;
    }

    resultado.textContent = "Buscando…";
    document.getElementById("amenazas").scrollIntoView();

    if (reducirMovimiento.matches) {
        filtrar(texto);
        return;
    }
    skeletons.classList.remove("oculto");
    contenedorTarjetas.classList.add("oculto");
    contenedorTarjetas.setAttribute("aria-busy", "true");
    temporizador = setTimeout(() => filtrar(texto), 450);
}

buscarBtn.addEventListener("click", buscarAmenaza);
buscador.addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarAmenaza();
});

/* ===== SECCIONES SEPARADAS (una por pantalla) ===== */
const vistas = [...document.querySelectorAll(".vista")];
const principal = document.getElementById("contenido");
const enlaces = [...menu.querySelectorAll("a")];
principal.setAttribute("tabindex", "-1");

// Botones "anterior / siguiente" al final de cada sección
vistas.forEach((v, i) => {
    const ant = vistas[i - 1];
    const sig = vistas[i + 1];
    const barra = document.createElement("div");
    barra.className = "paginacion contenedor";
    barra.setAttribute("role", "navigation");
    barra.setAttribute("aria-label", "Cambiar de sección");
    barra.innerHTML =
        (ant ? `<a href="#${ant.dataset.hash}"><svg class="icono" aria-hidden="true"><use href="#i-arrow-left"/></svg> ${ant.dataset.titulo}</a>` : "<span></span>") +
        (sig ? `<a href="#${sig.dataset.hash}">${sig.dataset.titulo} <svg class="icono" aria-hidden="true"><use href="#i-arrow-right"/></svg></a>` : "");
    v.appendChild(barra);
});

// Solo se ocultan las secciones si este script funciona
document.documentElement.classList.add("js");

function mostrarVista() {
    const hash = decodeURIComponent(location.hash) || "#inicio";
    const destino = document.getElementById(hash.slice(1));
    const vista = (destino && destino.closest(".vista")) || vistas[0];
    const cambio = !vista.classList.contains("activa");

    vistas.forEach((v) => v.classList.toggle("activa", v === vista));

    if (cambio) {
        document.title = vista.dataset.titulo + " | Navega Seguro";
        window.scrollTo({ top: 0, behavior: "instant" });
        principal.focus({ preventScroll: true });
    }
    if (destino && destino !== vista) destino.scrollIntoView();

    const activo =
        enlaces.find((a) => a.getAttribute("href") === hash) ||
        enlaces.find((a) => a.getAttribute("href") === "#" + vista.dataset.menu) ||
        enlaces.find((a) => {
            const d = document.querySelector(a.getAttribute("href"));
            return d && d.closest(".vista") === vista;
        });
    enlaces.forEach((a) => {
        if (a === activo) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
    });
}

window.addEventListener("hashchange", mostrarVista);
mostrarVista();


/* ===== "VER TODAS" LAS AMENAZAS ===== */
const botonVerTodas = document.getElementById("verTodas");

function expandirTarjetas(abrir) {
    contenedorTarjetas.classList.toggle("expandida", abrir);
    botonVerTodas.setAttribute("aria-expanded", String(abrir));
    botonVerTodas.textContent = abrir ? "Ver menos" : "Ver todas";
}
botonVerTodas.addEventListener("click", () => {
    expandirTarjetas(!contenedorTarjetas.classList.contains("expandida"));
});

/* ===== LUPA DE LA CABECERA: lleva al buscador ===== */
window.addEventListener("hashchange", () => {
    if (location.hash === "#buscador") buscador.focus({ preventScroll: true });
});

/* ===== FORMULARIO DE CONTACTO (abre tu programa de correo) ===== */
document.getElementById("formContacto").addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = new FormData(e.target);
    const asunto = encodeURIComponent("Contacto desde Navega Seguro");
    const cuerpo = encodeURIComponent("Nombre: " + datos.get("nombre") + "\n\n" + datos.get("mensaje"));
    location.href = "mailto:" + CORREO_CONTACTO + "?subject=" + asunto + "&body=" + cuerpo;
});