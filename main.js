// Configuración de Supabase
const SUPABASE_URL = 'https://hezgfdairgtrqxznszos.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlemdmZGFpcmd0cnF4em5zem9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDY1NTYsImV4cCI6MjA4OTQ4MjU1Nn0.KZN36UqLYCUmAyVEjk_JIhYlcotEjfY9TRISBzT_K6Q';

let supabase;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar datos estáticos inmediatamente (Secciones 02 y 03)
    const staticData = window.ClubLibroData;
    if (staticData) {
        // Inicialmente renderizamos todo con los datos estáticos
        renderNextSessionStatic(staticData.nextSession);
        renderProposals(staticData); // Fallback estático
        renderExternalReads(staticData);
        renderTimeline(staticData);
    }

    // 2. Intentar actualizar la Sección 01 desde Supabase
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        updateNextSessionFromSupabase();
    } else {
        console.warn("Supabase SDK no detectado. Se mantienen los datos estáticos.");
    }
});

async function updateNextSessionFromSupabase() {
    try {
        console.log("Actualizando Próxima Sesión desde Supabase...");
        const { data: sessions, error } = await supabase
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
            .order('numero_sesion', { ascending: false })
            .limit(1);

        if (error) throw error;
        if (sessions && sessions.length > 0) {
            renderNextSessionDynamic(sessions[0]);
        }
    } catch (err) {
        console.error("Error al actualizar desde Supabase:", err.message);
    }
}

// RENDERIZADO DINÁMICO (SUPABASE)
function renderNextSessionDynamic(session) {
    if (!session || !session.libro) return;
    
    // Portada
    const coverContainer = document.getElementById('current-cover');
    if (coverContainer) {
        let coversHtml = `<img src="${encodeURI(session.libro.imagen)}" alt="Lectura Actual">`;
        if (session.comic) {
            coversHtml += `<img src="${encodeURI(session.comic.imagen)}" alt="Cómic Especial" class="img-comic">`;
        }
        coverContainer.innerHTML = coversHtml;
    }

    // Contenido
    const contentContainer = document.getElementById('next-session-content');
    if (contentContainer) {
        const date = new Date(session.fecha + (session.hora ? 'T' + session.hora : ''));
        
        let dateString = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        dateString = dateString.split(' ').map(word => 
            word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        ).join(' ');

        const timeString = session.hora ? session.hora.substring(0, 5) : "--:--";

        let titlesHtml = `
            <div style="margin-bottom: 2rem;">
                <h2 class="book-title">${session.libro.titulo}</h2>
                <div class="book-author">${session.libro.autor ? session.libro.autor.nombre : 'Autor Desconocido'}</div>
            </div>
        `;

        if (session.comic) {
            titlesHtml += `
                <div style="margin-bottom: 2rem; padding-left: 1rem; border-left: 2px solid var(--accent);">
                    <div style="font-size: 0.7rem; color: var(--accent); font-weight: 600; text-transform: uppercase; margin-bottom: 0.2rem;">Cómic del Mes:</div>
                    <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin: 0;">${session.comic.titulo}</h3>
                    <div style="font-family: var(--font-sans); font-size: 0.9rem; color: var(--text-muted);">${session.comic.autor ? session.comic.autor.nombre : ''}</div>
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
                    <span class="val">${session.plataforma || 'Google Meet'}</span>
                </div>
                <div class="data-row">
                    <span class="key">Propuesto Por</span>
                    <span class="val">${session.proponente || 'Club'}</span>
                </div>
            </div>
            ${session.notas ? `<div class="session-note" style="margin-top: 1.5rem; font-size: 0.9rem; font-style: italic; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 1rem;">${session.notas}</div>` : ''}
            ${session.link_reunion ? `<a href="${session.link_reunion}" target="_blank" class="btn-primary" style="align-self: flex-start; margin-top: 2.5rem;">Unirse a la Sesión</a>` : ''}
        `;
    }
}

// RENDERIZADO ESTÁTICO (FALLBACK)
function renderNextSessionStatic(nextSession) {
    if (!nextSession) return;
    
    // 1. Portada
    const coverContainer = document.getElementById('current-cover');
    if (coverContainer) {
        let coversHtml = `<img src="${encodeURI(nextSession.book.cover)}" alt="Lectura Actual">`;
        if (nextSession.comic) {
            coversHtml += `<img src="${encodeURI(nextSession.comic.cover)}" alt="Cómic Especial" class="img-comic">`;
        }
        coverContainer.innerHTML = coversHtml;
    }

    // 2. Contenido de Texto
    const contentContainer = document.getElementById('next-session-content');
    if (contentContainer) {
        const date = new Date(nextSession.date);
        let dateString = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        dateString = dateString.split(' ').map(word => 
            word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        ).join(' ');

        const timeString = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        let titlesHtml = `
            <div style="margin-bottom: 2rem;">
                <h2 class="book-title">${nextSession.book.title}</h2>
                <div class="book-author">${nextSession.book.author}</div>
            </div>
        `;

        if (nextSession.comic) {
            titlesHtml += `
                <div style="margin-bottom: 2rem; padding-left: 1rem; border-left: 2px solid var(--accent);">
                    <div style="font-size: 0.7rem; color: var(--accent); font-weight: 600; text-transform: uppercase; margin-bottom: 0.2rem;">Cómic del Mes:</div>
                    <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin: 0;">${nextSession.comic.title}</h3>
                    <div style="font-family: var(--font-sans); font-size: 0.9rem; color: var(--text-muted);">${nextSession.comic.author}</div>
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
                    <span class="val">Google Meet</span>
                </div>
                <div class="data-row">
                    <span class="key">Propuesto Por</span>
                    <span class="val">${nextSession.proposer}</span>
                </div>
            </div>
            ${nextSession.note ? `<div class="session-note" style="margin-top: 1.5rem; font-size: 0.9rem; font-style: italic; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 1rem;">${nextSession.note}</div>` : ''}
            <a href="${nextSession.link}" target="_blank" class="btn-primary" style="align-self: flex-start; margin-top: 2.5rem;">Unirse a la Sesión</a>
        `;
    }
}

function renderProposals(data) {
    const { proposals } = data;
    const container = document.getElementById('proposals-next-session');
    if (!container) return;
    
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
            <span class="val" style="text-align: left;"><strong>${p.title}</strong><br><span style="font-style: italic; opacity: 0.7; font-size: 0.8em;">${p.author}</span></span>
            <span class="key" style="color: var(--accent); font-weight: bold;">${p.votes} votos</span>
        </div>
    `).join('');
}

function renderExternalReads(data) {
    const { externalReads } = data;
    const container = document.getElementById('external-list');
    if (!container) return;

    container.innerHTML = externalReads.map(r => `
        <div style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px dashed var(--border-light);">
            <div style="font-size: 0.7rem; color: var(--accent); font-weight: 600; text-transform: uppercase;">RECOMENDACIÓN:</div>
            <div style="font-family: var(--font-serif); font-size: 1.5rem; line-height: 1.2;">${r.title}</div>
            <div style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${r.author}</div>
            <div style="font-size: 0.85rem; font-style: italic; color: var(--text-muted); margin-top: 0.5rem;">"${r.comment}"</div>
        </div>
    `).join('');
}

function renderTimeline(data) {
    const { sessions } = data;
    const container = document.getElementById('timeline');
    if (!container) return;

    container.innerHTML = sessions.map((s) => `
        <div class="timeline-item">
            <img src="${encodeURI(s.book.cover)}" alt="${s.book.title}">
            <div class="timeline-content">
                <div class="meta-label">
                    ${new Date(s.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </div>
                <h3 style="font-family: var(--font-serif); font-size: 2rem;">${s.book.title}</h3>
                <div style="font-family: var(--font-sans); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted);">${s.book.author}</div>
                <div style="font-family: var(--font-sans); font-size: 0.7rem; color: var(--accent); font-weight: 600; margin-top: 0.4rem; text-transform: uppercase;">
                    Propuesto por: <span style="color: var(--text-main); font-weight: 400;">${s.proposer}</span>
                </div>
                <p>${s.summary}</p>
            </div>
        </div>
    `).join('');
}
