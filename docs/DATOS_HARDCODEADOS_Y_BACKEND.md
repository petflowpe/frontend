# Datos hardcodeados y conexión con API/Backend

Documento de referencia: dónde hay datos estáticos y qué backend existe o falta.

---

## ✅ Ya con API en backend – solo conectar frontend

| Ubicación | Dato hardcodeado | Endpoint backend | Acción |
|-----------|------------------|------------------|--------|
| **Accounting.tsx** | `accountingEntries` (array estático ~120 líneas) | `GET/POST /accounting-entries` | Crear `useAccountingEntries`, cargar y guardar desde API |
| **Routes.tsx** | `zones` (useState con 11 zonas estáticas) | `GET/POST/PUT/DELETE /zones` | Cargar zonas con `useZones` o similar; inicializar vacío y fetch al montar |
| **Routes.tsx** | Sync ya usa `api.fetch('/zones')` y `api.save/delete` | Mismo | Asegurar que la carga inicial sea desde API, no desde el array estático |

---

## ⚠️ Listas de opciones (config) – pueden venir del backend

| Ubicación | Dato | Archivo | Sugerencia |
|-----------|------|---------|------------|
| **Staff.tsx** / **Staff_NEW.tsx** | `EMPLOYEE_POSITION_OPTIONS`, `EMPLOYEE_STATUS_OPTIONS`, `COST_CENTER_OPTIONS` | `config/defaults.ts` | API de “opciones” o “configuración” (ej. `/settings` o `/options/employee`) |
| **VehicleManagement.tsx** | `DEFAULT_BRANDS`, `MAINTENANCE_TYPES` | Componente + `defaults.ts` | Backend tiene `brands` (`/brands`). Tipos de mantenimiento: nuevo endpoint o tabla de configuración |
| **PetsManagement.tsx** / **Clients.tsx** | `PET_DOG_BREEDS`, `PET_CAT_BREEDS`, `PET_TEMPERAMENTS`, `PET_BEHAVIORS` | `config/defaults.ts` | API de catálogos (razas, temperamentos, comportamientos) o usar `petConfigurations` si aplica |
| **AccountingConfig.tsx** | `DEFAULT_ACCOUNTING_MAPPINGS`, `ACCOUNTING_ACCOUNTS_PERU`, etc. | `config/accounting-peru.ts` | Endpoint de configuración contable por empresa/país |
| **DispatchGuideForm.tsx** | Motivos de traslado `[{ code: '01', name: 'Venta' }, ...]` | Inline | Catálogo SUNAT desde backend (ubigeos u otro módulo) |

---

## ❌ Sin endpoint hoy – requieren nuevo desarrollo en backend

| Ubicación | Dato | Descripción |
|-----------|------|-------------|
| **OperationsCenter.tsx** | `MOCK_UNITS`, `MOCK_ALERTS`, `MOCK_MESSAGES` | Unidades en tiempo real, alertas y mensajes del centro de operaciones. Necesita API/WebSocket para datos en vivo |
| **Routes.tsx** | `fixedClients` (useState con clientes de ejemplo) | Lista de clientes con agenda fija. Debe salir de `clients` filtrando por criterio (ej. `?fixed_schedule=1`) o endpoint específico |
| **Routes.tsx** | `vehicleZoneConfig` (4 vehículos estáticos con zonas) | Configuración vehículo–zonas. Nuevo recurso tipo `/vehicle-zone-config` o extensión de `vehicles` + `zones` |
| **Settings.tsx** | `templates` (plantillas de conformidad/consentimiento) | CRUD de plantillas. Nuevo endpoint ej. `/document-templates` o dentro de `/settings` |
| **ChatAutomationConfig.tsx** | `responses`, `welcomeMessage` | Respuestas automáticas y mensaje de bienvenida del chat. Nuevo endpoint ej. `/chat-automation` o `/settings/chat` |
| **useTenantContext.ts** | `tenant` (objeto demo hardcodeado) | Tenant actual. API tipo `GET /tenant` o `GET /me` que devuelva tenant/empresa según token o subdominio |
| **Clients.tsx** | `zones` (array de 4 zonas estáticas para asignación) | Mismo concepto que Routes: usar API `/zones` y quitar array local |

---

## 🔐 Auth / recuperación de contraseña

| Ubicación | Dato | Nota |
|-----------|------|------|
| **PasswordRecovery.tsx** | `'mock_token'` en flujo de reset | En producción debe venir del paso anterior (email/código). Reemplazar por token real del backend |
| **verify-reset-code.ts** (pages/api) | `mock_token_${email}_${Date.now()}` | API route: debe validar código contra backend y devolver token real |
| **reset-password.ts** (pages/api) | `mock_hash_...` | Debe llamar al backend para cambiar contraseña |
| **passwordResetService.ts** | `mock_token`, `mock_hash` | Mismo flujo: integrar con endpoints reales de Laravel |

---

## 📦 Fallbacks (solo cuando API falla o no hay datos)

| Ubicación | Dato | Uso actual |
|-----------|------|------------|
| **useProducts.ts** | `DEFAULT_SERVICES`, `DEFAULT_PRODUCTS` | Fallback cuando no hay productos en backend. Mantener como respaldo; prioridad es que la API devuelva datos |
| **useAreas.ts**, **useCategories.ts**, **useVehicles.ts**, **useSuppliers.ts**, **usePurchases.ts** | `DEFAULT_COMPANY_ID = 1` | Company id por defecto. Idealmente viene de tenant/auth (ej. `useAuth().companyId`) |
| **useClientCategory.ts** | Valores por defecto en `getCategoryDetails()` | Fallback si no hay configuración de categorías del tenant. Mejor que el tenant envíe beneficios/etiquetas por API |
| **Notifications.tsx** / **notificationService.ts** | `DEFAULT_CONFIG` | Config por defecto de notificaciones. Puede convivir con `GET/PUT /settings` |
| **config/defaults.ts** | `DEFAULT_BUSINESS_CONFIG`, `DEFAULT_WORKING_HOURS`, `DEFAULT_SERVICES`, `DEFAULT_PAYMENT_METHODS`, etc. | Valores por defecto de negocio/horarios/servicios/medios de pago. Sustituir por configuración cargada desde backend (empresa/tenant) |

---

## Resumen de prioridades

1. **Conectar ya (backend existe)**  
   - **Accounting.tsx** → `useAccountingEntries` + API `accounting-entries`.  
   - **Routes.tsx** (y **Clients.tsx**) → Carga inicial de **zones** desde `/zones`.

2. **Definir API y conectar**  
   - **fixedClients** y **vehicleZoneConfig** en Routes (o filtros sobre `clients`/`vehicles`).  
   - **useTenantContext** → endpoint de tenant/empresa actual.  
   - **Settings.tsx** (plantillas) y **ChatAutomationConfig.tsx** (respuestas/mensaje bienvenida).  
   - **OperationsCenter** (unidades, alertas, mensajes) si se quiere datos reales.

3. **Catálogos y config**  
   - Razas, temperamentos, comportamientos de mascotas.  
   - Opciones de empleado (cargos, estados, centros de costo).  
   - Marcas y tipos de mantenimiento (brands ya existe).  
   - Configuración contable (Perú) y motivos de traslado SUNAT.

4. **Auth**  
   - Reemplazar todos los `mock_token` / `mock_hash` por flujo real con el backend (verificación de código y reset de contraseña).

Cuando quieras, podemos bajar esto a tareas concretas (por ejemplo: “implementar useAccountingEntries y conectar Accounting.tsx”) y hacerlo paso a paso.
