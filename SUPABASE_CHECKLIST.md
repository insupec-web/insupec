# ✅ Checklist de Configuración Supabase

Para que TODO funcione correctamente en esta versión, debes ejecutar los siguientes scripts en Supabase SQL Editor en este orden:

## Opción 1: Base de datos NUEVA

Si es una base de datos nueva, ejecuta SOLO esto:

```bash
SUPABASE_SETUP.sql
```

Este script crea:
- ✅ Tabla `productos` (con columnas: nombre, precio, cantidad, vencimiento, foto_url, laboratorio)
- ✅ Tabla `pedidos` (con columnas: datos cliente, metodo_pago, transporte, confirmado, productos JSONB, total)
- ✅ Políticas de seguridad (RLS) para ambas tablas
- ✅ Índices de performance

---

## Opción 2: Base de datos EXISTENTE

Si ya tienes una base de datos con tablas, ejecuta en este orden:

### Paso 1: Renombrar columna de stock a cantidad
```bash
SUPABASE_MIGRATE_STOCK_TO_CANTIDAD.sql
```

**¿Por qué?** El código de deducción de stock usa `cantidad`, no `stock`.

### Paso 2: Agregar columnas faltantes a pedidos
```bash
SUPABASE_ALTER_PEDIDOS.sql
```

Agrega:
- `metodo_pago` (efectivo o transferencia)
- `transporte` (envio o retiro)
- `confirmado` (boolean para estado)

---

## ✅ Verificación

Una vez ejecutados los scripts, verifica en Supabase:

### Tabla `productos`
```sql
SELECT * FROM productos LIMIT 1;
```

Debe tener estas columnas:
- id (UUID)
- nombre (VARCHAR)
- precio (DECIMAL)
- **cantidad** (INTEGER) ← Importante: debe ser "cantidad", no "stock"
- vencimiento (DATE)
- foto_url (VARCHAR)
- laboratorio (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Tabla `pedidos`
```sql
SELECT * FROM pedidos LIMIT 1;
```

Debe tener estas columnas:
- id (UUID)
- nombre, apellido, razon_social, email, telefono
- direccion, ciudad, codigo_postal
- **metodo_pago** (VARCHAR)
- **transporte** (VARCHAR)
- **confirmado** (BOOLEAN)
- factura (BOOLEAN)
- productos (JSONB)
- total (DECIMAL)
- timestamp (TIMESTAMP)

---

## 🔐 Seguridad (RLS)

Verifica que existan estas políticas:

**Productos:**
- ✅ "Productos: Lectura pública" (SELECT - público)
- ✅ "Productos: Admin puede modificar" (ALL - anon)

**Pedidos:**
- ✅ "Pedidos: Insert público" (INSERT - público)
- ✅ "Pedidos: No select público" (SELECT - denegado)

---

## 📋 Variables de Entorno

Asegúrate de tener en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_WHATSAPP_NUMBER=5493492615886
```

---

## ✨ Funcionalidades que requieren esta config

✅ **Productos:** Crear, editar, importar, filtrar, buscar
✅ **Carrito:** Agregar/remover productos
✅ **Checkout:** Métodos de pago, forma de entrega, envío por WhatsApp
✅ **Admin Productos:** CRUD completo
✅ **Admin Pedidos:** Ver, confirmar, cancelar, deducción automática de stock
✅ **Stock:** Se actualiza solo cuando confirmas un pedido en admin

---

## 🐛 Troubleshooting

**Error: "cantidad" column not found**
→ Ejecuta `SUPABASE_MIGRATE_STOCK_TO_CANTIDAD.sql`

**Error: "metodo_pago" column not found**
→ Ejecuta `SUPABASE_ALTER_PEDIDOS.sql`

**Error: RLS policy doesn't exist**
→ Ejecuta `SUPABASE_SETUP.sql` nuevamente (las políticas se crearán)

**Stock no se actualiza al confirmar pedido**
→ Verifica que la columna se llame `cantidad`, no `stock`

---

**Última actualización:** 2026-06-23
**Estado:** ✅ Listo para producción
