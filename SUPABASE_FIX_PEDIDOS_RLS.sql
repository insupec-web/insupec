-- ═══════════════════════════════════════════════════════════════════════════
-- INSUPEC - Fix: Actualizar políticas RLS para pedidos (permitir SELECT al admin)
-- ═══════════════════════════════════════════════════════════════════════════
-- Ejecuta esto en el SQL Editor de Supabase para permitir que admin lea pedidos
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Eliminar la política antigua que bloquea SELECT
DROP POLICY IF EXISTS "Pedidos: No select público" ON pedidos;

-- 2. Crear nueva política que permite SELECT desde anon (admin)
CREATE POLICY "Pedidos: Select para admin"
  ON pedidos
  FOR SELECT
  TO anon
  USING (true);

-- 3. Permitir UPDATE para admin (confirmado)
CREATE POLICY "Pedidos: Admin puede actualizar"
  ON pedidos
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 4. Permitir DELETE para admin (cancelar pedidos)
CREATE POLICY "Pedidos: Admin puede eliminar"
  ON pedidos
  FOR DELETE
  TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Migración completada
-- Ahora el admin puede leer, actualizar y eliminar pedidos
-- ═══════════════════════════════════════════════════════════════════════════
