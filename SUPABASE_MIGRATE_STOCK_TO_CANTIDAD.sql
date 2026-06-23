-- ═══════════════════════════════════════════════════════════════════════════
-- INSUPEC - Migración: Renombrar columna stock a cantidad en tabla productos
-- ═══════════════════════════════════════════════════════════════════════════
-- Copia y pega TODO esto en el SQL Editor de Supabase
-- IMPORTANTE: Ejecuta esto solo si tu tabla productos YA existe con columna "stock"
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Renombrar columna stock a cantidad
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE productos
RENAME COLUMN stock TO cantidad;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT - Los cambios se aplican automáticamente
-- ═══════════════════════════════════════════════════════════════════════════
