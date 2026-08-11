-- ═══════════════════════════════════════════════════════════════════════════
-- Script para agregar la columna 'categoria' a la tabla 'productos'
-- Ejecuta esto en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- Agregar la columna categoria
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS categoria VARCHAR(255);

-- Crear índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

-- Listo! Ahora puedes usar el clasificador de IA
