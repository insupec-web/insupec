# INSUPEC - Plataforma de Pedidos Online

Plataforma de ecommerce moderna para gestión de pedidos de productos INSUPEC, desarrollada con Next.js 14, React 18, Tailwind CSS y Supabase.

## ✨ Características

- 📦 **Catálogo de Productos**: Grid responsivo con detalles de productos, stock y vencimiento
- 🛒 **Carrito Persistente**: LocalStorage para mantener el carrito entre sesiones
- 📝 **Checkout**: Formulario completo con integración WhatsApp
- 📱 **Responsive Design**: Diseño mobile-first optimizado
- 🔐 **Admin Panel**: Gestión completa de productos (CRUD)
- 💚 **Tema Personalizado**: Verde INSUPEC (#4ca82b) como color principal
- ⚡ **Performance**: Next.js 14 con App Router

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ (recomendado 20+)
- npm o yarn
- Cuenta en Supabase

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/insupec-web/insupec
cd insupec
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase** (ver sección abajo)

4. **Variables de entorno** (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WHATSAPP_NUMBER=5493492615886
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```
Acceder a http://localhost:3000

## 🗄️ Configuración de Supabase

### 1. Crear proyecto en Supabase
https://supabase.com → Crear nuevo proyecto

### 2. Crear tablas

**Tabla: productos**
```sql
CREATE TABLE productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL,
  vencimiento DATE NOT NULL,
  foto_url VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

**Tabla: pedidos**
```sql
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  apellido VARCHAR NOT NULL,
  razon_social VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  telefono VARCHAR NOT NULL,
  direccion VARCHAR NOT NULL,
  ciudad VARCHAR NOT NULL,
  codigo_postal VARCHAR NOT NULL,
  factura BOOLEAN DEFAULT false,
  productos JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT now()
);
```

### 3. Crear Storage bucket
- Nombre: `productos`
- Acceso: Public

### 4. Configurar RLS
- **productos**: Deshabilitar RLS
- **pedidos**: Habilitar RLS (insert permitido, select/update deshabilitado)

## 🎯 Uso

### Cliente
- **Catálogo**: http://localhost:3000/productos
- **Carrito**: http://localhost:3000/carrito
- **Checkout**: http://localhost:3000/checkout

### Admin
- **Login**: http://localhost:3000/admin/login
- **Dashboard**: http://localhost:3000/admin/dashboard

**Credenciales Demo:**
- Usuario: `gero`
- Contraseña: `1234`

## 📁 Estructura del Proyecto

```
insupec/
├── app/                    # App Router (Next.js 14)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Redirect a /productos
│   ├── productos/         # Catálogo y detalle
│   ├── carrito/           # Vista del carrito
│   ├── checkout/          # Checkout y WhatsApp
│   └── admin/             # Panel administrativo
├── components/            # Componentes reutilizables
├── hooks/                 # Custom hooks (Cart, Auth)
├── lib/                   # Utilidades (Supabase, Auth, WhatsApp)
└── public/                # Assets estáticos
```

## 🚢 Deploy

### Vercel (Recomendado)
1. Conectar repo a Vercel
2. Agregar environment variables
3. Deploy automático

### Configuración de dominio
Actualizar DNS en solo10.com para apuntar a Vercel

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Cambiar las credenciales admin en producción
- Archivo: `lib/auth.ts`
- Variables: `ADMIN_USERNAME`, `ADMIN_PASSWORD`

## 📦 Stack Tecnológico

- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Supabase** - Backend & Storage
- **TypeScript** - Type safety

## 📝 Notas

- El carrito persiste en localStorage
- Las imágenes se suben a Supabase Storage
- Los pedidos se guardan para historial
- Integración directa con WhatsApp
- Interfaz completamente responsive

## 👥 Contacto

- **WhatsApp**: 5493492615886
- **Email**: contacto@insupec.com

## 📄 Licencia

Privado - INSUPEC 2024
