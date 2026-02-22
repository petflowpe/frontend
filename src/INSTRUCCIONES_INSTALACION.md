# 📦 INSTRUCCIONES DE INSTALACIÓN DE DEPENDENCIAS

## 🚀 PASO 1: Instalar Dependencias

Abre tu terminal en la raíz del proyecto SmartPet y ejecuta:

```bash
npm install @sentry/react xlsx date-fns
```

### ¿Qué instala cada paquete?

| Paquete | Versión | Uso | Archivo |
|---------|---------|-----|---------|
| **@sentry/react** | Latest | Monitoreo de errores en producción | `/services/sentry.ts` |
| **xlsx** | Latest | Exportación de datos a Excel | `/components/DataExport.tsx` |
| **date-fns** | Latest | Validación y manipulación de fechas | `/services/availabilityValidator.ts` |

---

## ✅ VERIFICACIÓN DE INSTALACIÓN

Después de instalar, verifica que todo esté correcto:

```bash
# Ver las versiones instaladas
npm list @sentry/react xlsx date-fns

# Deberías ver algo como:
# @sentry/react@X.X.X
# xlsx@X.X.X  
# date-fns@X.X.X
```

---

## 🔧 PASO 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local

# ===== SENTRY (Monitoreo de Errores) =====
# Obtén tu DSN en: https://sentry.io
# 1. Crea una cuenta gratis en sentry.io
# 2. Crea un proyecto "SmartPet"
# 3. Copia el DSN que te dan
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Entorno (development, staging, production)
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# ===== SUPABASE (Base de Datos) =====
# Por ahora dejalo vacío, lo configuraremos después
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=

# ===== EMAIL (Recuperación de Password) =====
# Por ahora dejalo vacío, lo configuraremos después
# EMAIL_SERVICE_API_KEY=
# EMAIL_FROM_ADDRESS=noreply@smartpet.com
```

---

## 🎯 PASO 3: Verificar que Todo Funciona

### Opción A: Sin Sentry configurado (modo desarrollo)

```bash
# Inicia el servidor de desarrollo
npm run dev
```

**Resultado esperado:**
- ✅ La app inicia sin errores
- ✅ Consola muestra: "Sentry no configurado - ejecutando en modo seguro"
- ✅ Todas las funcionalidades funcionan (excepto reportar a Sentry)

### Opción B: Con Sentry configurado

1. Crea cuenta en https://sentry.io (gratis)
2. Crea proyecto "SmartPet"
3. Copia el DSN
4. Pégalo en `.env.local`
5. Reinicia el servidor

```bash
npm run dev
```

**Resultado esperado:**
- ✅ La app inicia sin errores
- ✅ Consola muestra: "✓ Sentry inicializado correctamente"
- ✅ Errores se reportan automáticamente a Sentry

---

## 🧪 PASO 4: Probar Cada Quick Win

### 1️⃣ Error Boundary (Ya funciona automáticamente)

```typescript
// No necesitas hacer nada, ya está activo
// Para testear, dispara un error intencional:

// En cualquier componente, agrega:
throw new Error('Test de Error Boundary');

// Deberías ver una pantalla elegante en lugar de pantallazo blanco
```

### 2️⃣ Validador de Disponibilidad

```typescript
// Abre la consola del navegador y ejecuta:

import { createAvailabilityValidator } from './services/availabilityValidator';

const validator = createAvailabilityValidator([]);
const result = await validator.validate(
  '2024-12-31',
  '10:00',
  'VEH-001',
  ['SRV-001']
);

console.log('Resultado:', result);
// Debería mostrar: { available: true, conflicts: [], ... }
```

### 3️⃣ Sentry Monitoring

```typescript
// Opción A: Sin configurar (modo seguro)
// Todo funciona, pero no se reporta a Sentry

// Opción B: Configurado
// Abre la consola y ejecuta:

import { errorMonitoring } from './services/sentry';

errorMonitoring.captureMessage('Test de Sentry', 'info');

// Ve a tu dashboard de Sentry.io
// Deberías ver el mensaje "Test de Sentry"
```

### 4️⃣ Recuperación de Password

```bash
# 1. Ve a la app en el navegador
# 2. Sidebar → Configuración → Login (si existe)
# 3. Click en "¿Olvidaste tu contraseña?"
# 4. Deberías ver el flujo de 4 pasos

# Por ahora usa un email falso para testear la UI
# El backend lo implementaremos después
```

### 5️⃣ Exportación de Datos

```bash
# 1. Ve a la app en el navegador
# 2. Sidebar → "💾 Exportar Datos" (nuevo botón)
# 3. Selecciona algunas tablas
# 4. Click en "Exportar Seleccionadas"

# Deberías descargar un archivo JSON con los datos
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### Error 1: `Cannot find module '@sentry/react'`

**Solución:**
```bash
# Verifica que las dependencias se instalaron
npm list @sentry/react

# Si no aparece, reinstala
npm install @sentry/react --save
```

### Error 2: `Module not found: Can't resolve 'xlsx'`

**Solución:**
```bash
npm install xlsx --save
```

### Error 3: `process is not defined`

**Solución:**
✅ Ya está resuelto. Todos los archivos usan helpers seguros que funcionan en el navegador.

### Error 4: Variables de entorno no se cargan

**Solución:**
```bash
# 1. Verifica que el archivo se llame .env.local (no .env)
# 2. Reinicia el servidor de desarrollo
npm run dev

# 3. Si usas Next.js, las variables deben empezar con NEXT_PUBLIC_
# 4. Si usas Vite, deben empezar con VITE_
```

---

## 📊 CHECKLIST DE INSTALACIÓN

- [ ] Ejecuté `npm install @sentry/react xlsx date-fns`
- [ ] Verifiqué que se instalaron con `npm list`
- [ ] Creé el archivo `.env.local`
- [ ] Agregué al menos `NEXT_PUBLIC_SENTRY_DSN` (o lo dejé vacío)
- [ ] Reinicié el servidor con `npm run dev`
- [ ] La app inicia sin errores
- [ ] Probé "Exportar Datos" desde el sidebar
- [ ] Descargué un archivo JSON de prueba

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Una vez completados todos los pasos, tendrás:

✅ **Error Boundaries** protegiendo tu app  
✅ **Sentry** monitoreando errores (cuando configures DSN)  
✅ **Validador** listo para prevenir double-bookings  
✅ **Password Recovery** UI completa (backend pendiente)  
✅ **Exportación** funcionando con datos mock  

---

## 🚀 PRÓXIMOS PASOS

### Ahora (5 minutos)
```bash
npm install @sentry/react xlsx date-fns
```

### Hoy (30 minutos)
1. Crear cuenta Sentry.io
2. Obtener DSN
3. Configurar `.env.local`
4. Testear exportación

### Esta semana
1. Conectar Supabase
2. Integrar validador en Appointments
3. Backend de password recovery

---

## 📞 ¿NECESITAS AYUDA?

Si encuentras algún error después de instalar:

1. **Copia el error completo** de la consola
2. **Verifica** que instalaste las 3 dependencias
3. **Reinicia** el servidor (`npm run dev`)
4. **Revisa** que `.env.local` exista (aunque esté vacío)

---

**🎊 ¡Ya casi terminas! Solo falta ejecutar el comando en tu terminal 🎊**
