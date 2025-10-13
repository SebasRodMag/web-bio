document.addEventListener('DOMContentLoaded', () => {
    // ========== Tema persistente ==========
    const root = document.documentElement;
    const btnTheme = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);
    if (btnTheme) {
        btnTheme.addEventListener('click', () => {
            const now = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', now);
            localStorage.setItem('theme', now);
        });
    }

    // Copiar email (no fallar si no existe)
    const btnCopy = document.getElementById('copyEmail');
    if (btnCopy) {
        btnCopy.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText('sebastian@asrm.dev');
                const prev = btnCopy.textContent;
                btnCopy.textContent = 'Copiado ✔';
                setTimeout(() => (btnCopy.textContent = prev), 1500);
            } catch (e) {
                console.warn('Clipboard no disponible:', e);
            }
        });
    }

    // ========== Modal + Markdown ==========
    const modal = document.getElementById('modal');
    const box = modal?.querySelector('.modal-box');
    const content = document.getElementById('modalContent');

    if (!modal || !box || !content) {
        console.warn('[Modal] Falta #modal/.modal-box/#modalContent en el DOM.');
        return; // sin modal, salimos limpamente
    }

    const parseMd = (md) => {
        const m = window.marked;
        if (!m) throw new Error('Marked no cargado');
        return (typeof m.parse === 'function') ? m.parse(md) : m(md);
    };
    const purify = (html) => {
        const dp = window.DOMPurify;
        if (!dp) throw new Error('DOMPurify no cargado');
        return dp.sanitize(html, { USE_PROFILES: { html: true } });
    };

    let lastFocus = null;
    const getTabbables = () => {
        const sel = 'a[href],button:not([disabled]),select,textarea,input,[tabindex]:not([tabindex="-1"])';
        return Array.from(box.querySelectorAll(sel)).filter(el => el.offsetParent !== null);
    };

    async function loadMarkdown(url) {
        const finalUrl = url.replace(/^\/+/, ''); // quita "/" inicial por si acaso
        const res = await fetch(finalUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${finalUrl}`);
        return await res.text();
    }

    async function openFromMarkdown(url) {
        try {
            lastFocus = document.activeElement;
            modal.hidden = false;
            document.body.classList.add('lock-scroll');
            content.innerHTML = '<p class="muted">Cargando…</p>';

            const md = await loadMarkdown(url);
            const raw = parseMd(md);
            const safe = purify(raw);
            content.innerHTML = safe;

            const tabb = getTabbables();
            (tabb[0] || box).focus();
        } catch (err) {
            console.error('[MD] Error:', err);
            content.innerHTML = `<p class="muted">Error cargando el contenido. ${String(err.message || err)}</p>`;
        }
    }

    function close() {
        modal.hidden = true;
        document.body.classList.remove('lock-scroll');
        content.innerHTML = '';
        lastFocus?.focus();
    }

    // Delegación: abrir por data-modal-md
    document.addEventListener('click', (e) => {
        const opener = e.target.closest('[data-modal-md]');
        if (opener) {
            e.preventDefault();
            const url = opener.getAttribute('data-modal-md');
            if (url) openFromMarkdown(url);
            return;
        }
        if (e.target.closest('[data-close-modal]')) {
            e.preventDefault();
            close();
        }
    });

    // Fondo y teclado
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
        if (modal.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'Tab') {
            const tabb = getTabbables();
            if (tabb.length === 0) { e.preventDefault(); box.focus(); return; }
            const first = tabb[0], last = tabb[tabb.length - 1];
            const back = e.shiftKey;
            if (back && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!back && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    // Año en footer (si existe)
    const yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();
});
