-- Crear ENUMs para campos con valores específicos
CREATE TYPE genero_autor AS ENUM ('Masculino', 'Femenino', 'Otro');
CREATE TYPE genero_literario AS ENUM ('Novela', 'Ensayo', 'Cómic', 'Cuento', 'Divulgación');
CREATE TYPE plataforma_sesion AS ENUM ('Online', 'Presencial');

-- Tabla de Autores
CREATE TABLE autores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    año_nacimiento INTEGER,
    genero genero_autor,
    nacionalidad TEXT,
    continente TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Libros
CREATE TABLE libros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    autor_id UUID REFERENCES autores(id),
    genero_literario genero_literario,
    tema TEXT,
    editorial TEXT,
    año_publicacion INTEGER,
    imagen TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Sesiones
CREATE TABLE sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ciclo INTEGER,
    numero_sesion INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora TIME,
    plataforma plataforma_sesion DEFAULT 'Online',
    link_reunion TEXT,
    proponente TEXT,
    fecha_propuesta DATE,
    libro_id UUID REFERENCES libros(id),
    comic_id UUID REFERENCES libros(id), -- Para sesiones con lectura extra/cómic
    notas TEXT,
    resumen TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Propuestas Pendientes
CREATE TABLE propuestas_pendientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    autor TEXT,
    proponente TEXT,
    votos INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS) para lectura pública
ALTER TABLE autores ENABLE ROW LEVEL SECURITY;
ALTER TABLE libros ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE propuestas_pendientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública para autores" ON autores FOR SELECT USING (true);
CREATE POLICY "Lectura pública para libros" ON libros FOR SELECT USING (true);
CREATE POLICY "Lectura pública para sesiones" ON sesiones FOR SELECT USING (true);
CREATE POLICY "Lectura pública para propuestas" ON propuestas_pendientes FOR SELECT USING (true);
