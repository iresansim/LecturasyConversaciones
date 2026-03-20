// Configuración de Supabase
const SUPABASE_URL = 'https://hezgfdairgtrqxznszos.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlemdmZGFpcmd0cnF4em5zem9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDY1NTYsImV4cCI6MjA4OTQ4MjU1Nn0.KZN36UqLYCUmAyVEjk_JIhYlcotEjfY9TRISBzT_K6Q';

console.log("main.js detectado");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado");
    
    // 1. Verificar datos estáticos
    const data = window.ClubLibroData;
    if (!data) {
        showOnScreenError("Error: No se encontró 'data.js'. Asegúrate de que el archivo existe y está en la misma carpeta.");
        return;
    }

    // 2. Renderizar cada sección con manejo de errores individual
    try { safeRender('Portada', () => renderNextSession(data)); } catch(e) { console.error(e); }
    try { safeRender('Propuestas', () => renderProposals(data)); } catch(e) { console.error(e); }
    try { safeRender('Recomendaciones', () => renderExternalReads(data)); } catch(e) { console.error(e); }
    try { safeRender('Historial', () => renderTimeline(data)); } catch(e) { console.error(e); }

    // 3. Intento de actualización dinámica de campos desde Supabase
    if (window.supabase) {
        try {
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            updateDynamicFields(supabase);
        } catch (e) {
            console.warn("Error al inicializar Supabase:", e.message);
        }
    }
});

function safeRender(name, fn) {
    console.log(`Renderizando ${name}...`);
    fn();
}

function showOnScreenError(msg) {
    const div = document.createElement('div');
    div.style = "position:fixed; top:0; left:0; width:100%; background:red; color:white; padding:20px; text-align:center; z-index:9999; font-weight:bold;";
    div.innerText = msg;
    document.body.prepend(div);
}

async function updateDynamicFields(client) {
    try {
        const { data: sessions, error } = await client
            .from('sesiones')
            .select('proponente, plataforma, link_reunion, notas')
            .order('numero_sesion', { ascending: false })
            .limit(1);

        if (error) throw error;
        if (sessions && sessions.length > 0) {
            const session = sessions[0];
            
            // 1. Proponente
            const proposerVal = document.querySelector('#proposer-row .val');
            if (proposerVal && session.proponente) {
                proposerVal.textContent = session.proponente;
                proposerVal.style.color = 'var(--accent)';
                proposerVal.style.fontWeight = 'bold';
            }

            // 2. Plataforma
            const platformVal = document.querySelector('#platform-row .val');
            if (platformVal) {
                if (session.plataforma && session.plataforma.toLowerCase().includes('online')) {
                    platformVal.textContent = "Google Meet";
                } else if (session.plataforma) {
                    platformVal.textContent = session.plataforma;
                }
                platformVal.style.color = 'var(--accent)';
                platformVal.style.fontWeight = 'bold';
            }

            // 3. Link de reunión
            const meetingBtn = document.getElementById('meeting-btn');
            if (meetingBtn) {
                if (session.link_reunion) {
                    meetingBtn.href = session.link_reunion;
                    meetingBtn.style.display = 'inline-block';
                } else {
                    meetingBtn.style.display = 'none';
                }
            }

            // 4. Notas (Anuncio 📢)
            const noteDiv = document.getElementById('session-note');
            if (noteDiv) {
                if (session.notas) {
                    noteDiv.textContent = session.notas;
                    noteDiv.style.display = 'block';
                } else {
                    noteDiv.style.display = 'none';
                }
            }
            
            console.log("Campos actualizados desde DB correctamente");
        }
    } catch (err) {
        console.warn("Fallo al cargar campos dinámicos:", err.message);
    }
}

function renderNextSession(data) {
    const { nextSession } = data;
    if (!nextSession) return;
    
    const coverContainer = document.getElementById('current-cover');
    if (coverContainer) {
        let coversHtml = `<img src="${encodeURI(nextSession.book.cover)}" alt="Lectura Actual">`;
        if (nextSession.comic) {
            coversHtml += `<img src="${encodeURI(nextSession.comic.cover)}" alt="Cómic Especial" class="img-comic">`;
        }
        coverContainer.innerHTML = coversHtml;
    }

    const contentContainer = document.getElementById('next-session-content');
    if (contentContainer) {
        const date = new Date(nextSession.date);
        let dateString = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        dateString = dateString.split(' ').map(word => 
            word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        ).join(' ');

        const timeString = date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');

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
                <div class="data-row" id="platform-row">
                    <span class="key">Plataforma</span>
                    <span class="val">Google Meet</span>
                </div>
                <div class="data-row" id="proposer-row">
                    <span class="key">Propuesto Por</span>
                    <span class="val">${nextSession.proposer}</span>
                </div>
            </div>
            ${nextSession.note ? `<div class="session-note" id="session-note" style="margin-top: 1.5rem; font-size: 0.9rem; font-style: italic; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 1rem;">${nextSession.note}</div>` : `<div class="session-note" id="session-note" style="display:none; margin-top: 1.5rem; font-size: 0.9rem; font-style: italic; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 1rem;"></div>`}
            <a href="${nextSession.link}" target="_blank" class="btn-primary" id="meeting-btn" style="align-self: flex-start; margin-top: 2.5rem;">Unirse a la Sesión</a>
        `;
    }
}

function renderProposals(data) {
    const { proposals } = data;
    const container = document.getElementById('proposals-next-session');
    if (!container || !proposals) return;
    
    if (proposals.length === 0) {
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
    if (!container || !externalReads) return;

    container.innerHTML = externalReads.map(r => `
        <div style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px dashed var(--border-light);">
            <div style="font-size: 0.7rem; color: var(--accent); font-weight: 600; text-transform: uppercase;">RECOMENDACIÓN:</div>
            <div style="font-family: var(--font-serif); font-size: 1.5rem; line-height: 1.2;">${r.title}</div>
            <div style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${r.author}</div>
            <div style="font-size: 0.85rem; font-style: italic; color: var(--text-muted); margin-top: 0.5rem;">"${r.comment || ''}"</div>
        </div>
    `).join('');
}

function renderTimeline(data) {
    const { sessions } = data;
    const container = document.getElementById('timeline');
    if (!container || !sessions) return;

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
