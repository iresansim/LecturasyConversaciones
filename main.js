document.addEventListener('DOMContentLoaded', () => {
    // Accedemos a los datos globales (cargados desde data.js)
    const data = window.ClubLibroData;
    
    if (!data) {
        console.error("No se encontraron los datos del club. Asegúrate de que data.js se carga antes que main.js");
        return;
    }

    renderNextSession(data);
    renderProposals(data);
    renderExternalReads(data);
    renderTimeline(data);
});

function renderNextSession(data) {
    const { nextSession } = data;
    
    // 1. Update the Cover Image(s)
    const coverContainer = document.getElementById('current-cover');
    if (coverContainer) {
        let coversHtml = `<img src="${encodeURI(nextSession.book.cover)}" alt="Lectura Actual">`;
        if (nextSession.comic) {
            coversHtml += `<img src="${encodeURI(nextSession.comic.cover)}" alt="Cómic Especial" class="img-comic">`;
        }
        coverContainer.innerHTML = coversHtml;
    }

    // 2. Update Details Text
    const contentContainer = document.getElementById('next-session-content');
    if (contentContainer) {
        const date = new Date(nextSession.date);
        
        // Formatear fecha: Martes, 14 De Abril
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

        let noteHtml = '';
        if (nextSession.note) {
            noteHtml = `
                <div class="session-note" style="margin-top: 1.5rem; font-size: 0.9rem; font-style: italic; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 1rem;">
                    ${nextSession.note}
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
            ${noteHtml}
            <a href="${nextSession.link}" target="_blank" class="btn-primary" style="align-self: flex-start; margin-top: 2.5rem;">Unirse a la Sesión</a>
        `;
    }
}

function renderProposals(data) {
    const { proposals } = data;
    const container = document.getElementById('proposals-next-session');
    if (!container) return;
    
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
