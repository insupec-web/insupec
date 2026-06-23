# 🚀 Configuración Rápida de Supabase - INSUPEC

## 📋 Checklist de Configuración

Sigue estos pasos en orden. Toma ~5 minutos.

---

## PASO 1: Crear las Tablas (SQL)

### 1.1 Abre el SQL Editor de Supabase

1. Ve a tu proyecto en Supabase
2. Click en **SQL Editor** (lado izquierdo)
3. Click en **New Query**

### 1.2 Copia el Script SQL

1. Abre el archivo: `SUPABASE_SETUP.sql`
2. **Copia TODO el contenido**
3. Pega en el SQL Editor de Supabase
4. Click en **Run** (botón azul)

✅ **Resultado esperado:**
- Tablas `productos` y `pedidos` creadas
- Índices creados
- RLS configurado

---

## PASO 2: Crear el Storage Bucket

### 2.1 Ve a Storage

1. En Supabase, click en **Storage** (lado izquierdo)
2. Click en **Create a new bucket**

### 2.2 Configura el bucket

**Nombre del bucket:** `productos`

**Configuración:**
- ✅ Public bucket (marca la opción)
- ✅ Create bucket

### 2.3 Configura Políticas de Storage (Opcional pero recomendado)

1. Click en el bucket `productos`
2. Click en **Policies** (tab derecho)
3. Click en **New Policy** → **For full customization**

**Policy 1 - Allow Public Read:**
```
Allowed operations: SELECT
Target roles: public
USING expression: true
```

**Policy 2 - Allow All File Operations (Admin):**
```
Allowed operations: SELECT, INSERT, UPDATE, DELETE
Target roles: authenticated
USING expression: true
WITH CHECK expression: true
```

✅ **Resultado esperado:**
- Bucket `productos` creado
- Acceso público configurado

---

## PASO 3: Actualiza las Variables de Entorno

### 3.1 Copia tus credenciales de Supabase

En tu proyecto Supabase:
1. Click en **Settings** → **API**
2. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3.2 Actualiza el archivo `.env.local`

En tu proyecto local (`insupec/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_WHATSAPP_NUMBER=5493492615886
```

### 3.3 Actualiza en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega/actualiza:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy** → Redeploy production

✅ **Resultado esperado:**
- Variables configuradas en local y Vercel
- Aplicación conectada a Supabase

---

## PASO 4: Prueba la Configuración

### 4.1 Local (opcional)

```bash
cd insupec
npm run dev
# Ve a http://localhost:3000/productos
# Deberías ver el catálogo (aunque esté vacío)
```

### 4.2 En Vercel

1. Ve a tu URL de Vercel (o dominio personalizado)
2. Verifica que cargue sin errores
3. Click en un producto para verificar que funciona

✅ **Listo para ir en vivo!**

---

## PASO 5: Agregar Productos (Admin)

### 5.1 Acceder al Admin Panel

1. Ve a: `https://tudominio.com/admin/login`
2. Usuario: `gero`
3. Contraseña: `1234`

### 5.2 Crear Productos

1. Click en **Crear Producto**
2. Completa el formulario:
   - Nombre
   - Precio
   - Stock
   - Fecha de Vencimiento
   - Foto (se sube automáticamente a Storage)
3. Click **GUARDAR PRODUCTO**

✅ **El producto aparece en el catálogo automáticamente**

---

## 🔍 Verificación Final

### ✅ Checklist

- [ ] Tablas creadas (productos, pedidos)
- [ ] Storage bucket `productos` creado
- [ ] Variables de entorno actualizadas
- [ ] Vercel redeployed
- [ ] Página de productos carga sin errores
- [ ] Admin panel accesible (gero / 1234)
- [ ] Puedes crear un producto de prueba

---

## 🆘 Solución de Problemas

### Error: "Invalid supabaseUrl"
- Verifica que hayas copiado bien `NEXT_PUBLIC_SUPABASE_URL`
- Debe ser: `https://xxxxx.supabase.co` (con https)

### Error: "Anon key is invalid"
- Copia la **anon public key**, no la service key
- Está en: Settings → API → Project API Keys

### Error: "No se pueden crear productos"
- Verifica que el bucket `productos` existe
- Verifica que Storage RLS está configurado correctamente

### El catálogo está vacío
- Es normal si no has creado productos
- Ve al admin y crea al menos uno

---

## 📚 Archivos Importantes

- `SUPABASE_SETUP.sql` → Script para crear tablas
- `.env.local` → Variables de entorno (local)
- Vercel Settings → Variables de entorno (producción)

---

## ⏱️ Tiempo Estimado

- Crear tablas: 1 minuto
- Crear bucket: 1 minuto
- Actualizar variables: 2 minutos
- Redeploy: 1 minuto

**Total: ~5 minutos** ⚡

---

## 🎉 ¡Listo!

La plataforma está completamente operacional.

**Próximos pasos:**
1. Agrega productos al catálogo
2. Prueba hacer un pedido desde el cliente
3. Verifica que el pedido llega por WhatsApp
4. Ajusta precios/descripciones según necesites

¡Vamos! 🚀
