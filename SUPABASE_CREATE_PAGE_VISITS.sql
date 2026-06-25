-- ═══════════════════════════════════════════════════════════════════════════
-- INSUPEC - Crear tabla page_visits para tracking de tráfico
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Crear tabla page_visits
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_page_visits_page ON page_visits(page);
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits(created_at DESC);

-- 2. Habilitar RLS
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS
-- Permitir insert público de page visits
CREATE POLICY "allow_insert_visits"
  ON page_visits
  FOR INSERT
  WITH CHECK (true);

-- Permitir select para admin (anon key)
CREATE POLICY "allow_select_visits"
  ON page_visits
  FOR SELECT
  TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Tabla creada correctamente
-- Ahora el tracking de tráfico funciona
-- ═══════════════════════════════════════════════════════════════════════════
