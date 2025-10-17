document.addEventListener('DOMContentLoaded', () => {
    // ===== Idioma actual =====
    const DEFAULT_LANG = 'es';
    const langSelect = document.getElementById('langSelect');
    const savedLang = localStorage.getItem('lang');
    let currentLang = savedLang || (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
    if (langSelect) langSelect.value = currentLang;
    document.documentElement.lang = currentLang;

    const I18N = {
        es: {
            'nav.experience': 'Experiencia',
            'nav.projects': 'Proyectos',
            'nav.contact': 'Contacto',
            'hero.cta.view': 'Ver proyectos',
            'hero.cta.copy': 'Copiar email',
            'hero.cta.developer': 'Desarrollador Full-Stack · Laravel · Angular · Docker',
            'section.projects': 'Proyectos',
            'section.projects.lead': 'Una selección breve. Luego haremos páginas de detalle.',
            'section.contact': 'Contacto',
            'actions.theme': 'Tema',
            'actions.quick': 'Vista rápida',
            'actions.detail': 'Ver detalle',
            'badge.available': 'Disponible',

            // Cards (descripciones breves)
            'card.mv.title': 'Clínica Dietética MV',
            'card.mv.desc': 'Gestión de citas clínicas, videollamada Jitsi, control por roles y auditoría.',
            'card.cal.title': 'Calendario Interactivo',
            'card.cal.desc': 'FullCalendar + Angular, modales accesibles y filtros.',
            'card.tr.title': 'Stack Traefik',
            'card.tr.desc': 'Reverse proxy, TLS automático y CI/CD con GitHub Actions.'
        },
        en: {
            'nav.experience': 'Experience',
            'nav.projects': 'Projects',
            'nav.contact': 'Contact',
            'hero.cta.view': 'See projects',
            'hero.cta.copy': 'Copy email',
            'hero.cta.developer': 'Full-Stack Developer · Laravel · Angular · Docker',
            'section.projects': 'Projects',
            'section.projects.lead': 'A short selection. Detailed pages coming next.',
            'section.contact': 'Contact',
            'actions.theme': 'Theme',
            'actions.quick': 'Quick view',
            'actions.detail': 'View details',
            'badge.available': 'Available',

            // Cards
            'card.mv.title': 'MV Dietetics Clinic',
            'card.mv.desc': 'Appointments, Jitsi videocalls, role-based access and auditing.',
            'card.cal.title': 'Interactive Calendar',
            'card.cal.desc': 'FullCalendar + Angular, accessible modals and filters.',
            'card.tr.title': 'Traefik Stack',
            'card.tr.desc': 'Reverse proxy, automatic TLS and CI/CD with GitHub Actions.'
        }
    };

    //Precedencia del .md
    function toFinalMdUrl(baseOrFull, lang) {
        // Si ya viene con .md, lo respetamos
        if (/\.md$/i.test(baseOrFull)) return baseOrFull.replace(/^\/+/, '');
        // Si no, construimos base + .<lang>.md
        return `${baseOrFull}.${lang}.md`.replace(/^\/+/, '');
    }

    // Aplicar textos UI
    function applyI18n(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const txt = I18N[lang]?.[key] ?? I18N[DEFAULT_LANG]?.[key];
            if (!txt) return;
            // Para botones/enlaces usamos textContent (evita sobrescribir HTML interno)
            el.textContent = txt;
        });
        document.documentElement.lang = lang;
    }
    applyI18n(currentLang);


    // Cambios de idioma (persisten y actualizan UI)
    langSelect?.addEventListener('change', () => {
        currentLang = langSelect.value;
        localStorage.setItem('lang', currentLang);
        applyI18n(currentLang);
    });
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

    async function fetchWithFallback(baseOrFull) {
        // 1º intenta con el idioma actual; 2º cae a ES
        const tryOnce = async (u) => {
            const res = await fetch(u, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${u}`);
            return res.text();
        };
        const first = toFinalMdUrl(baseOrFull, currentLang);
        try { return await tryOnce(first); }
        catch {
            const fallback = toFinalMdUrl(baseOrFull, 'es');
            if (fallback === first) throw error; // ya era ES
            return await tryOnce(fallback);
        }
    }


    async function loadMarkdown(url) {
        const finalUrl = url.replace(/^\/+/, ''); // quita "/" inicial por si acaso
        const res = await fetch(finalUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${finalUrl}`);
        return await res.text();
    }

    async function openFromMarkdown(baseOrFull) {
        try {
            lastFocus = document.activeElement;
            modal.hidden = false;
            document.body.classList.add('lock-scroll');
            content.innerHTML = '<p class="muted">Cargando…</p>';

            const md = await fetchWithFallback(baseOrFull);
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
