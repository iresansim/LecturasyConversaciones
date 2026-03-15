# Plan de Implementación: Lecturas y Conversaciones

## 1. Arquitectura de Datos
- **Almacenamiento**: Los datos residen en `data.js` como un objeto global `window.ClubLibroData`.
- **Estructura**: `sessions` (array), `nextSession` (object), `proposals` (array), `externalReads` (array).

## 2. Estrategia de Renderizado
- Se utiliza `main.js` para manipular el DOM tras el evento `DOMContentLoaded`.
- Las funciones de renderizado (`renderNextSession`, `renderTimeline`, etc.) son modulares y se encargan de inyectar el HTML en contenedores específicos del `index.html`.

## 3. Solución para Visualización Local
- Para evitar bloqueos de CORS al abrir `index.html` directamente desde el sistema de archivos:
    - Se eliminó el uso de `type="module"`.
    - `data.js` define los datos en el scope global.
    - `main.js` accede a esos datos directamente.

## 4. Flujo de Trabajo (SDD)
- Cualquier cambio en la funcionalidad debe reflejarse primero en `agent/spec.md`.
- Las tareas se desglosan en `agent/task.md`.
- El progreso se documenta en este `agent/plan.md`.

## 5. Próximos Pasos Técnicos [EN CURSO]
- **Refinar el diseño responsivo (Fase 1)**:
    - Implementar `flex-direction: column` para `.timeline-item` y `#next-session-section` en móviles.
    - Ajustar el grid de `.canvas` para evitar desbordamientos horizontales.
    - Reducir tamaños de fuente (`clamp`) y espacios (`--space-xl`) en móviles.
- **Optimizar la carga de imágenes pesadas**.
