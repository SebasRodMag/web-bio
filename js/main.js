// Tema persistente + autodetección inicial
const root = document.documentElement;
const saved = localStorage.getItem('theme');
if (saved) {
    root.setAttribute('data-theme', saved);
} else {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const now = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', now);
    localStorage.setItem('theme', now);
});

// Copiar email
document.getElementById('copyEmail').addEventListener('click', async () => {
    await navigator.clipboard.writeText('sebastian@asrm.dev');
    const btn = document.getElementById('copyEmail');
    const prev = btn.textContent;
    btn.textContent = 'Copiado ✔';
    setTimeout(() => (btn.textContent = prev), 1500);
});

// Modal accesible
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModal');
let lastFocus = null;

function openModal(html, title = 'Vista rápida') {
    lastFocus = document.activeElement;
    document.getElementById('modalTitle').textContent = title;
    modalContent.innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeModalBtn.focus();
}

function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    lastFocus && lastFocus.focus();
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (!modal.hidden && e.key === 'Escape') closeModal(); });

// “Snippets” de contenido por proyecto
const quickViews = {
    mv: `
    <p><strong>Clínica Dietética MV</strong></p>
    <ul>
      <li>API Laravel con roles y auditoría</li>
      <li>Angular con calendario y modales</li>
      <li>Videollamada Jitsi integrada</li>
    </ul>
    <a class="btn" href="proyectos/clinica-dietetica-mv.html">Ver detalle</a>
  `,
    cal: `
    <p><strong>Calendario Interactivo</strong></p>
    <ul>
      <li>FullCalendar + Angular</li>
      <li>Filtros por estado, accesibilidad</li>
      <li>Componentes reutilizables</li>
    </ul>
    <a class="btn" href="proyectos/calendario-interactivo.html">Ver detalle</a>
  `,
    traefik: `
    <p><strong>Stack Traefik</strong></p>
    <ul>
      <li>Reverse proxy y TLS automático</li>
      <li>Rutas por host/path</li>
      <li>CI/CD con GitHub Actions</li>
    </ul>
    <a class="btn" href="proyectos/stack-traefik.html">Ver detalle</a>
  `
};

// Abrir modal desde los botones “Vista rápida”
document.querySelectorAll('[data-open-modal]').forEach((a) => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const key = a.getAttribute('data-open-modal');
        openModal(quickViews[key] ?? '<p>Contenido no disponible</p>', 'Vista rápida');
    });
});

// Año en footer
document.getElementById('yr').textContent = new Date().getFullYear();
/**
 * Se estan usando tokens semánticos (--accent, --bg, --fg, --muted, --card, --line) en todo el CSS para manejar los temas.
 * si mañana quiero cambiar los colores del tema, solo necesito cambiar las variables en :root y [data-theme="light"].
 * Si quiero agregar un nuevo tema, solo necesito agregar otro bloque [data-theme="nuevoTema"].
 * El botón de alternar tema cambia la variable --accent entre dos colores predefinidos (--color-principal-dia y --color-principal-noche).
 * Esto permite una personalización fácil y coherente del tema sin afectar otros estilos.
 */

// ===== Cargar Markdown en el modal =====
(() => {
    const modal = document.getElementById('modal');
    const box = modal.querySelector('.modal-box');
    const content = document.getElementById('modalContent');
    let lastFocus = null;
    const mdCache = new Map(); // cache simple

    const getTabbables = () => {
        const sel = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
        return Array.from(box.querySelectorAll(sel)).filter(el => el.offsetParent !== null);
    };

    async function loadMarkdown(url) {
        if (mdCache.has(url)) return mdCache.get(url);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('No se pudo cargar el contenido');
        const txt = await res.text();
        mdCache.set(url, txt);
        return txt;
    }

    async function openFromMarkdown(url) {
        try {
            lastFocus = document.activeElement;
            content.innerHTML = '<p class="muted">Cargando…</p>';
            modal.hidden = false;
            document.body.classList.add('lock-scroll');

            // 1) Cargar MD
            const md = await loadMarkdown(url);

            // 2) Markdown -> HTML (Marked)
            const rawHtml = marked.parse(md, { breaks: true, mangle: false, headerIds: true });

            // 3) Sanitizar (DOMPurify)
            const safeHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });

            // 4) Pintar
            content.innerHTML = safeHtml;

            // 5) Focus inicial
            const tabb = getTabbables();
            (tabb[0] || box).focus();
        } catch (err) {
            content.innerHTML = `<p class="muted">Error cargando el contenido. ${String(err.message || err)}</p>`;
            console.error(err);
        }
    }

    function close() {
        modal.hidden = true;
        document.body.classList.remove('lock-scroll');
        content.innerHTML = '';
        if (lastFocus) lastFocus.focus();
    }

    // Abrir: cualquier elemento con data-modal-md="/ruta/al.md"
    document.addEventListener('click', (e) => {
        const opener = e.target.closest('[data-modal-md]');
        if (opener) {
            e.preventDefault();
            const url = opener.getAttribute('data-modal-md');
            openFromMarkdown(url);
        }
        if (e.target.closest('[data-close-modal]')) {
            e.preventDefault();
            close();
        }
    });

    // Cierre por fondo
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // Teclado: Esc y focus trap
    document.addEventListener('keydown', (e) => {
        if (modal.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'Tab') {
            const tabb = getTabbables();
            if (tabb.length === 0) { e.preventDefault(); box.focus(); return; }
            const [first, last] = [tabb[0], tabb[tabb.length - 1]];
            const backwards = e.shiftKey;
            if (backwards && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!backwards && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    // Exponer utilidades si las quieres usar fuera
    window.__ModalMD = { openFromMarkdown, close };
})();

