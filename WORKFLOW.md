# 🚀 Workflow Claude Code + GitHub

## Configuración Completada ✅

- **GitHub User**: geromendez199
- **Repository**: insupec-web/insupec
- **Branch**: main
- **Auth**: GitHub Personal Access Token
- **Status**: Conectado y listo para auto-push

---

## 📋 Cómo Trabajamos Juntos

### Flujo de Trabajo Automático

Cada vez que hagamos cambios juntos:

```bash
# 1. Vos (usuario): Solicitas cambios
#    "Agrega una nueva página de contacto"

# 2. Yo (Claude): Hago los cambios
#    - Edito/creo archivos
#    - Hago pruebas

# 3. Yo: Hago commit y push AUTOMÁTICO
git add .
git commit -m "descripción clara del cambio"
git push origin main
#    ↓
# El código se sube directamente a GitHub ✅
```

---

## 🎯 Comandos Disponibles

### Opción 1: Auto-Push con Timestamp
```bash
git quickpush
```
Esto:
- ✅ Agrega todos los cambios (`git add -A`)
- ✅ Crea un commit automático con fecha/hora
- ✅ Hace push a main
- ✅ **Sin preguntas, sin interacción**

**Ejemplo:**
```
Auto-commit: 2026-06-23 14:30:45
```

### Opción 2: Push con Mensaje Personalizado
```bash
git pushcommit "Agrega validación de email en checkout"
```
Esto:
- ✅ Agrega todos los cambios
- ✅ Crea un commit con tu mensaje
- ✅ Hace push a main

---

## 📝 Mi Proceso Para Cada Cambio

Cuando me pidas cambios, yo voy a:

1. **Leer la solicitud**
   - "Agrega feature X"
   - "Corrige bug Y"
   - "Mejora performance en Z"

2. **Hacer los cambios**
   - Edito archivos
   - Creo componentes nuevos
   - Actualizo configuración

3. **Testear localmente**
   - `npm run build` para verificar
   - Chequeo TypeScript
   - Valido la lógica

4. **Hacer commit y push automático**
   ```bash
   git add .
   git commit -m "Feature: [descripción clara]"
   git push origin main
   ```

5. **Reportar el resultado**
   - "✅ Cambios pusheados a main"
   - "📊 Cambios: 3 archivos, 150 líneas"
   - "🔗 Ver en GitHub: [link]"

---

## 🔐 Seguridad

✅ **Token seguro**: GitHub Personal Access Token (ghp_...)
✅ **Permisos limitados**: Solo repo y workflow
✅ **Configuración global**: Almacenado en git config
✅ **Auto-cleanup**: Se puede revocar en cualquier momento

### Si necesitas revocar el token:
1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Busca "INSUPEC_CLAUDE_PUSH"
3. Click "Delete"
4. El acceso se revoca inmediatamente

---

## 📊 Ejemplo de Sesión de Trabajo

### Tú (Usuario):
> "Agrega una sección de testimonios en la homepage"

### Yo (Claude):
1. Creo el componente `Testimonios.tsx`
2. Agrego las rutas necesarias
3. Hago push automático
4. Reporto:

```
✅ Cambios pusheados a main

Cambios realizados:
  📄 components/Testimonios.tsx (150 líneas)
  📝 app/page.tsx (+5 líneas)
  🎨 app/globals.css (+20 líneas)

Ver en GitHub:
https://github.com/insupec-web/insupec/commits/main
```

---

## 🚨 Si algo sale mal

Si hay un error en el build o un problema:

1. ❌ **No hago push**
2. 🔍 **Investigo el problema**
3. 🔧 **Corrijo el código**
4. ✅ **Hago push solo cuando esté listo**

---

## 📚 Comandos Útiles

```bash
# Ver historial de commits
git log --oneline -10

# Ver cambios antes de hacer push
git status
git diff

# Ver estado del push
git log --oneline -1

# Verificar que está todo sincronizado
git fetch origin
git status
```

---

## 🎉 ¡Listo para Trabajar!

Todo está configurado y conectado a GitHub. Cada cambio se hará push automáticamente a `main`.

**Próximos pasos:**
1. ✅ Código inicial en GitHub
2. ⏳ Esperando tus solicitudes de cambios
3. 🚀 Cada cambio se pushea automáticamente

¡Vamos a construir INSUPEC juntos! 🚀
