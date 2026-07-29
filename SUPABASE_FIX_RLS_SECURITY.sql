-- ═══════════════════════════════════════════════════════════════════════════
-- INSUPEC - SEGURIDAD: Políticas RLS definitivas
-- ═══════════════════════════════════════════════════════════════════════════
-- EJECUTAR EN EL SQL EDITOR DE SUPABASE. Reemplaza TODAS las políticas
-- anteriores, que eran vulnerables: permitían a cualquier visitante (rol
-- anon, cuya key es pública en el bundle del frontend) leer todos los
-- pedidos con datos personales de clientes y modificar/borrar el catálogo
-- de productos vía la API REST.
--
-- Modelo de seguridad resultante:
--   - Público (anon): ver productos/packs, crear pedidos, registrar visitas.
--   - Admin (usuario de Supabase Auth presente en admin_users): todo lo demás.
-- ═══════════════════════════════════════════════════════════════════════════

-- 0. Tabla admin_users (por si no existe) + función is_admin()
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER evita recursión de RLS al consultar admin_users desde
-- las políticas de otras tablas.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Cada usuario autenticado solo puede ver su propia fila (el login la usa
-- para verificar si es admin). Nadie puede escribirla desde el cliente.
DROP POLICY IF EXISTS "admin_users: ver propia fila" ON admin_users;
CREATE POLICY "admin_users: ver propia fila"
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 1. PRODUCTOS: lectura pública, escritura solo admin
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Productos: Lectura pública" ON productos;
DROP POLICY IF EXISTS "Productos: Admin puede modificar" ON productos;

CREATE POLICY "Productos: Lectura pública"
  ON productos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Productos: Insert solo admin"
  ON productos FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Productos: Update solo admin"
  ON productos FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Productos: Delete solo admin"
  ON productos FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 2. PEDIDOS: cualquiera puede crear (checkout), solo admin lee/edita/borra
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pedidos: Insert público" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: No select público" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: Select para admin" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: Admin puede actualizar" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: Admin puede eliminar" ON pedidos;

CREATE POLICY "Pedidos: Insert público"
  ON pedidos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Pedidos: Select solo admin"
  ON pedidos FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Pedidos: Update solo admin"
  ON pedidos FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Pedidos: Delete solo admin"
  ON pedidos FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. PAGE_VISITS: insert público (tracking), lectura solo admin
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_visits" ON page_visits;
DROP POLICY IF EXISTS "allow_select_visits" ON page_visits;

CREATE POLICY "allow_insert_visits"
  ON page_visits FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "page_visits: select solo admin"
  ON page_visits FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 4. PACKS / PACK_ITEMS (solo si existen): lectura pública, escritura admin
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF to_regclass('public.packs') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE packs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Packs: lectura pública" ON packs';
    EXECUTE 'CREATE POLICY "Packs: lectura pública" ON packs FOR SELECT TO public USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Packs: escritura solo admin" ON packs';
    EXECUTE 'CREATE POLICY "Packs: escritura solo admin" ON packs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
  END IF;

  IF to_regclass('public.pack_items') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE pack_items ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "PackItems: lectura pública" ON pack_items';
    EXECUTE 'CREATE POLICY "PackItems: lectura pública" ON pack_items FOR SELECT TO public USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "PackItems: escritura solo admin" ON pack_items';
    EXECUTE 'CREATE POLICY "PackItems: escritura solo admin" ON pack_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 5. STORAGE (bucket "productos"): subida de imágenes solo admin
-- ═══════════════════════════════════════════════════════════════════════════
-- Nota: si creaste políticas propias de INSERT para anon en storage.objects,
-- eliminalas desde Storage > Policies en el dashboard.

DROP POLICY IF EXISTS "productos bucket: upload solo admin" ON storage.objects;
CREATE POLICY "productos bucket: upload solo admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'productos' AND public.is_admin());

-- 6. REGISTRAR TU USUARIO ADMIN
-- ═══════════════════════════════════════════════════════════════════════════
-- El panel /admin ahora exige un usuario de Supabase Auth listado en
-- admin_users. Crea el usuario en Authentication > Users y luego:
--
--   INSERT INTO admin_users (id)
--   SELECT id FROM auth.users WHERE email = 'TU_EMAIL_ADMIN'
--   ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- ═══════════════════════════════════════════════════════════════════════════
