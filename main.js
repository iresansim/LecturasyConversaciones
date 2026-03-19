// Configuración de Supabase
const SUPABASE_URL = 'https://hezgfdairgtrqxznszos.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlemdmZGFpcmd0cnF4em5zem9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDY1NTYsImV4cCI6MjA4OTQ4MjU1Nn0.KZN36UqLYCUmAyVEjk_JIhYlcotEjfY9TRISBzT_K6Q';

let supabase;

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando...");
    if (!window.supabase) {
        console.error("Error: Supabase SDK no cargado. Revisa la conexión a internet o el enlace CDN.");
        showError("Error: No se pudo cargar el motor de la base de datos.");
        return;
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    init();
});

function showError(msg) {
    const banner = document.createElement('div');
    banner.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#e74c3c; color:white; padding:15px 30px; border-radius:8px; z-index:10000; box-shadow:0 4px 12px rgba(0,0,0,0.2); font-family:sans-serif; font-weight:bold;";
    banner.textContent = msg;
    document.body.appendChild(banner);
}

async function init() {
    console.log("Iniciando carga de datos desde Supabase...");
    try {
        // 1. Obtener todas las sesiones con sus libros y autores relacionados
        const { data: sessions, error: sessionsError } = await supabase
            .from('sesiones')
            .select(`
                *,
                libro:libros!libro_id (
                    titulo,
                    imagen,
                    autor:autores (nombre)
                ),
                comic:libros!comic_id (
                    titulo,
                    imagen,
                    autor:autores (nombre)
                )
            `)
            .order('numero_sesion', { ascending: false });

        if (sessionsError) {
            console.error("Error en consulta de sesiones:", sessionsError);
            throw sessionsError;
        }

        console.log(`Sesiones obtenidas: ${sessions?.length || 0}`);
        if (!sessions || sessions.length === 0) {
            console.warn("No se encontraron sesiones en la base de datos.");
        }

function renderNextSession(session) {
    if (!session) return;
    
    // 1. Update the Cover Image(s)
    const coverContainer = document.getElementById('current-cover');
    if (coverContainer) {
        let coversHtml = `<img src="${encodeURI(session.libro.imagen)}" alt="Lectura Actual">`;
        if (session.comic) {
            coversHtml += `<img src="${encodeURI(session.comic.imagen)}" alt="Cómic Especial" class="img-comic">`;
        }
        coverContainer.innerHTML = coversHtml;
    }

    // 2. Update Details Text
    const contentContainer = document.getElementById('next-session-content');
    if (contentContainer) {
        const date = new Date(session.fecha + (session.hora ? 'T' + session.hora : ''));
        
        // Formatear fecha: Martes, 14 De Abril
        let dateString = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        dateString = dateString.split(' ').map(word => 
            word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        ).join(' ');

        const timeString = session.hora ? session.hora.substring(0, 5) : "--:--";

        let titlesHtml = `
            <div style="margin-bottom: 2rem;">
                <h2 class="book-title">${session.libro.titulo}</h2>
                <div class="book-author">${session.libro.autor.nombre}</div>
            </div>
        `;

        if (session.comic) {
            titlesHtml += `
                <div style="margin-bottom: 2rem; padding-left: 1rem; border-left: 2px solid var(--accent);">
                    <div style="font-size: 0.7rem; color: var(--accent); font-weight: 600; text-transform: uppercase; margin-bottom: 0.2rem;">Cómic del Mes:</div>
                    <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin: 0;">${session.comic.titulo}</h3>
                    <div style="font-family: var(--font-sans); font-size: 0.9rem; color: var(--text-muted);">${session.comic.autor.nombre}</div>
                </div>
            `;
        }

        let noteHtml = '';
        if (session.notas) {
            noteHtml = `
                <div class="session-note" style="margin-top: 1.5rem; font-size: 0.9rem; font-style: italic; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 1rem;">
                    ${session.notas}
                </div>
            `;
        }

        contentContainer.innerHTML = `
            ${titlesHtml}
            <div class="data-grid">
                <div class="data-row">
                    <span class="key">Fecha Sesión</span>
                    <span class="val">${dateString}</span>
                </div>
                <div class="data-row">
                    <span class="key">Hora</span>
                    <span class="val">${timeString}</span>
                </div>
                <div class="data-row">
                    <span class="key">Plataforma</span>
                    <span class="val">${session.plataforma}</span>
                </div>
                <div class="data-row">
                    <span class="key">Propuesto Por</span>
                    <span class="val">${session.proponente || 'Club'}</span>
                </div>
            </div>
            ${noteHtml}
            ${session.link_reunion ? `<a href="${session.link_reunion}" target="_blank" class="btn-primary" style="align-self: flex-start; margin-top: 2.5rem;">Unirse a la Sesión</a>` : ''}
        `;
    }
}

function renderProposals(proposals) {
    const container = document.getElementById('proposals-next-session');
    if (!container) return;
    
    // Si no hay propuestas con votos, mostramos el mensaje para Elena
    if (!proposals || proposals.length === 0) {
        container.innerHTML = `
            <div style="font-family: var(--font-sans); font-size: 1rem; line-height: 1.4; padding: 1.5rem; border-left: 2px solid var(--accent); background: rgba(196, 117, 45, 0.05); margin-top: 2.5rem;">
                🗣️ <strong>@Elena</strong> trae tres propuestas como máximo para la votación de la próxima sesión.
            </div>
        `;
        return;
    }

    container.innerHTML = `<div class="meta-label" style="margin-top: 2.5rem; margin-bottom: 1.5rem;">PROPUESTAS ACTUALES</div>` + proposals.map(p => `
        <div class="data-row" style="margin-bottom: 0.8rem;">
            <span class="val" style="text-align: left;"><strong>${p.titulo}</strong><br><span style="font-style: italic; opacity: 0.7; font-size: 0.8em;">${p.autor}</span></span>
            <span class="key" style="color: var(--accent); font-weight: bold;">${p.votos} votos</span>
        </div>
    `).join('');
}

function renderExternalReads(proposals) {
    const container = document.getElementById('external-list');
    if (!container) return;

    // Filtramos para mostrar algunas recomendaciones (pueden ser las mismas propuestas o una subsección)
    container.innerHTML = proposals.slice(0, 5).map(r => `
        <div style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px dashed var(--border-light);">
            <div style="font-size: 0.7rem; color: var(--accent); font-weight: 600; text-transform: uppercase;">RECOMENDACIÓN:</div>
            <div style="font-family: var(--font-serif); font-size: 1.5rem; line-height: 1.2;">${r.titulo}</div>
            <div style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${r.autor} <span style="opacity: 0.5;">(Vía ${r.proponente})</span></div>
        </div>
    `).join('');
}

function renderTimeline(sessions) {
    const container = document.getElementById('timeline');
    if (!container) return;

    container.innerHTML = sessions.map((s) => `
        <div class="timeline-item">
            <img src="${encodeURI(s.libro.imagen)}" alt="${s.libro.titulo}">
            <div class="timeline-content">
                <div class="meta-label">
                    ${new Date(s.fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </div>
                <h3 style="font-family: var(--font-serif); font-size: 2rem;">${s.libro.titulo}</h3>
                <div style="font-family: var(--font-sans); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted);">${s.libro.autor.nombre}</div>
                <div style="font-family: var(--font-sans); font-size: 0.7rem; color: var(--accent); font-weight: 600; margin-top: 0.4rem; text-transform: uppercase;">
                    Propuesto por: <span style="color: var(--text-main); font-weight: 400;">${s.proponente || 'Club'}</span>
                </div>
                <p>${s.resumen || ''}</p>
            </div>
        </div>
    `).join('');
}
