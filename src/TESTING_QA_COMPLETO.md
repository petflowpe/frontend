# 🧪 TESTING & QA COMPLETO - SMARTPET

**Versión:** 2.0  
**Fecha:** Diciembre 2024  
**Objetivo:** Garantizar calidad profesional en todos los módulos

---

## 📋 ÍNDICE

1. [Metodología de Testing](#metodología)
2. [Plantilla de Testing por Módulo](#plantilla)
3. [Tests por Módulo (23 módulos)](#tests-modulos)
4. [Tests de Integración](#tests-integracion)
5. [Tests de Performance](#tests-performance)
6. [Tests de Seguridad](#tests-seguridad)
7. [Checklist de Pre-Producción](#checklist)

---

## 📊 METODOLOGÍA DE TESTING

### Tipos de Tests

#### 1. **Tests Unitarios**
- Funciones individuales
- Validaciones
- Cálculos
- Transformaciones de datos

#### 2. **Tests de Componentes**
- Renderizado correcto
- Interacciones de usuario
- Estados internos
- Props y eventos

#### 3. **Tests de Integración**
- Flujos completos
- Comunicación entre módulos
- API calls
- Estado global

#### 4. **Tests E2E (End-to-End)**
- Flujos de usuario completos
- Desde login hasta objetivo
- Escenarios reales

#### 5. **Tests de Regresión**
- Features existentes siguen funcionando
- Después de cada cambio
- Automatizados

---

## 📝 PLANTILLA DE TESTING POR MÓDULO

Para cada módulo seguiremos esta estructura:

```markdown
## [NOMBRE DEL MÓDULO]

### 1. FUNCIONALIDAD BÁSICA
- [ ] Caso 1
- [ ] Caso 2

### 2. VALIDACIONES
- [ ] Validación 1
- [ ] Validación 2

### 3. CASOS EDGE (límites)
- [ ] Edge case 1
- [ ] Edge case 2

### 4. INTEGRACIÓN
- [ ] Integración con módulo A
- [ ] Integración con módulo B

### 5. UX/UI
- [ ] Diseño responsive
- [ ] Feedback visual
- [ ] Estados de carga

### 6. PERFORMANCE
- [ ] Carga inicial
- [ ] Operaciones pesadas

### 7. SEGURIDAD
- [ ] Permisos aplicados
- [ ] Validación de datos
```

---

# 🧪 TESTS POR MÓDULO

## 1. ⚙️ CONFIGURACIÓN DEL SISTEMA

### 1.1 FUNCIONALIDAD BÁSICA

**TC-CONFIG-001: Ver configuración actual**
```
Precondición: Usuario autenticado como admin
Pasos:
  1. Navegar a Settings
  2. Verificar que se muestra la configuración actual
Resultado esperado: 
  - Se muestra nombre de empresa
  - Se muestran datos fiscales
  - Se muestran zonas configuradas
Estado: [ ] PASS [ ] FAIL
```

**TC-CONFIG-002: Actualizar configuración de empresa**
```
Precondición: Usuario autenticado como admin
Pasos:
  1. Navegar a Settings
  2. Editar nombre de empresa
  3. Editar dirección fiscal
  4. Guardar cambios
Resultado esperado:
  - Mensaje de éxito mostrado
  - Datos actualizados visibles
  - Cambios reflejados en otros módulos
Estado: [ ] PASS [ ] FAIL
```

**TC-CONFIG-003: Configurar zonas geográficas**
```
Pasos:
  1. Ir a tab "Zonas"
  2. Crear nueva zona
  3. Definir nombre y límites
  4. Asignar a vehículo
Resultado esperado:
  - Zona creada correctamente
  - Aparece en lista de zonas
  - Vehículo la tiene asignada
Estado: [ ] PASS [ ] FAIL
```

### 1.2 VALIDACIONES

**TC-CONFIG-VAL-001: Campos obligatorios**
```
Pasos:
  1. Intentar guardar configuración sin nombre de empresa
  2. Intentar guardar sin RUC/NIF
Resultado esperado:
  - Mensajes de error claros
  - No se guarda la configuración
  - Focus en campo con error
Estado: [ ] PASS [ ] FAIL
```

**TC-CONFIG-VAL-002: Formato de RUC/NIF**
```
Pasos:
  1. Ingresar RUC inválido (letras, longitud incorrecta)
  2. Intentar guardar
Resultado esperado:
  - Validación de formato
  - Mensaje de error específico
  - Ejemplo de formato correcto mostrado
Estado: [ ] PASS [ ] FAIL
```

**TC-CONFIG-VAL-003: Porcentaje de impuestos**
```
Pasos:
  1. Ingresar impuesto negativo
  2. Ingresar impuesto > 100%
  3. Ingresar letras en campo numérico
Resultado esperado:
  - Solo acepta 0-100
  - Solo acepta números
  - Validación en tiempo real
Estado: [ ] PASS [ ] FAIL
```

### 1.3 CASOS EDGE

**TC-CONFIG-EDGE-001: Configuración vacía inicial**
```
Precondición: Instalación nueva sin configuración
Pasos:
  1. Primer acceso al sistema
  2. Navegar a Settings
Resultado esperado:
  - Wizard de configuración inicial
  - Valores por defecto sensatos
  - Guía paso a paso
Estado: [ ] PASS [ ] FAIL
```

**TC-CONFIG-EDGE-002: Máximo de zonas**
```
Pasos:
  1. Crear 50+ zonas geográficas
Resultado esperado:
  - Performance estable
  - No hay límite artificial
  - Búsqueda funciona bien
Estado: [ ] PASS [ ] FAIL
```

### 1.4 INTEGRACIÓN

**TC-CONFIG-INT-001: Cambios reflejados en facturación**
```
Pasos:
  1. Cambiar nombre de empresa en Settings
  2. Ir a Facturación
  3. Generar nueva factura
Resultado esperado:
  - Factura usa nuevo nombre
  - Datos fiscales actualizados
  - Sin necesidad de refrescar
Estado: [ ] PASS [ ] FAIL
```

**TC-CONFIG-INT-002: Zonas reflejadas en vehículos**
```
Pasos:
  1. Crear zona "San Isidro"
  2. Ir a Vehículos
  3. Asignar zona a vehículo
Resultado esperado:
  - Zona aparece en dropdown
  - Se asigna correctamente
  - Se refleja en Rutas
Estado: [ ] PASS [ ] FAIL
```

### 1.5 UX/UI

**TC-CONFIG-UX-001: Responsive design**
```
Pasos:
  1. Abrir Settings en móvil
  2. Abrir en tablet
  3. Abrir en desktop
Resultado esperado:
  - Layout se adapta
  - Todos los campos accesibles
  - Botones fáciles de presionar
Estado: [ ] PASS [ ] FAIL
```

**TC-CONFIG-UX-002: Feedback visual**
```
Pasos:
  1. Guardar cambios
  2. Observar feedback
Resultado esperado:
  - Toast de confirmación
  - Loading spinner mientras guarda
  - Botón disabled durante guardado
Estado: [ ] PASS [ ] FAIL
```

### 1.6 PERFORMANCE

**TC-CONFIG-PERF-001: Carga inicial**
```
Métrica: Tiempo de carga < 2 segundos
Pasos:
  1. Navegar a Settings
  2. Medir tiempo hasta render completo
Resultado esperado: < 2s
Estado: [ ] PASS [ ] FAIL
Tiempo medido: _____ ms
```

### 1.7 SEGURIDAD

**TC-CONFIG-SEC-001: Solo admin puede editar**
```
Precondición: Usuario con rol "groomer"
Pasos:
  1. Intentar acceder a Settings
  2. Intentar editar configuración
Resultado esperado:
  - Acceso denegado o modo read-only
  - Mensaje claro de permisos
Estado: [ ] PASS [ ] FAIL
```

---

## 2. 👥 GESTIÓN DE USUARIOS

### 2.1 FUNCIONALIDAD BÁSICA

**TC-USER-001: Crear usuario**
```
Pasos:
  1. Click en "Nuevo Usuario"
  2. Llenar formulario (email, nombre, rol)
  3. Guardar
Resultado esperado:
  - Usuario creado
  - Aparece en lista
  - Email de bienvenida enviado (si está configurado)
Estado: [ ] PASS [ ] FAIL
```

**TC-USER-002: Editar usuario**
```
Pasos:
  1. Seleccionar usuario existente
  2. Cambiar nombre y rol
  3. Guardar
Resultado esperado:
  - Cambios guardados
  - Reflejados en lista
  - Permisos actualizados según nuevo rol
Estado: [ ] PASS [ ] FAIL
```

**TC-USER-003: Eliminar usuario**
```
Pasos:
  1. Seleccionar usuario
  2. Click en eliminar
  3. Confirmar eliminación
Resultado esperado:
  - Confirmación solicitada
  - Usuario eliminado
  - No aparece en lista
  - Sesiones activas cerradas
Estado: [ ] PASS [ ] FAIL
```

**TC-USER-004: Cambiar rol de usuario**
```
Pasos:
  1. Seleccionar usuario con rol "receptionist"
  2. Cambiar a "groomer"
  3. Guardar
Resultado esperado:
  - Rol actualizado
  - Permisos cambiados inmediatamente
  - Usuario ve menú correspondiente
Estado: [ ] PASS [ ] FAIL
```

### 2.2 VALIDACIONES

**TC-USER-VAL-001: Email único**
```
Pasos:
  1. Crear usuario con email "test@smartpet.com"
  2. Intentar crear otro con mismo email
Resultado esperado:
  - Error: "Email ya registrado"
  - No se crea usuario duplicado
Estado: [ ] PASS [ ] FAIL
```

**TC-USER-VAL-002: Formato de email**
```
Pasos:
  1. Ingresar email inválido: "notanemail"
  2. Ingresar "user@"
  3. Ingresar "@domain.com"
Resultado esperado:
  - Validación de formato
  - Mensaje de error claro
  - Sugerencia de formato correcto
Estado: [ ] PASS [ ] FAIL
```

**TC-USER-VAL-003: Contraseña fuerte**
```
Pasos:
  1. Intentar crear usuario con contraseña "123"
  2. Intentar con "password"
  3. Usar "SecureP@ss123"
Resultado esperado:
  - Rechaza contraseñas débiles
  - Indicador de fortaleza
  - Requisitos claramente mostrados
Estado: [ ] PASS [ ] FAIL
```

### 2.3 CASOS EDGE

**TC-USER-EDGE-001: No se puede eliminar el último admin**
```
Precondición: Solo existe 1 usuario admin
Pasos:
  1. Intentar eliminar único admin
Resultado esperado:
  - Error: "Debe haber al menos 1 admin"
  - No se permite eliminación
Estado: [ ] PASS [ ] FAIL
```

**TC-USER-EDGE-002: Usuario se elimina a sí mismo**
```
Pasos:
  1. Usuario admin intenta eliminarse a sí mismo
Resultado esperado:
  - Advertencia clara
  - Confirmación extra
  - Cierre de sesión automático
Estado: [ ] PASS [ ] FAIL
```

### 2.4 INTEGRACIÓN

**TC-USER-INT-001: Usuario asignado a personal**
```
Pasos:
  1. Crear usuario con rol "groomer"
  2. Ir a módulo Personal
  3. Crear empleado y asignar este usuario
Resultado esperado:
  - Usuario aparece en dropdown
  - Asignación exitosa
  - Empleado puede hacer login
Estado: [ ] PASS [ ] FAIL
```

### 2.5 SEGURIDAD

**TC-USER-SEC-001: Permisos por rol**
```
Pasos:
  1. Login como "client"
  2. Intentar acceder a módulo Usuarios
Resultado esperado:
  - Acceso denegado
  - Mensaje claro
  - No se expone información
Estado: [ ] PASS [ ] FAIL
```

**TC-USER-SEC-002: Contraseñas hasheadas**
```
Verificación:
  - Contraseñas no se guardan en texto plano
  - Hash usando bcrypt o similar
  - No se exponen en API
Estado: [ ] PASS [ ] FAIL
```

---

## 3. 👨‍💼 PERSONAL

### 3.1 FUNCIONALIDAD BÁSICA

**TC-STAFF-001: Crear empleado**
```
Pasos:
  1. Click "Nuevo Empleado"
  2. Llenar datos (nombre, documento, teléfono, especialidad)
  3. Asignar usuario del sistema
  4. Guardar
Resultado esperado:
  - Empleado creado
  - Aparece en lista
  - Usuario vinculado correctamente
Estado: [ ] PASS [ ] FAIL
```

**TC-STAFF-002: Asignar especialidades**
```
Pasos:
  1. Editar empleado
  2. Seleccionar especialidades (Baño, Corte, Medicado)
  3. Guardar
Resultado esperado:
  - Especialidades guardadas
  - Aparecen en perfil
  - Se usan para asignación de citas
Estado: [ ] PASS [ ] FAIL
```

**TC-STAFF-003: Configurar horarios**
```
Pasos:
  1. Editar empleado
  2. Configurar horario (Lun-Vie 9-18h)
  3. Guardar
Resultado esperado:
  - Horario guardado
  - Reflejado en disponibilidad
  - No se pueden asignar citas fuera de horario
Estado: [ ] PASS [ ] FAIL
```

**TC-STAFF-004: Asignar a vehículo**
```
Pasos:
  1. Editar empleado
  2. Asignar a vehículo específico
  3. Guardar
Resultado esperado:
  - Asignación exitosa
  - Se muestra en módulo Vehículos
  - Restricciones de zona aplicadas
Estado: [ ] PASS [ ] FAIL
```

### 3.2 VALIDACIONES

**TC-STAFF-VAL-001: Campos obligatorios**
```
Pasos:
  1. Intentar crear empleado sin nombre
  2. Intentar sin documento de identidad
Resultado esperado:
  - Validación de campos requeridos
  - Mensajes claros
  - No se guarda hasta completar
Estado: [ ] PASS [ ] FAIL
```

**TC-STAFF-VAL-002: Documento único**
```
Pasos:
  1. Crear empleado con DNI "12345678"
  2. Intentar crear otro con mismo DNI
Resultado esperado:
  - Error: "Documento ya registrado"
  - No permite duplicados
Estado: [ ] PASS [ ] FAIL
```

### 3.3 CASOS EDGE

**TC-STAFF-EDGE-001: Empleado sin especialidades**
```
Pasos:
  1. Crear empleado sin asignar especialidades
Resultado esperado:
  - Advertencia mostrada
  - Permite guardarlo (puede ser admin)
  - No aparece para asignación de servicios
Estado: [ ] PASS [ ] FAIL
```

**TC-STAFF-EDGE-002: Empleado inactivo**
```
Pasos:
  1. Marcar empleado como inactivo
  2. Intentar asignar a nueva cita
Resultado esperado:
  - No aparece en lista de disponibles
  - Citas existentes se mantienen
  - Puede reactivarse
Estado: [ ] PASS [ ] FAIL
```

### 3.4 INTEGRACIÓN

**TC-STAFF-INT-001: Comisiones en pagos**
```
Pasos:
  1. Configurar comisión 10% para empleado
  2. Completar cita asignada a él
  3. Procesar pago
  4. Ver comisiones en módulo Pagos
Resultado esperado:
  - Comisión calculada automáticamente
  - Aparece en reporte del empleado
  - Se suma al total adeudado
Estado: [ ] PASS [ ] FAIL
```

### 3.5 PERFORMANCE

**TC-STAFF-PERF-001: Lista con muchos empleados**
```
Precondición: 100+ empleados registrados
Pasos:
  1. Abrir módulo Personal
  2. Buscar empleado por nombre
  3. Filtrar por especialidad
Resultado esperado:
  - Carga en < 2s
  - Búsqueda instantánea
  - Filtros funcionan bien
Estado: [ ] PASS [ ] FAIL
```

---

## 4. 🚗 VEHÍCULOS

### 4.1 FUNCIONALIDAD BÁSICA

**TC-VEH-001: Registrar vehículo**
```
Pasos:
  1. Click "Nuevo Vehículo"
  2. Ingresar placa, marca, modelo, año
  3. Asignar zonas de servicio
  4. Guardar
Resultado esperado:
  - Vehículo registrado
  - Aparece en lista
  - Disponible para asignación
Estado: [ ] PASS [ ] FAIL
```

**TC-VEH-002: Asignar equipamiento**
```
Pasos:
  1. Editar vehículo
  2. Agregar equipamiento (secadora, mesa, productos)
  3. Guardar
Resultado esperado:
  - Equipamiento listado
  - Se usa para validar servicios disponibles
Estado: [ ] PASS [ ] FAIL
```

**TC-VEH-003: Programar mantenimiento**
```
Pasos:
  1. Click en "Programar Mantenimiento"
  2. Seleccionar tipo (preventivo, correctivo)
  3. Programar fecha
  4. Guardar
Resultado esperado:
  - Mantenimiento agendado
  - Alerta antes de la fecha
  - Vehículo marcado como "No disponible" ese día
Estado: [ ] PASS [ ] FAIL
```

**TC-VEH-004: Registrar gasto operativo**
```
Pasos:
  1. Seleccionar vehículo
  2. Registrar gasto (combustible, peaje, limpieza)
  3. Ingresar monto y descripción
  4. Guardar
Resultado esperado:
  - Gasto registrado
  - Aparece en historial
  - Se suma al costo operativo total
Estado: [ ] PASS [ ] FAIL
```

### 4.2 VALIDACIONES

**TC-VEH-VAL-001: Placa única**
```
Pasos:
  1. Crear vehículo con placa "ABC-123"
  2. Intentar crear otro con misma placa
Resultado esperado:
  - Error: "Placa ya registrada"
  - No permite duplicados
Estado: [ ] PASS [ ] FAIL
```

**TC-VEH-VAL-002: Año válido**
```
Pasos:
  1. Intentar ingresar año 1800
  2. Intentar ingresar año 2050
Resultado esperado:
  - Solo acepta años razonables (1990-2025)
  - Mensaje de validación
Estado: [ ] PASS [ ] FAIL
```

### 4.3 CASOS EDGE

**TC-VEH-EDGE-001: Vehículo en mantenimiento**
```
Pasos:
  1. Marcar vehículo en mantenimiento
  2. Intentar asignar cita a ese vehículo
Resultado esperado:
  - No aparece en lista de disponibles
  - Advertencia si está asignado
  - Sugerencia de otro vehículo
Estado: [ ] PASS [ ] FAIL
```

**TC-VEH-EDGE-002: Múltiples zonas asignadas**
```
Pasos:
  1. Asignar 10+ zonas a un vehículo
Resultado esperado:
  - Todas las zonas guardadas
  - Performance estable
  - Búsqueda funciona bien
Estado: [ ] PASS [ ] FAIL
```

### 4.4 INTEGRACIÓN

**TC-VEH-INT-001: Zonas restringen citas**
```
Precondición: Vehículo solo asignado a zona "San Isidro"
Pasos:
  1. Crear cita en zona "Miraflores"
  2. Intentar asignar a este vehículo
Resultado esperado:
  - Advertencia de zona incompatible
  - Sugerencia de vehículo correcto
Estado: [ ] PASS [ ] FAIL
```

**TC-VEH-INT-002: Gastos en cierre de caja**
```
Pasos:
  1. Registrar gasto de combustible S/50
  2. Hacer cierre de caja del vehículo
Resultado esperado:
  - Gasto aparece en cierre
  - Se resta del efectivo
  - Balance correcto
Estado: [ ] PASS [ ] FAIL
```

---

## 5. ✂️ SERVICIOS

### 5.1 FUNCIONALIDAD BÁSICA

**TC-SERV-001: Crear servicio**
```
Pasos:
  1. Click "Nuevo Servicio"
  2. Ingresar nombre, categoría, duración
  3. Configurar precios por tamaño
  4. Guardar
Resultado esperado:
  - Servicio creado
  - Precios diferenciados guardados
  - Disponible para venta
Estado: [ ] PASS [ ] FAIL
```

**TC-SERV-002: Precios diferenciados**
```
Pasos:
  1. Crear servicio "Baño"
  2. Precio pequeño: S/30
  3. Precio mediano: S/45
  4. Precio grande: S/60
  5. Precio gigante: S/80
Resultado esperado:
  - Todos los precios guardados
  - Se aplican según tamaño de mascota
Estado: [ ] PASS [ ] FAIL
```

**TC-SERV-003: Excepciones por raza**
```
Pasos:
  1. Editar servicio
  2. Agregar excepción para "Husky" → S/70
  3. Guardar
Resultado esperado:
  - Excepción guardada
  - Se aplica cuando mascota es Husky
  - Sobrescribe precio por tamaño
Estado: [ ] PASS [ ] FAIL
```

### 5.2 VALIDACIONES

**TC-SERV-VAL-001: Precio no negativo**
```
Pasos:
  1. Intentar ingresar precio -10
  2. Intentar ingresar 0
Resultado esperado:
  - No acepta negativos
  - Acepta 0 (para servicios gratis)
  - Validación clara
Estado: [ ] PASS [ ] FAIL
```

**TC-SERV-VAL-002: Duración válida**
```
Pasos:
  1. Intentar ingresar duración 0 minutos
  2. Intentar ingresar 1000 minutos
Resultado esperado:
  - Acepta 15-480 minutos
  - Validación de rango
Estado: [ ] PASS [ ] FAIL
```

### 5.3 CASOS EDGE

**TC-SERV-EDGE-001: Servicio sin precios**
```
Pasos:
  1. Crear servicio sin configurar precios
Resultado esperado:
  - Advertencia mostrada
  - Permite guardarlo
  - No se puede vender hasta configurar precio
Estado: [ ] PASS [ ] FAIL
```

### 5.4 INTEGRACIÓN

**TC-SERV-INT-001: Precio en cita**
```
Pasos:
  1. Crear cita para Golden Retriever (grande)
  2. Seleccionar servicio "Baño"
  3. Verificar precio aplicado
Resultado esperado:
  - Se aplica precio para tamaño grande
  - Precio correcto en factura
Estado: [ ] PASS [ ] FAIL
```

**TC-SERV-INT-002: Excepción de raza aplicada**
```
Precondición: Servicio tiene excepción para Husky
Pasos:
  1. Crear cita para Husky
  2. Seleccionar servicio
Resultado esperado:
  - Se aplica precio de excepción
  - No el precio por tamaño
Estado: [ ] PASS [ ] FAIL
```

---

## 6. 📦 PRODUCTOS

### 6.1 FUNCIONALIDAD BÁSICA

**TC-PROD-001: Crear producto**
```
Pasos:
  1. Click "Nuevo Producto"
  2. Ingresar nombre, SKU, categoría
  3. Precio compra y venta
  4. Stock inicial
  5. Guardar
Resultado esperado:
  - Producto creado
  - Stock registrado
  - Disponible para venta
Estado: [ ] PASS [ ] FAIL
```

**TC-PROD-002: Ajustar stock**
```
Pasos:
  1. Seleccionar producto
  2. Hacer ajuste de inventario (+10 unidades)
  3. Ingresar razón
  4. Guardar
Resultado esperado:
  - Stock actualizado
  - Movimiento en Kardex
  - Razón registrada
Estado: [ ] PASS [ ] FAIL
```

**TC-PROD-003: Alerta de stock bajo**
```
Precondición: Producto con stock mínimo = 10
Pasos:
  1. Reducir stock a 8 unidades
Resultado esperado:
  - Alerta mostrada
  - Notificación generada
  - Sugerencia de reorden
Estado: [ ] PASS [ ] FAIL
```

### 6.2 VALIDACIONES

**TC-PROD-VAL-001: SKU único**
```
Pasos:
  1. Crear producto con SKU "SHAMP-001"
  2. Intentar crear otro con mismo SKU
Resultado esperado:
  - Error: "SKU ya existe"
  - No permite duplicados
Estado: [ ] PASS [ ] FAIL
```

**TC-PROD-VAL-002: Stock no negativo**
```
Pasos:
  1. Intentar ajustar stock a -5
Resultado esperado:
  - No permite stock negativo
  - Mensaje de validación
Estado: [ ] PASS [ ] FAIL
```

**TC-PROD-VAL-003: Precio venta > compra**
```
Pasos:
  1. Ingresar precio compra S/50
  2. Ingresar precio venta S/40
Resultado esperado:
  - Advertencia: "Precio venta menor que compra"
  - Permite guardarlo (puede ser promoción)
  - Muestra margen negativo
Estado: [ ] PASS [ ] FAIL
```

### 6.3 INTEGRACIÓN

**TC-PROD-INT-001: Venta reduce stock**
```
Precondición: Producto con stock 20
Pasos:
  1. Crear factura con 5 unidades
  2. Procesar venta
  3. Verificar stock
Resultado esperado:
  - Stock ahora es 15
  - Movimiento en Kardex
  - Automático, sin intervención
Estado: [ ] PASS [ ] FAIL
```

**TC-PROD-INT-002: Compra aumenta stock**
```
Precondición: Producto con stock 10
Pasos:
  1. Registrar compra de 20 unidades
  2. Verificar stock
Resultado esperado:
  - Stock ahora es 30
  - Movimiento en Kardex
  - Costo promedio actualizado
Estado: [ ] PASS [ ] FAIL
```

---

## 7. 👥 CLIENTES

### 7.1 FUNCIONALIDAD BÁSICA

**TC-CLI-001: Crear cliente**
```
Pasos:
  1. Click "Nuevo Cliente"
  2. Ingresar nombre, email, teléfono, dirección
  3. Guardar
Resultado esperado:
  - Cliente creado
  - Geocodificación de dirección (si disponible)
  - Listo para agendar citas
Estado: [ ] PASS [ ] FAIL
```

**TC-CLI-002: Agregar mascota**
```
Pasos:
  1. Seleccionar cliente
  2. Click "Agregar Mascota"
  3. Nombre, raza, tamaño, fecha nacimiento
  4. Guardar
Resultado esperado:
  - Mascota registrada
  - Aparece en perfil del cliente
  - Disponible para citas
Estado: [ ] PASS [ ] FAIL
```

**TC-CLI-003: Ver historial de citas**
```
Pasos:
  1. Seleccionar cliente con citas previas
  2. Ver tab "Historial"
Resultado esperado:
  - Todas las citas listadas
  - Ordenadas por fecha (más reciente primero)
  - Con detalles completos
Estado: [ ] PASS [ ] FAIL
```

**TC-CLI-004: Búsqueda de clientes**
```
Pasos:
  1. Buscar por nombre
  2. Buscar por email
  3. Buscar por teléfono
  4. Buscar por nombre de mascota
Resultado esperado:
  - Búsqueda fuzzy funciona
  - Resultados instantáneos
  - Coincidencias destacadas
Estado: [ ] PASS [ ] FAIL
```

### 7.2 VALIDACIONES

**TC-CLI-VAL-001: Email válido**
```
Pasos:
  1. Intentar crear cliente con email "notvalid"
  2. Intentar con "user@"
Resultado esperado:
  - Validación de formato
  - Mensaje claro
  - Email opcional (puede no tenerlo)
Estado: [ ] PASS [ ] FAIL
```

**TC-CLI-VAL-002: Teléfono válido**
```
Pasos:
  1. Ingresar teléfono con letras
  2. Ingresar teléfono de 3 dígitos
Resultado esperado:
  - Solo acepta números
  - Longitud mínima 7 dígitos
  - Formato automático (+51 para Perú)
Estado: [ ] PASS [ ] FAIL
```

### 7.3 CASOS EDGE

**TC-CLI-EDGE-001: Cliente con muchas mascotas**
```
Pasos:
  1. Agregar 10+ mascotas a un cliente
Resultado esperado:
  - Todas las mascotas guardadas
  - Lista paginada o scrolleable
  - Performance estable
Estado: [ ] PASS [ ] FAIL
```

**TC-CLI-EDGE-002: Cliente sin mascotas**
```
Pasos:
  1. Crear cliente sin mascota
  2. Intentar crear cita
Resultado esperado:
  - Advertencia: "Debe agregar mascota primero"
  - Link directo para agregar
Estado: [ ] PASS [ ] FAIL
```

### 7.4 INTEGRACIÓN

**TC-CLI-INT-001: Geocodificación automática**
```
Pasos:
  1. Ingresar dirección "Av. Larco 1301, Miraflores"
  2. Guardar cliente
Resultado esperado:
  - Dirección geocodificada automáticamente
  - Lat/Lng guardados
  - Aparece en mapa de rutas
Estado: [ ] PASS [ ] FAIL
```

**TC-CLI-INT-002: Programa de fidelización**
```
Pasos:
  1. Cliente completa 5 citas
  2. Verificar puntos acumulados
Resultado esperado:
  - Puntos calculados automáticamente
  - Nivel actualizado
  - Beneficios aplicables
Estado: [ ] PASS [ ] FAIL
```

---

## 8. 📅 CITAS

### 8.1 FUNCIONALIDAD BÁSICA

**TC-APT-001: Crear cita simple**
```
Pasos:
  1. Click "Nueva Cita"
  2. Buscar y seleccionar cliente
  3. Seleccionar mascota
  4. Seleccionar servicio
  5. Elegir fecha y hora
  6. Asignar vehículo/groomer
  7. Guardar
Resultado esperado:
  - Cita creada
  - Aparece en calendario
  - Notificación enviada (si configurado)
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-002: Crear cita recurrente**
```
Pasos:
  1. Crear cita
  2. Activar "Recurrente"
  3. Configurar frecuencia (semanal)
  4. Número de repeticiones (4)
  5. Guardar
Resultado esperado:
  - 4 citas creadas
  - Fechas correctas (cada semana)
  - Todas vinculadas
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-003: Editar cita**
```
Pasos:
  1. Seleccionar cita existente
  2. Cambiar fecha/hora
  3. Guardar
Resultado esperado:
  - Cambios guardados
  - Notificación de cambio enviada
  - Reflejado en calendario
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-004: Cancelar cita**
```
Pasos:
  1. Seleccionar cita
  2. Click "Cancelar"
  3. Ingresar motivo
  4. Confirmar
Resultado esperado:
  - Estado cambiado a "Cancelada"
  - Motivo registrado
  - Política de cancelación aplicada
  - Notificación enviada
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-005: Confirmar cita**
```
Pasos:
  1. Seleccionar cita pendiente
  2. Click "Confirmar"
Resultado esperado:
  - Estado "Confirmada"
  - Timestamp de confirmación
  - Notificación enviada
Estado: [ ] PASS [ ] FAIL
```

### 8.2 VALIDACIONES

**TC-APT-VAL-001: No agendar en el pasado**
```
Pasos:
  1. Intentar crear cita con fecha de ayer
Resultado esperado:
  - Error: "No se puede agendar en el pasado"
  - Sugerencia de fecha actual
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-VAL-002: Disponibilidad de groomer**
```
Precondición: Groomer ya tiene cita a las 10:00
Pasos:
  1. Intentar crear otra cita a las 10:00 con mismo groomer
Resultado esperado:
  - Advertencia de conflicto
  - Sugerencia de otro horario u otro groomer
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-VAL-003: Horario de atención**
```
Pasos:
  1. Intentar crear cita a las 23:00
Resultado esperado:
  - Error: "Fuera de horario de atención"
  - Mostrar horarios disponibles
Estado: [ ] PASS [ ] FAIL
```

### 8.3 CASOS EDGE

**TC-APT-EDGE-001: Cita recurrente con conflictos**
```
Pasos:
  1. Crear cita recurrente semanal (4 veces)
  2. Fecha 3 ya tiene otra cita
Resultado esperado:
  - Advertencia de conflicto
  - Opción de saltar esa fecha
  - O mover a otro horario
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-EDGE-002: Cancelar cita recurrente**
```
Pasos:
  1. Seleccionar una cita de serie recurrente
  2. Cancelar
  3. Opción: "Solo esta" o "Todas las siguientes"
Resultado esperado:
  - Opciones claras
  - Se aplica según selección
  - Serie se mantiene intacta si "solo esta"
Estado: [ ] PASS [ ] FAIL
```

### 8.4 INTEGRACIÓN

**TC-APT-INT-001: Precio automático**
```
Pasos:
  1. Crear cita para mascota "Grande"
  2. Seleccionar servicio "Baño"
Resultado esperado:
  - Precio automáticamente aplicado según tamaño
  - Mostrado antes de guardar
  - Se usa en facturación
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-INT-002: Integración con rutas**
```
Pasos:
  1. Crear 5 citas para mismo día
  2. Ir a módulo Rutas
  3. Optimizar ruta
Resultado esperado:
  - Todas las citas aparecen en mapa
  - Optimización calcula mejor ruta
  - Orden sugerido aplicable
Estado: [ ] PASS [ ] FAIL
```

**TC-APT-INT-003: Facturación automática**
```
Pasos:
  1. Completar cita
  2. Ir a Facturación
Resultado esperado:
  - Factura pre-generada
  - Con datos de la cita
  - Lista para enviar
Estado: [ ] PASS [ ] FAIL
```

---

## 9. ✅ CONFIRMACIÓN DE CITAS

### 9.1 FUNCIONALIDAD BÁSICA

**TC-CONF-001: Recordatorio 24h automático**
```
Precondición: Cita agendada para mañana
Pasos:
  1. Esperar que sistema envíe recordatorio
  2. Verificar notificación enviada
Resultado esperado:
  - Recordatorio enviado automáticamente
  - Cliente lo recibe
  - Marcado como enviado en sistema
Estado: [ ] PASS [ ] FAIL
```

**TC-CONF-002: Confirmación manual**
```
Pasos:
  1. Ir a módulo Confirmaciones
  2. Seleccionar cita pendiente
  3. Click "Confirmar por WhatsApp"
Resultado esperado:
  - Mensaje enviado
  - Estado actualizado a "Confirmada"
  - Timestamp registrado
Estado: [ ] PASS [ ] FAIL
```

**TC-CONF-003: Dashboard de pendientes**
```
Pasos:
  1. Abrir módulo Confirmaciones
  2. Ver tab "Citas Pendientes"
Resultado esperado:
  - Lista de citas sin confirmar
  - Ordenadas por urgencia
  - Acciones rápidas disponibles
Estado: [ ] PASS [ ] FAIL
```

### 9.2 VALIDACIONES

**TC-CONF-VAL-001: No enviar duplicados**
```
Pasos:
  1. Enviar recordatorio manualmente
  2. Intentar enviar otro
Resultado esperado:
  - Advertencia: "Ya enviado hace X minutos"
  - Opción de reenviar si insiste
Estado: [ ] PASS [ ] FAIL
```

### 9.3 INTEGRACIÓN

**TC-CONF-INT-001: Política de cancelación aplicada**
```
Precondición: Cancelación <12h = 50% penalización
Pasos:
  1. Cliente cancela 8 horas antes
  2. Verificar cargo aplicado
Resultado esperado:
  - 50% del servicio cobrado
  - Registrado en pagos
  - Cliente notificado
Estado: [ ] PASS [ ] FAIL
```

---

## 10. 🗺️ RUTAS

### 10.1 FUNCIONALIDAD BÁSICA

**TC-ROUTE-001: Crear zona**
```
Pasos:
  1. Click "Nueva Zona"
  2. Dibujar polígono en mapa
  3. Nombrar zona
  4. Guardar
Resultado esperado:
  - Zona creada
  - Visible en mapa
  - Disponible para asignar a vehículos
Estado: [ ] PASS [ ] FAIL
```

**TC-ROUTE-002: Optimizar ruta**
```
Precondición: 8 citas para hoy
Pasos:
  1. Seleccionar día
  2. Click "Optimizar Ruta"
  3. Revisar ruta sugerida
Resultado esperado:
  - Algoritmo TSP ejecutado
  - Orden óptimo mostrado
  - Distancia/tiempo calculados
  - Ahorro vs ruta manual mostrado
Estado: [ ] PASS [ ] FAIL
```

**TC-ROUTE-003: Exportar a Google Maps**
```
Pasos:
  1. Optimizar ruta
  2. Click "Exportar a Google Maps"
Resultado esperado:
  - Link generado
  - Al abrir: ruta completa en Google Maps
  - Todos los waypoints incluidos
Estado: [ ] PASS [ ] FAIL
```

**TC-ROUTE-004: Ver historial**
```
Pasos:
  1. Ir a tab "Historial"
  2. Filtrar por fecha
Resultado esperado:
  - Todas las optimizaciones listadas
  - Métricas de ahorro mostradas
  - Comparación con períodos anteriores
Estado: [ ] PASS [ ] FAIL
```

### 10.2 VALIDACIONES

**TC-ROUTE-VAL-001: Zona válida**
```
Pasos:
  1. Intentar crear zona con solo 2 puntos
Resultado esperado:
  - Error: "Mínimo 3 puntos para polígono"
  - No permite guardar
Estado: [ ] PASS [ ] FAIL
```

**TC-ROUTE-VAL-002: Dirección geocodificada**
```
Pasos:
  1. Crear cita con dirección sin geocodificar
  2. Intentar optimizar ruta
Resultado esperado:
  - Advertencia: "Direcciones sin geocodificar"
  - Lista de citas afectadas
  - Opción de geocodificar desde ahí
Estado: [ ] PASS [ ] FAIL
```

### 10.3 INTEGRACIÓN

**TC-ROUTE-INT-001: GPS Tracking**
```
Pasos:
  1. Optimizar ruta
  2. Abrir link de tracking público
Resultado esperado:
  - Mapa con ruta completa
  - Posición del vehículo (simulada o real)
  - ETA para cada parada
Estado: [ ] PASS [ ] FAIL
```

---

## 11. 🏥 CUIDADO MÉDICO

### 11.1 FUNCIONALIDAD BÁSICA

**TC-MED-001: Registrar vacuna**
```
Pasos:
  1. Seleccionar mascota
  2. Click "Registrar Vacuna"
  3. Tipo de vacuna, fecha, próxima dosis
  4. Guardar
Resultado esperado:
  - Vacuna registrada
  - En línea de tiempo
  - Recordatorio programado
Estado: [ ] PASS [ ] FAIL
```

**TC-MED-002: Notificación automática**
```
Precondición: Próxima vacuna en 7 días
Pasos:
  1. Esperar que sistema genere notificación
Resultado esperado:
  - Notificación creada automáticamente
  - Cliente notificado
  - Aparece en dashboard
Estado: [ ] PASS [ ] FAIL
```

### 11.2 INTEGRACIÓN

**TC-MED-INT-001: Historial en perfil**
```
Pasos:
  1. Ver perfil de mascota
  2. Ver tab "Historial Médico"
Resultado esperado:
  - Todos los tratamientos listados
  - Línea de tiempo visual
  - Próximos tratamientos destacados
Estado: [ ] PASS [ ] FAIL
```

---

## 12. ⭐ REVIEWS

### 12.1 FUNCIONALIDAD BÁSICA

**TC-REV-001: Cliente deja review**
```
Pasos:
  1. Completar cita
  2. Solicitar review
  3. Cliente califica 5 estrellas
  4. Escribe comentario
  5. Enviar
Resultado esperado:
  - Review guardada
  - Aparece en perfil del groomer
  - NPS calculado automáticamente
Estado: [ ] PASS [ ] FAIL
```

**TC-REV-002: Responder a review**
```
Pasos:
  1. Seleccionar review
  2. Escribir respuesta
  3. Publicar
Resultado esperado:
  - Respuesta visible
  - Cliente notificado
  - Timestamp de respuesta
Estado: [ ] PASS [ ] FAIL
```

### 12.2 VALIDACIONES

**TC-REV-VAL-001: Solo 1 review por cita**
```
Pasos:
  1. Dejar review para cita X
  2. Intentar dejar otra para misma cita
Resultado esperado:
  - No permite duplicados
  - Opción de editar review existente
Estado: [ ] PASS [ ] FAIL
```

---

## 13. ❤️ FIDELIZACIÓN

### 13.1 FUNCIONALIDAD BÁSICA

**TC-LOY-001: Acumular puntos**
```
Pasos:
  1. Cliente completa cita de S/80
  2. Verificar puntos ganados
Resultado esperado:
  - Puntos calculados (ej: 1 punto por sol)
  - Sumados al total
  - Cliente notificado
Estado: [ ] PASS [ ] FAIL
```

**TC-LOY-002: Canjear puntos**
```
Pasos:
  1. Cliente con 100 puntos
  2. Canjear por descuento 10%
  3. Aplicar en próxima cita
Resultado esperado:
  - Puntos deducidos
  - Cupón generado
  - Descuento aplicado en factura
Estado: [ ] PASS [ ] FAIL
```

**TC-LOY-003: Nivel automático**
```
Pasos:
  1. Cliente acumula 500 puntos
  2. Verificar nivel
Resultado esperado:
  - Nivel actualizado a "Oro"
  - Beneficios desbloqueados
  - Notificación de nivel nuevo
Estado: [ ] PASS [ ] FAIL
```

---

## 14. 💰 MÓDULOS FINANCIEROS

### COMPRAS

**TC-PUR-001: Registrar compra**
```
Pasos:
  1. Click "Nueva Compra"
  2. Seleccionar proveedor
  3. Agregar productos y cantidades
  4. Ingresar precio unitario
  5. Guardar
Resultado esperado:
  - Compra registrada
  - Stock aumentado automáticamente
  - Movimiento en Kardex
  - Costo promedio actualizado
Estado: [ ] PASS [ ] FAIL
```

### FACTURACIÓN

**TC-INV-001: Generar factura**
```
Pasos:
  1. Click "Nueva Factura"
  2. Seleccionar cliente
  3. Agregar servicios/productos
  4. Calcular total
  5. Generar
Resultado esperado:
  - Factura creada con número correlativo
  - PDF generado
  - Enviada por email
  - Stock de productos reducido
Estado: [ ] PASS [ ] FAIL
```

**TC-INV-002: Anular factura**
```
Pasos:
  1. Seleccionar factura
  2. Click "Anular"
  3. Ingresar motivo
  4. Confirmar
Resultado esperado:
  - Factura anulada
  - Numeración se mantiene
  - Stock devuelto
  - Nota de crédito generada
Estado: [ ] PASS [ ] FAIL
```

### PAGOS

**TC-PAY-001: Registrar pago**
```
Pasos:
  1. Seleccionar factura pendiente
  2. Registrar pago
  3. Método: efectivo
  4. Monto: total
  5. Guardar
Resultado esperado:
  - Pago registrado
  - Factura marcada como pagada
  - Aparece en cierre de caja
Estado: [ ] PASS [ ] FAIL
```

**TC-PAY-002: Pago parcial**
```
Pasos:
  1. Factura de S/100
  2. Registrar pago de S/50
Resultado esperado:
  - Pago registrado
  - Factura sigue como "Parcial"
  - Saldo pendiente: S/50
Estado: [ ] PASS [ ] FAIL
```

### CIERRE DE CAJA

**TC-CASH-001: Abrir caja**
```
Pasos:
  1. Inicio del día
  2. Abrir caja del vehículo
  3. Ingresar efectivo inicial
Resultado esperado:
  - Caja abierta
  - Efectivo inicial registrado
  - Puede procesar ventas
Estado: [ ] PASS [ ] FAIL
```

**TC-CASH-002: Cerrar caja**
```
Pasos:
  1. Fin del día
  2. Cerrar caja
  3. Contar efectivo real
  4. Ingresar monto
  5. Guardar
Resultado esperado:
  - Caja cerrada
  - Diferencia calculada (esperado vs real)
  - Reporte generado
  - Si diferencia >5%: alerta
Estado: [ ] PASS [ ] FAIL
```

---

## 15. 📊 ANALYTICS Y REPORTES

### ANALYTICS PREDICTIVO

**TC-PRED-001: Predicción de demanda**
```
Pasos:
  1. Abrir módulo Analytics IA
  2. Ver predicción próximos 7 días
Resultado esperado:
  - Predicción mostrada
  - Con nivel de confianza
  - Gráfico de tendencia
Estado: [ ] PASS [ ] FAIL
```

**TC-PRED-002: Detección de churn**
```
Pasos:
  1. Ver tab "Detección de Churn"
  2. Ver clientes en riesgo
Resultado esperado:
  - Lista ordenada por riesgo
  - Recomendaciones de retención
  - Acción directa (enviar oferta)
Estado: [ ] PASS [ ] FAIL
```

### REPORTES

**TC-REP-001: Reporte de ventas**
```
Pasos:
  1. Seleccionar período (mes actual)
  2. Generar reporte
Resultado esperado:
  - Ventas totales
  - Por servicio
  - Por groomer
  - Por vehículo
  - Gráficos visuales
Estado: [ ] PASS [ ] FAIL
```

**TC-REP-002: Exportar a Excel**
```
Pasos:
  1. Generar reporte
  2. Click "Exportar a Excel"
Resultado esperado:
  - Archivo .xlsx descargado
  - Con todos los datos
  - Formato limpio
Estado: [ ] PASS [ ] FAIL
```

---

## 🔗 TESTS DE INTEGRACIÓN

### INT-001: Flujo completo de venta

**Escenario:** Cliente nuevo agenda cita y paga

```
Pasos:
  1. Crear cliente nuevo con mascota
  2. Agendar cita
  3. Confirmar cita
  4. Completar cita
  5. Generar factura
  6. Procesar pago
  7. Cliente deja review

Verificaciones:
  - [ ] Cliente creado correctamente
  - [ ] Mascota vinculada
  - [ ] Cita en calendario
  - [ ] Notificación de confirmación enviada
  - [ ] Factura generada automáticamente
  - [ ] Stock reducido (si hay productos)
  - [ ] Pago registrado
  - [ ] Cierre de caja refleja venta
  - [ ] Review aparece en sistema
  - [ ] Puntos de fidelización acumulados

Estado: [ ] PASS [ ] FAIL
```

### INT-002: Flujo de optimización de rutas

**Escenario:** 10 citas del día optimizadas y ejecutadas

```
Pasos:
  1. Crear 10 citas para hoy
  2. Ir a Rutas
  3. Optimizar ruta
  4. Exportar a Google Maps
  5. Groomer sigue la ruta
  6. Completar todas las citas

Verificaciones:
  - [ ] Todas las citas en mapa
  - [ ] Ruta optimizada correctamente
  - [ ] Link de Google Maps funciona
  - [ ] Ahorro calculado correctamente
  - [ ] Historial guardado
  - [ ] Citas completadas actualizan estado
  - [ ] Facturas generadas
  - [ ] Métricas de ahorro correctas

Estado: [ ] PASS [ ] FAIL
```

### INT-003: Flujo de inventario completo

**Escenario:** Desde compra hasta venta de producto

```
Pasos:
  1. Stock inicial: 10 unidades
  2. Registrar compra: +20 unidades
  3. Vender en factura: 5 unidades
  4. Ajuste manual: -2 unidades (merma)
  5. Verificar Kardex

Verificaciones:
  - [ ] Stock final correcto: 23 unidades
  - [ ] Todos los movimientos en Kardex
  - [ ] Costo promedio calculado
  - [ ] Valorización correcta
  - [ ] Reportes muestran datos correctos

Estado: [ ] PASS [ ] FAIL
```

---

## ⚡ TESTS DE PERFORMANCE

### PERF-001: Carga inicial del sistema

```
Métrica: Tiempo de carga < 3 segundos
Condiciones:
  - Conexión 4G simulada
  - Cache limpio
  
Pasos:
  1. Abrir aplicación
  2. Medir tiempo hasta interactividad completa

Resultado esperado: < 3s
Resultado real: _____ s
Estado: [ ] PASS [ ] FAIL
```

### PERF-002: Búsqueda de clientes

```
Métrica: Resultados en < 500ms
Precondición: 1000+ clientes en sistema

Pasos:
  1. Buscar cliente por nombre
  2. Medir tiempo de respuesta

Resultado esperado: < 500ms
Resultado real: _____ ms
Estado: [ ] PASS [ ] FAIL
```

### PERF-003: Generación de reporte

```
Métrica: < 5 segundos
Precondición: 1 año de datos

Pasos:
  1. Generar reporte anual de ventas
  2. Medir tiempo

Resultado esperado: < 5s
Resultado real: _____ s
Estado: [ ] PASS [ ] FAIL
```

### PERF-004: Optimización de ruta con muchas paradas

```
Métrica: < 3 segundos
Precondición: 20 citas a optimizar

Pasos:
  1. Click "Optimizar Ruta"
  2. Medir tiempo hasta resultado

Resultado esperado: < 3s
Resultado real: _____ s
Estado: [ ] PASS [ ] FAIL
```

---

## 🔒 TESTS DE SEGURIDAD

### SEC-001: Inyección SQL (si backend implementado)

```
Pasos:
  1. Intentar buscar cliente: "'; DROP TABLE clients; --"
  2. Verificar comportamiento

Resultado esperado:
  - No ejecuta código SQL
  - Busca literalmente esa cadena
  - No hay error de BD
  
Estado: [ ] PASS [ ] FAIL
```

### SEC-002: XSS (Cross-Site Scripting)

```
Pasos:
  1. Crear cliente con nombre: "<script>alert('XSS')</script>"
  2. Ver lista de clientes
  3. Ver detalle del cliente

Resultado esperado:
  - Script no se ejecuta
  - Se muestra como texto plano
  - Sanitización correcta
  
Estado: [ ] PASS [ ] FAIL
```

### SEC-003: Acceso sin autenticación

```
Pasos:
  1. Cerrar sesión
  2. Intentar acceder a URL directa: /clients
  3. Intentar acceder a API: /api/clients

Resultado esperado:
  - Redirige a login
  - No expone datos
  - 401 Unauthorized en API
  
Estado: [ ] PASS [ ] FAIL
```

### SEC-004: Escalación de privilegios

```
Precondición: Usuario con rol "client"

Pasos:
  1. Intentar acceder a módulo Usuarios
  2. Intentar acceder a Configuración
  3. Intentar llamar API admin: /api/users

Resultado esperado:
  - Acceso denegado
  - 403 Forbidden
  - Mensaje claro
  
Estado: [ ] PASS [ ] FAIL
```

### SEC-005: Exposición de datos sensibles

```
Pasos:
  1. Abrir DevTools > Network
  2. Crear usuario
  3. Ver request/response

Resultado esperado:
  - Contraseña NUNCA en texto plano
  - Solo hash en BD
  - No se devuelve en response
  
Estado: [ ] PASS [ ] FAIL
```

---

## ✅ CHECKLIST PRE-PRODUCCIÓN

### Funcionalidad
- [ ] Todos los CRUDs funcionan
- [ ] Validaciones implementadas
- [ ] Mensajes de error claros
- [ ] Confirmaciones en acciones críticas
- [ ] Estados de carga implementados

### UX/UI
- [ ] Diseño responsive (móvil, tablet, desktop)
- [ ] Navegación intuitiva
- [ ] Feedback visual inmediato
- [ ] Accesibilidad (keyboard navigation)
- [ ] Tooltips y ayudas contextuales

### Integración
- [ ] Módulos se comunican correctamente
- [ ] Datos sincronizados
- [ ] No hay duplicación de datos
- [ ] Flujos completos funcionan E2E

### Performance
- [ ] Carga inicial < 3s
- [ ] Búsquedas < 500ms
- [ ] No hay memory leaks
- [ ] Paginación en listas >100 items

### Seguridad
- [ ] Autenticación funcional
- [ ] Permisos por rol aplicados
- [ ] Inputs sanitizados
- [ ] No hay inyección SQL/XSS
- [ ] HTTPS en producción
- [ ] Variables de entorno seguras

### Datos
- [ ] Backups automáticos configurados
- [ ] Migrations de BD documentadas
- [ ] Seeders para datos iniciales
- [ ] Plan de recuperación ante desastres

### Monitoreo
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google/Plausible)
- [ ] Logging estructurado
- [ ] Alertas configuradas

### Documentación
- [ ] README actualizado
- [ ] Guía de instalación
- [ ] Guía de deployment
- [ ] Manual de usuario
- [ ] Documentación de API

---

## 📊 MÉTRICAS DE CALIDAD

### Cobertura de Tests
- [ ] Unit tests: >80%
- [ ] Integration tests: >60%
- [ ] E2E tests: Flujos críticos cubiertos

### Bugs
- [ ] 0 bugs críticos
- [ ] < 5 bugs mayores
- [ ] < 20 bugs menores

### Performance
- [ ] Lighthouse Score: >90
- [ ] First Contentful Paint: <1.5s
- [ ] Time to Interactive: <3s
- [ ] Total Bundle Size: <500KB

### Seguridad
- [ ] No vulnerabilidades críticas
- [ ] No vulnerabilidades altas
- [ ] SSL/TLS configurado
- [ ] Headers de seguridad activos

---

## 🚀 PROCESO DE TESTING RECOMENDADO

### 1. Testing Diario (Durante desarrollo)
- Cada feature nueva → test unitario
- Cada bug fix → test de regresión
- Commit code → tests automáticos

### 2. Testing Semanal
- Review de tests existentes
- Ejecutar suite completa
- Fix de tests fallidos
- Actualizar documentación

### 3. Testing Pre-Release
- Suite completa de tests
- Tests E2E de flujos críticos
- Performance testing
- Security audit
- UAT (User Acceptance Testing)

### 4. Testing Post-Release
- Smoke tests en producción
- Monitoreo de errores
- Feedback de usuarios
- Hotfixes si necesario

---

## 📝 PLANTILLA DE REPORTE DE BUG

```markdown
## BUG-XXX: [Título descriptivo]

**Severidad:** [ ] Crítica [ ] Alta [ ] Media [ ] Baja

**Módulo:** [Nombre del módulo]

**Descripción:**
[Descripción clara del problema]

**Pasos para reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado esperado:**
[Qué debería pasar]

**Resultado actual:**
[Qué pasa realmente]

**Screenshots/Videos:**
[Si aplica]

**Entorno:**
- Browser: [Chrome 120]
- OS: [Windows 11]
- Screen: [1920x1080]

**Logs/Errores:**
```
[Pegar logs de consola]
```

**Prioridad sugerida:**
[ ] Inmediata [ ] Alta [ ] Normal [ ] Baja

**Asignado a:** [Nombre]
**Estado:** [ ] Nuevo [ ] En progreso [ ] Resuelto [ ] Cerrado
```

---

**¡Tests completos para un sistema de calidad profesional!** 🧪✅

*"Si no está testeado, está roto."* - Ley de Murphy del Software
