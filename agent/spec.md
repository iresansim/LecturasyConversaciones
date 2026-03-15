# Especificación del Proyecto: Lecturas y Conversaciones

## 1. Visión General
"Lecturas y Conversaciones" es una aplicación web privada diseñada para un club de lectura de 9 personas. Su objetivo es centralizar la información de las sesiones, facilitar la gestión de propuestas y mantener un historial vivo de las lecturas compartidas.

## 2. Personas Usuarias
- **Club de Lectura**: Ana, Anna, Cris, Elena, Juan, Lore, Vane y Marina.
- **Moderador/a**: Irene (encargada de la infraestructura y mantenimiento).

## 3. Requisitos Funcionales

### 3.1 Próxima Sesión (Apartado 01)
- Mostrar información destacada de la reunión actual.
- Campos obligatorios: Título del libro, autor, fecha, hora, plataforma y quién propuso el libro.
- Pantalla visual: Portada del libro a la derecha.

### 3.2 Propuestas (Apartado 02)
- Sección dinámica para gestionar futuras lecturas.
- Mensaje personalizado cuando no hay propuestas (ej. instrucciones para @Cris).

### 3.3 Historial (Apartado 03)
- Listado cronológico inverso de las 10 últimas sesiones.
- Cada sesión incluye: Portada, Fecha (Mes Año), Título, Autor, Propuesto por y Resumen.

### 3.4 En el Tintero (Apartado 04)
- Recomendaciones externas y lecturas sugeridas que no han sido seleccionadas aún.

## 4. Requisitos Técnicos
- **Frontend**: HTML5, Vanilla CSS3, Javascript (ES6+).
- **Compatibilidad**: Debe funcionar al abrir el archivo `index.html` localmente (sin necesidad de servidor local para evitar CORS).
- **Despliegue**: GitHub Pages.
- **Metodología**: Spec-Driven Development (SDD) con Spec Kit.

## 5. Estilo Visual
- Estética editorial premium (Inspiración en "The Margin").
- Grid-layout avanzado.
- Tipografía cuidada (Serif para títulos, Sans para metadatos).
- Colores terrosos y acentos en naranja/ocre.
