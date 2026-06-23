-- ═══════════════════════════════════════════════════════════════════════════
-- INSUPEC - Script de Migración: Agregar campo 'laboratorio'
-- ═══════════════════════════════════════════════════════════════════════════
-- Ejecuta esto en el SQL Editor de Supabase para actualizar el schema existente
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. HACER foto_url NULLABLE (opcional, pero recomendado)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE productos ALTER COLUMN foto_url DROP NOT NULL;

-- 2. AGREGAR COLUMNA laboratorio
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE productos ADD COLUMN IF NOT EXISTS laboratorio VARCHAR(255);

-- 3. ACTUALIZAR POLÍTICAS RLS
-- ═══════════════════════════════════════════════════════════════════════════

-- Eliminar la política antigua (si existe)
DROP POLICY IF EXISTS "Productos: Admin puede modificar" ON productos;

-- Crear la nueva política que permite anon key
CREATE POLICY "Productos: Admin puede modificar"
  ON productos
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Migración completada
-- Ahora puedes crear/editar productos con el campo laboratorio
-- ═══════════════════════════════════════════════════════════════════════════
