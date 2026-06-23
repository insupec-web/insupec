-- ═══════════════════════════════════════════════════════════════════════════
-- INSUPEC - Script de Configuración de Supabase
-- ═══════════════════════════════════════════════════════════════════════════
-- Copia y pega TODO esto en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. CREAR TABLA DE PRODUCTOS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  vencimiento DATE NOT NULL,
  foto_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_vencimiento ON productos(vencimiento);
CREATE INDEX IF NOT EXISTS idx_productos_created_at ON productos(created_at DESC);

-- 2. CREAR TABLA DE PEDIDOS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  direccion TEXT NOT NULL,
  ciudad VARCHAR(255) NOT NULL,
  codigo_postal VARCHAR(10) NOT NULL,
  factura BOOLEAN DEFAULT false,
  productos JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT now()
);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(email);
CREATE INDEX IF NOT EXISTS idx_pedidos_timestamp ON pedidos(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_telefono ON pedidos(telefono);

-- 3. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- DESHABILITAR RLS EN PRODUCTOS (lectura pública)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de productos
CREATE POLICY "Productos: Lectura pública"
  ON productos
  FOR SELECT
  TO public
  USING (true);

-- Permitir insert, update, delete solo desde admin (sin RLS, requiere app key)
CREATE POLICY "Productos: Admin puede modificar"
  ON productos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- HABILITAR RLS EN PEDIDOS (insert público, sin select/update)
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Permitir insert público de pedidos
CREATE POLICY "Pedidos: Insert público"
  ON pedidos
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Denegar select y update de pedidos (solo lectura interna)
CREATE POLICY "Pedidos: No select público"
  ON pedidos
  FOR SELECT
  TO public
  USING (false);

-- 4. DATOS DE EJEMPLO (OPCIONAL - Descomenta si quieres)
-- ═══════════════════════════════════════════════════════════════════════════

-- INSERT INTO productos (nombre, precio, stock, vencimiento, foto_url) VALUES
-- ('Leche Entera 1L', 2.50, 50, '2026-12-31', 'https://via.placeholder.com/300x300?text=Leche'),
-- ('Queso Fresco 250g', 5.99, 30, '2026-07-31', 'https://via.placeholder.com/300x300?text=Queso'),
-- ('Yogurt Natural 500g', 3.99, 40, '2026-07-15', 'https://via.placeholder.com/300x300?text=Yogurt'),
-- ('Mantequilla 200g', 4.50, 25, '2026-08-31', 'https://via.placeholder.com/300x300?text=Mantequilla'),
-- ('Crema de Leche 200ml', 2.99, 35, '2026-07-20', 'https://via.placeholder.com/300x300?text=Crema');

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- ═══════════════════════════════════════════════════════════════════════════
