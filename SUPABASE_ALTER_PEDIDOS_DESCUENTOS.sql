-- ═══════════════════════════════════════════════════════════════════════════
-- INSUPEC - Migración: columnas de subtotal, descuento e IVA en pedidos
-- ═══════════════════════════════════════════════════════════════════════════
-- Copia y pega TODO esto en el SQL Editor de Supabase.
-- El checkout envía estos campos al crear un pedido. Sin estas columnas el
-- insert se rechaza y el pedido no queda registrado.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS descuento_monto DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS descuento_porcentaje DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS iva_monto DECIMAL(10, 2);

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT - Los cambios se aplican automáticamente
-- ═══════════════════════════════════════════════════════════════════════════
