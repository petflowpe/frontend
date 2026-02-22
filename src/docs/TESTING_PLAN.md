# 🧪 PLAN DE TESTING EXHAUSTIVO - SmartPet

## 📋 ÍNDICE

1. [Testing de Autenticación](#testing-autenticación)
2. [Testing de Citas (Appointments)](#testing-citas)
3. [Testing de Clientes](#testing-clientes)
4. [Testing de Password Recovery](#testing-password-recovery)
5. [Testing de Exportación](#testing-exportación)
6. [Testing de Tooltips](#testing-tooltips)
7. [Testing de Performance](#testing-performance)
8. [Testing de Seguridad](#testing-seguridad)
9. [Testing de UI/UX](#testing-uiux)
10. [Checklist Final](#checklist-final)

---

## 1️⃣ TESTING DE AUTENTICACIÓN

### Test Cases - Login

#### TC-AUTH-001: Login exitoso con credenciales válidas
**Prioridad:** Alta  
**Tipo:** Funcional

**Pre-condiciones:**
- Sistema iniciado
- Usuario no autenticado

**Pasos:**
1. Abrir aplicación
2. Ingresar email: `admin@smartpet.com`
3. Ingresar password: `Admin123`
4. Click en "Iniciar Sesión"

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Toast: "¡Bienvenido! Has iniciado sesión como Administrador"
- ✅ Redirección a Dashboard
- ✅ Header muestra nombre de usuario
- ✅ Sesión guardada en localStorage (si "Recordarme" activo)

**Resultado real:** _________

---

#### TC-AUTH-002: Login con credenciales incorrectas
**Prioridad:** Alta  
**Tipo:** Negativo

**Pasos:**
1. Email: `admin@smartpet.com`
2. Password: `WrongPassword`
3. Click "Iniciar Sesión"

**Resultado esperado:**
- ❌ Login falla
- ❌ Toast error: "Credenciales incorrectas"
- ❌ No redirige
- ❌ Campo password se limpia

**Resultado real:** _________

---

#### TC-AUTH-003: Login con email inválido
**Prioridad:** Media  
**Tipo:** Validación

**Pasos:**
1. Email: `admin@invalid`
2. Password: `Admin123`
3. Click "Iniciar Sesión"

**Resultado esperado:**
- ❌ Toast error: "Email inválido"
- ❌ No intenta login

**Resultado real:** _________

---

#### TC-AUTH-004: Login con campos vacíos
**Prioridad:** Media  
**Tipo:** Validación

**Pasos:**
1. Dejar email vacío
2. Dejar password vacío
3. Click "Iniciar Sesión"

**Resultado esperado:**
- ❌ Toast error: "Por favor completa todos los campos"

**Resultado real:** _________

---

#### TC-AUTH-005: Funcionalidad "Recordarme"
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Marcar checkbox "Recordarme"
2. Login exitoso
3. Cerrar navegador
4. Abrir navegador nuevamente

**Resultado esperado:**
- ✅ Sesión persiste
- ✅ Usuario sigue autenticado
- ✅ No pide login nuevamente

**Resultado real:** _________

---

#### TC-AUTH-006: Login rápido (Dev Mode)
**Prioridad:** Baja  
**Tipo:** Funcional

**Pasos:**
1. Click en botón "👑 Admin"
2. Verificar que campos se llenan
3. Click "Iniciar Sesión"

**Resultado esperado:**
- ✅ Email: `admin@smartpet.com`
- ✅ Password: `Admin123`
- ✅ Login exitoso

**Resultado real:** _________

---

#### TC-AUTH-007: Logout
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Usuario autenticado
2. Click icono de usuario en header
3. Click "Cerrar Sesión"

**Resultado esperado:**
- ✅ Sesión cerrada
- ✅ Redirección a pantalla de login
- ✅ localStorage limpio
- ✅ sessionStorage limpio

**Resultado real:** _________

---

#### TC-AUTH-008: Persistencia de sesión (localStorage)
**Prioridad:** Alta  
**Tipo:** Técnico

**Pasos:**
1. Login con "Recordarme"
2. Abrir DevTools → Application → Local Storage
3. Verificar key `smartpet_session`

**Resultado esperado:**
```json
{
  "user": {
    "email": "admin@smartpet.com",
    "role": "admin",
    "name": "Administrador",
    "permissions": ["all"]
  },
  "timestamp": "2024-12-31T...",
  "rememberMe": true
}
```

**Resultado real:** _________

---

#### TC-AUTH-009: Diferentes roles de usuario
**Prioridad:** Alta  
**Tipo:** Funcional

**Test con cada rol:**

| Rol | Email | Password | Permisos Esperados |
|-----|-------|----------|-------------------|
| Admin | admin@smartpet.com | Admin123 | all |
| Veterinario | vet@smartpet.com | Vet123 | appointments, clients, pets, health-plans |
| Peluquero | groomer@smartpet.com | Groomer123 | appointments, clients, pets |
| Conductor | driver@smartpet.com | Driver123 | appointments, routes |

**Para cada rol:**
1. Login exitoso
2. Verificar permisos en consola
3. Verificar sidebar muestra opciones correctas

**Resultado real:** _________

---

#### TC-AUTH-010: Link "¿Olvidaste tu contraseña?"
**Prioridad:** Media  
**Tipo:** Navegación

**Pasos:**
1. En pantalla login
2. Click "¿Olvidaste tu contraseña?"

**Resultado esperado:**
- ✅ Redirige a Password Recovery
- ✅ Pantalla cambia correctamente

**Resultado real:** _________

---

## 2️⃣ TESTING DE CITAS (APPOINTMENTS)

### Test Cases - Appointments

#### TC-APPT-001: Crear cita básica exitosa
**Prioridad:** Crítica  
**Tipo:** Funcional

**Pasos:**
1. Login → Ir a Citas
2. Click "➕ Nueva Cita"
3. Seleccionar cliente: Juan Pérez
4. Seleccionar mascota: Rocky
5. Seleccionar servicio: Baño completo
6. Fecha: Mañana
7. Hora: 10:00 AM
8. Vehículo: Vehículo 1
9. Click "Crear Cita"

**Resultado esperado:**
- ✅ Toast: "✅ Horario disponible"
- ✅ Toast: "✅ Cita creada exitosamente"
- ✅ Cita aparece en lista
- ✅ Modal se cierra
- ✅ Formulario se resetea

**Resultado real:** _________

---

#### TC-APPT-002: Validador de disponibilidad - Conflicto
**Prioridad:** Crítica  
**Tipo:** Validación

**Pre-condiciones:**
- Ya existe una cita a las 10:00 AM para Vehículo 1

**Pasos:**
1. Intentar crear otra cita
2. Mismo vehículo
3. Misma hora (10:00 AM)
4. Click "Crear Cita"

**Resultado esperado:**
- ❌ Toast error: "Conflicto de horario detectado"
- ❌ Descripción con sugerencias:
  - Cambiar a 11:00 AM
  - Usar Vehículo 2
  - Cambiar fecha
- ❌ Cita NO se crea

**Resultado real:** _________

---

#### TC-APPT-003: Validación de horario laboral
**Prioridad:** Alta  
**Tipo:** Validación

**Casos de prueba:**

| Hora | Día | Esperado |
|------|-----|----------|
| 7:00 AM | Lunes | ❌ Fuera de horario |
| 8:00 AM | Lunes | ✅ Válido |
| 1:00 PM | Martes | ❌ Hora de almuerzo |
| 2:00 PM | Martes | ✅ Válido |
| 6:00 PM | Miércoles | ✅ Válido (última hora) |
| 7:00 PM | Miércoles | ❌ Fuera de horario |
| 10:00 AM | Sábado | ❌ Fin de semana |
| 10:00 AM | Domingo | ❌ Fin de semana |

**Resultado real:** _________

---

#### TC-APPT-004: Cálculo automático de duración
**Prioridad:** Alta  
**Tipo:** Cálculo

**Servicios:**
- Baño completo: 60 min
- Corte de pelo: 45 min
- Corte de uñas: 15 min

**Test:**
1. Agregar Baño completo + Corte de uñas
2. Verificar duración total

**Resultado esperado:**
- ✅ Duración total: 75 minutos
- ✅ Hora fin calculada correctamente

**Resultado real:** _________

---

#### TC-APPT-005: Cálculo de precio total
**Prioridad:** Alta  
**Tipo:** Cálculo

**Servicios:**
- Baño completo (Perro grande): S/ 80
- Corte de uñas: S/ 20

**Test:**
1. Agregar ambos servicios
2. Verificar total

**Resultado esperado:**
- ✅ Subtotal: S/ 100
- ✅ Muestra desglose correcto

**Resultado real:** _________

---

#### TC-APPT-006: Búsqueda de clientes
**Prioridad:** Media  
**Tipo:** Búsqueda

**Casos:**
1. Buscar por nombre: "Juan"
2. Buscar por apellido: "Pérez"
3. Buscar por documento: "12345678"
4. Buscar texto inexistente: "XYZ999"

**Resultado esperado:**
- ✅ Muestra resultados correctos
- ✅ "XYZ999" muestra "Sin resultados"

**Resultado real:** _________

---

#### TC-APPT-007: Filtros de estado
**Prioridad:** Media  
**Tipo:** Filtrado

**Estados:**
- Pendiente
- Confirmada
- En proceso
- Completada
- Cancelada

**Test:**
1. Crear citas con diferentes estados
2. Aplicar filtro "Pendiente"
3. Verificar solo muestra pendientes

**Resultado real:** _________

---

#### TC-APPT-008: Citas recurrentes
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Marcar "Cita recurrente"
2. Tipo: Semanal
3. Días: Lunes, Miércoles
4. Generar 4 ocurrencias
5. Click "Crear Cita"

**Resultado esperado:**
- ✅ Crea 4 citas
- ✅ Solo en Lunes y Miércoles
- ✅ Toast: "4 citas recurrentes creadas"

**Resultado real:** _________

---

#### TC-APPT-009: Editar cita existente
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Seleccionar cita existente
2. Click "✏️ Editar"
3. Cambiar hora a 11:00 AM
4. Guardar cambios

**Resultado esperado:**
- ✅ Cita actualizada
- ✅ Nueva hora reflejada
- ✅ Toast: "Cita actualizada"

**Resultado real:** _________

---

#### TC-APPT-010: Cancelar cita
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Seleccionar cita
2. Click "❌ Cancelar"
3. Confirmar cancelación

**Resultado esperado:**
- ✅ Estado cambia a "Cancelada"
- ✅ Badge rojo
- ✅ Toast: "Cita cancelada"

**Resultado real:** _________

---

## 3️⃣ TESTING DE CLIENTES

### Test Cases - Clients

#### TC-CLIENT-001: Crear cliente nuevo
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Ir a Clientes
2. Click "➕ Nuevo Cliente"
3. Llenar datos:
   - Tipo doc: DNI
   - Número: 87654321
   - Nombre: María
   - Apellido 1: González
   - Email: maria@test.com
   - Teléfono: +51 987654321
   - Dirección: Av. Test 123
4. Guardar

**Resultado esperado:**
- ✅ Cliente creado
- ✅ Aparece en lista
- ✅ Badge con categoría correcta

**Resultado real:** _________

---

#### TC-CLIENT-002: Validación de documento duplicado
**Prioridad:** Alta  
**Tipo:** Validación

**Pre-condiciones:**
- Ya existe cliente con DNI 12345678

**Pasos:**
1. Intentar crear nuevo cliente
2. Mismo DNI: 12345678

**Resultado esperado:**
- ❌ Error: "Cliente ya existe"
- ❌ No permite crear

**Resultado real:** _________

---

#### TC-CLIENT-003: Segmentación automática
**Prioridad:** Alta  
**Tipo:** Funcional

**Test:**
| Mascotas | Categoría Esperada | Color Badge |
|----------|-------------------|-------------|
| 1 | Plata 🥈 | Gris |
| 2-3 | Bronce 🥉 | Naranja |
| 4+ | Oro 🥇 | Amarillo |

**Resultado real:** _________

---

## 4️⃣ TESTING DE PASSWORD RECOVERY

### Test Cases - Password Recovery

#### TC-PWD-001: Solicitar código con email válido
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Ir a "Recuperar Password"
2. Email: test@smartpet.com
3. Click "Enviar Código"
4. Abrir consola (F12)

**Resultado esperado:**
- ✅ Toast: "Código enviado"
- ✅ Consola muestra código de 6 dígitos
- ✅ Avanza a paso 2

**Resultado real:** _________

---

#### TC-PWD-002: Código mágico 123456
**Prioridad:** Media  
**Tipo:** Funcional

**Pasos:**
1. Email: cualquiera@test.com
2. Click "Enviar"
3. Ingresar código: 123456
4. Click "Verificar"

**Resultado esperado:**
- ✅ Acepta código
- ✅ Avanza a nueva contraseña

**Resultado real:** _________

---

#### TC-PWD-003: Código incorrecto
**Prioridad:** Alta  
**Tipo:** Negativo

**Pasos:**
1. Solicitar código real
2. Ingresar código incorrecto: 999999
3. Click "Verificar"

**Resultado esperado:**
- ❌ Error: "Código incorrecto"
- ❌ No avanza

**Resultado real:** _________

---

#### TC-PWD-004: Código expirado
**Prioridad:** Alta  
**Tipo:** Temporal

**Pasos:**
1. Solicitar código
2. Esperar 11 minutos
3. Ingresar código
4. Click "Verificar"

**Resultado esperado:**
- ❌ Error: "Código expirado (10 min)"
- ❌ Sugerencia: "Solicita uno nuevo"

**Resultado real:** _________

---

#### TC-PWD-005: Validación de contraseña débil
**Prioridad:** Alta  
**Tipo:** Validación

**Contraseñas a probar:**
| Password | Esperado | Razón |
|----------|----------|-------|
| `abc` | ❌ Rechazada | Menos de 8 caracteres |
| `abcdefgh` | ❌ Rechazada | Sin mayúscula |
| `ABCDEFGH` | ❌ Rechazada | Sin minúscula |
| `Abcdefgh` | ❌ Rechazada | Sin número |
| `Abcd1234` | ✅ Aceptada | Cumple todo |

**Resultado real:** _________

---

#### TC-PWD-006: Contraseñas no coinciden
**Prioridad:** Alta  
**Tipo:** Validación

**Pasos:**
1. Nueva password: Test1234
2. Confirmar: Test5678
3. Click "Restablecer"

**Resultado esperado:**
- ❌ Error: "Las contraseñas no coinciden"

**Resultado real:** _________

---

#### TC-PWD-007: Flujo completo exitoso
**Prioridad:** Crítica  
**Tipo:** E2E

**Pasos completos:**
1. Email: test@smartpet.com
2. Obtener código de consola
3. Ingresar código correcto
4. Nueva password: NuevaPass123
5. Confirmar: NuevaPass123
6. Restablecer

**Resultado esperado:**
- ✅ Pantalla de éxito
- ✅ Consola muestra "CONTRASEÑA RESTABLECIDA"
- ✅ localStorage actualizado
- ✅ Botón "Volver al inicio"

**Resultado real:** _________

---

## 5️⃣ TESTING DE EXPORTACIÓN

### Test Cases - Data Export

#### TC-EXPORT-001: Exportar tabla única (JSON)
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Ir a "Exportar Datos"
2. Seleccionar solo "Clientes"
3. Formato: JSON
4. Click "Exportar"

**Resultado esperado:**
- ✅ Descarga archivo: `smartpet-backup-YYYY-MM-DD-HHMMSS.json`
- ✅ Contiene solo datos de clientes
- ✅ JSON válido
- ✅ Toast: "Exportación completada"

**Resultado real:** _________

---

#### TC-EXPORT-002: Exportar múltiples tablas
**Prioridad:** Alta  
**Tipo:** Funcional

**Pasos:**
1. Seleccionar: Clientes, Mascotas, Citas
2. Formato: JSON
3. Exportar

**Resultado esperado:**
```json
{
  "clients": [...],
  "pets": [...],
  "appointments": [...]
}
```

**Resultado real:** _________

---

#### TC-EXPORT-003: Exportar CSV
**Prioridad:** Media  
**Tipo:** Formato

**Pasos:**
1. Seleccionar: Clientes
2. Formato: CSV
3. Exportar

**Resultado esperado:**
- ✅ Archivo `.csv`
- ✅ Headers correctos
- ✅ Datos separados por comas

**Resultado real:** _________

---

#### TC-EXPORT-004: Sin selección de tablas
**Prioridad:** Baja  
**Tipo:** Validación

**Pasos:**
1. No seleccionar ninguna tabla
2. Click "Exportar"

**Resultado esperado:**
- ❌ Error: "Selecciona al menos una tabla"

**Resultado real:** _________

---

## 6️⃣ TESTING DE TOOLTIPS

### Test Cases - Tooltips

#### TC-TOOLTIP-001: Tooltips en botones
**Prioridad:** Media  
**Tipo:** UI

**Elementos a testear:**
- Botón "Nueva Cita"
- Botones de acción (editar, eliminar)
- Iconos de estado

**Test:**
1. Hover sobre cada botón
2. Verificar tooltip aparece

**Resultado esperado:**
- ✅ Tooltip visible
- ✅ Texto descriptivo
- ✅ Posición correcta

**Resultado real:** _________

---

## 7️⃣ TESTING DE PERFORMANCE

### Test Cases - Performance

#### TC-PERF-001: Tiempo de carga inicial
**Prioridad:** Alta  
**Tipo:** Performance

**Pasos:**
1. Abrir app en incógnito
2. Medir tiempo hasta interactividad

**Resultado esperado:**
- ✅ < 3 segundos en 4G
- ✅ < 1.5 segundos en WiFi

**Herramienta:** Lighthouse

**Resultado real:** _________

---

#### TC-PERF-002: Renderizado de lista larga
**Prioridad:** Media  
**Tipo:** Performance

**Test:**
1. Lista con 1000+ citas
2. Scroll rápido
3. Verificar fluidez

**Resultado esperado:**
- ✅ FPS > 30
- ✅ Sin lag visual

**Resultado real:** _________

---

## 8️⃣ TESTING DE SEGURIDAD

### Test Cases - Security

#### TC-SEC-001: XSS en campos de texto
**Prioridad:** Crítica  
**Tipo:** Seguridad

**Payload:**
```html
<script>alert('XSS')</script>
```

**Probar en:**
- Campo nombre cliente
- Campo notas de cita
- Campo dirección

**Resultado esperado:**
- ✅ Script no se ejecuta
- ✅ Se muestra como texto

**Resultado real:** _________

---

#### TC-SEC-002: SQL Injection (Mock)
**Prioridad:** Alta  
**Tipo:** Seguridad

**Payload:**
```sql
' OR '1'='1
```

**Probar en:**
- Búsqueda de clientes
- Login

**Resultado esperado:**
- ✅ No afecta resultados
- ✅ Se trata como string normal

**Resultado real:** _________

---

## 9️⃣ TESTING DE UI/UX

### Test Cases - UI/UX

#### TC-UI-001: Responsividad móvil
**Prioridad:** Alta  
**Tipo:** Responsive

**Breakpoints a testear:**
- 320px (móvil pequeño)
- 768px (tablet)
- 1024px (desktop)

**Verificar:**
- ✅ Sidebar colapsa en móvil
- ✅ Tablas scrolleables
- ✅ Botones accesibles

**Resultado real:** _________

---

#### TC-UI-002: Temas (dark/light)
**Prioridad:** Media  
**Tipo:** Temas

**Test:**
1. Cambiar a modo oscuro
2. Verificar todos los componentes
3. Volver a modo claro

**Resultado esperado:**
- ✅ Todos los colores se adaptan
- ✅ Contraste adecuado
- ✅ Sin elementos invisibles

**Resultado real:** _________

---

## 🎯 CHECKLIST FINAL

### Pre-lanzamiento

- [ ] **Autenticación**
  - [ ] Login funciona con todos los roles
  - [ ] Logout limpia sesión
  - [ ] "Recordarme" persiste sesión
  - [ ] Password recovery completo

- [ ] **Citas**
  - [ ] Crear cita básica
  - [ ] Validador previene conflictos
  - [ ] Cálculos correctos (precio, duración)
  - [ ] Editar/cancelar funciona

- [ ] **Clientes**
  - [ ] CRUD completo funciona
  - [ ] Segmentación automática
  - [ ] Búsqueda eficiente

- [ ] **Exportación**
  - [ ] JSON descarga correctamente
  - [ ] CSV descarga correctamente
  - [ ] Múltiples tablas funciona

- [ ] **UI/UX**
  - [ ] Tooltips visibles
  - [ ] Responsive en móvil
  - [ ] Tema oscuro/claro funciona

- [ ] **Performance**
  - [ ] Carga < 3 segundos
  - [ ] Scroll fluido

- [ ] **Seguridad**
  - [ ] XSS prevenido
  - [ ] Inputs sanitizados

---

## 📊 RESUMEN DE EJECUCIÓN

**Fecha de testing:** _________

**Ejecutado por:** _________

**Total test cases:** 60+

**Resultados:**
- ✅ Pasados: _____
- ❌ Fallados: _____
- ⏭️ Skipped: _____

**% de éxito:** _____%

**Bugs encontrados:** _____

**Severidad:**
- 🔴 Críticos: _____
- 🟠 Altos: _____
- 🟡 Medios: _____
- 🟢 Bajos: _____

---

## 📝 NOTAS DE TESTING

### Bugs encontrados:

1. **BUG-001:**
   - Descripción: _________________
   - Severidad: _________________
   - Pasos para reproducir: _________________
   - Estado: _________________

2. **BUG-002:**
   - Descripción: _________________
   - Severidad: _________________
   - Pasos para reproducir: _________________
   - Estado: _________________

---

## 🚀 RECOMENDACIONES

1. **Testing Automatizado:**
   - Implementar Jest + React Testing Library
   - Cobertura mínima: 80%

2. **E2E Testing:**
   - Cypress o Playwright
   - Flujos críticos automatizados

3. **Performance Monitoring:**
   - Lighthouse CI
   - Web Vitals tracking

4. **Security Scanning:**
   - OWASP ZAP
   - Snyk para dependencias

---

**✅ Testing completado por:** _________________  
**📅 Fecha:** _________________  
**✍️ Firma:** _________________
