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
  cantidad INTEGER NOT NULL DEFAULT 0,
  vencimiento DATE NOT NULL,
  foto_url VARCHAR(500),
  laboratorio VARCHAR(255),
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
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  transporte VARCHAR(100),
  confirmado BOOLEAN DEFAULT false,
  productos JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT now()
);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(email);
CREATE INDEX IF NOT EXISTS idx_pedidos_timestamp ON pedidos(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_telefono ON pedidos(telefono);

-- 3. CREAR TABLA DE PAGE VISITS (Analytics)
-- ═══════════════════════════════════════════════════════════════════════════

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

-- 4. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════
-- Las políticas de seguridad viven en un único script para evitar
-- versiones desactualizadas. Después de crear las tablas, ejecuta:
--
--   SUPABASE_FIX_RLS_SECURITY.sql
--
-- Ese script habilita RLS y aplica el modelo:
--   público  -> ver productos, crear pedidos, registrar visitas
--   admin    -> (usuario Auth en admin_users) todo lo demás
--
-- NUNCA crees políticas que den escritura o lectura de pedidos al rol
-- "anon": la anon key es pública en el bundle del frontend.

-- 5. DATOS DE EJEMPLO (OPCIONAL - Descomenta si quieres)
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
