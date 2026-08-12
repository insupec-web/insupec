-- ═══════════════════════════════════════════════════════════════════════════
-- Script para agregar la columna 'activo' a la tabla 'productos'
-- Ejecuta esto en el SQL Editor de Supabase
--
-- 'activo' controla la visibilidad del producto en la tienda: el admin puede
-- ocultar un producto sin borrarlo (ProductEditModal). Si la columna falta,
-- el toggle "Oculto" del panel falla al guardar.
--
-- Si restauras un backup o reimportas productos desde Excel y la columna
-- desaparece, volve a ejecutar este script.
-- ═══════════════════════════════════════════════════════════════════════════

-- Agregar la columna activo (los productos existentes quedan visibles)
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Marcar como visibles los productos que hayan quedado sin valor
UPDATE productos SET activo = true WHERE activo IS NULL;

-- Listo! El toggle de visibilidad del panel de admin vuelve a funcionar
