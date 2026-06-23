-- ═══════════════════════════════════════════════════════════════════════════
-- INSUPEC - Migración para agregar columnas a tabla pedidos
-- ═══════════════════════════════════════════════════════════════════════════
-- Copia y pega TODO esto en el SQL Editor de Supabase
-- IMPORTANTE: Ejecuta esto solo si tu tabla pedidos YA existe
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Agregar columnas faltantes a la tabla pedidos (si no existen)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo',
ADD COLUMN IF NOT EXISTS transporte VARCHAR(100),
ADD COLUMN IF NOT EXISTS confirmado BOOLEAN DEFAULT false;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT - Los cambios se aplican automáticamente
-- ═══════════════════════════════════════════════════════════════════════════
