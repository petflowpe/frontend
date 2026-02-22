# 📅 PLAN DE TRABAJO - MÓDULO DE CITAS

**Módulo:** Appointments (Citas)  
**Estado actual:** ✅ Funcional con backend Laravel  
**Objetivo:** Mejorar, optimizar y completar funcionalidades

---

## 🟢 NIVEL 1: TAREAS FÁCILES (1-2 horas)

### 1.1 Limpieza de Código
**Tiempo:** 1 hora | **Prioridad:** Alta

- [ ] Eliminar `console.error` y `console.log` innecesarios
  - `hooks/useAppointments.ts` (líneas 89, 139, 181, 192)
  - `components/appointments/NewAppointmentDialog.tsx` (línea 321)
- [ ] Limpiar comentarios de debug
- [ ] Organizar imports alfabéticamente

**Archivos:**
- `components/Appointments.tsx`
- `components/appointments/NewAppointmentDialog.tsx`
- `hooks/useAppointments.ts`

---

### 1.2 Mejorar Mensajes de Error
**Tiempo:** 1 hora | **Prioridad:** Media

- [ ] Mensajes de error más descriptivos y en español
- [ ] Agregar códigos de error específicos
- [ ] Mejorar feedback visual en toasts

**Ejemplo:**
```typescript
// Antes
toast.error('Error al guardar cita');

// Después
toast.error('No se pudo crear la cita', {
  description: 'Verifica que el vehículo esté disponible y que todos los campos estén completos'
});
```

---

### 1.3 Agregar Estados de Loading
**Tiempo:** 1.5 horas | **Prioridad:** Alta

- [ ] Loading state en botones de acción
- [ ] Skeleton loaders en lista de citas
- [ ] Loading durante validación de disponibilidad
- [ ] Loading durante creación/actualización

**Componentes a modificar:**
- `Appointments.tsx` - Botones de acción
- `NewAppointmentDialog.tsx` - Botón de submit

---

### 1.4 Mejorar Tooltips y Ayuda Contextual
**Tiempo:** 1 hora | **Prioridad:** Baja

- [ ] Agregar tooltips en botones de acción
- [ ] Agregar ayuda contextual en campos del formulario
- [ ] Tooltips en estados de citas

**Ejemplo:**
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button>Clonar</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Crear una nueva cita con los mismos datos</p>
  </TooltipContent>
</Tooltip>
```

---

## 🟡 NIVEL 2: TAREAS INTERMEDIAS (3-5 horas)

### 2.1 Implementar Funcionalidad de Reprogramación
**Tiempo:** 4 horas | **Prioridad:** Alta

**Estado actual:** Solo muestra toast "disponible próximamente"

**Implementación:**
- [ ] Crear componente `RescheduleDialog.tsx`
- [ ] Permitir cambiar fecha y hora
- [ ] Validar disponibilidad en nueva fecha/hora
- [ ] Mantener historial de cambios
- [ ] Notificar al cliente del cambio

**Archivos a crear/modificar:**
- `components/appointments/RescheduleDialog.tsx` (nuevo)
- `components/Appointments.tsx` - Completar `handleReschedule`
- `hooks/useAppointments.ts` - Agregar método `rescheduleAppointment`

**Funcionalidad:**
```typescript
const handleReschedule = async (appointmentId: string, newDate: string, newTime: string) => {
  // 1. Validar disponibilidad
  // 2. Actualizar cita
  // 3. Notificar cliente
  // 4. Guardar en historial
};
```

---

### 2.2 Mejorar Manejo de Items en Backend
**Tiempo:** 3 horas | **Prioridad:** Alta

**Problema actual:** Solo se envía `service_type`, no los items completos

**Solución:**
- [ ] Modificar `toBackendFormat` para enviar items completos
- [ ] Crear endpoint en backend para recibir items
- [ ] Actualizar mapeo de items al cargar citas
- [ ] Validar que items se guarden correctamente

**Archivos:**
- `hooks/useAppointments.ts` - `toBackendFormat` y `fromBackendFormat`
- Backend: Modificar `AppointmentController` para recibir items

**Código:**
```typescript
const toBackendFormat = (appointment: Partial<Appointment>): any => {
  return {
    // ... campos existentes
    items: appointment.items?.map(item => ({
      item_id: item.id,
      item_type: item.type,
      quantity: item.quantity || 1,
      price: item.price,
      duration: item.duration
    })) || []
  };
};
```

---

### 2.3 Mejorar Validación de Disponibilidad
**Tiempo:** 3 horas | **Prioridad:** Media

**Mejoras:**
- [ ] Validar disponibilidad en tiempo real mientras se selecciona fecha/hora
- [ ] Mostrar sugerencias visuales de horarios disponibles
- [ ] Validar capacidad del vehículo
- [ ] Considerar tiempo de viaje entre citas

**Archivos:**
- `components/appointments/NewAppointmentDialog.tsx`
- `services/availabilityValidator.ts` (mejorar)

**Funcionalidad:**
```typescript
// Validación en tiempo real
useEffect(() => {
  if (watchedDate && watchedTime && watchedVehicle) {
    const validation = validateAvailability(watchedDate, watchedTime, watchedVehicle.id);
    if (!validation.available) {
      setAvailabilityError(validation.message);
    }
  }
}, [watchedDate, watchedTime, watchedVehicle]);
```

---

### 2.4 Agregar Filtros Avanzados
**Tiempo:** 3 horas | **Prioridad:** Media

**Filtros a agregar:**
- [ ] Filtro por vehículo
- [ ] Filtro por groomer/veterinario
- [ ] Filtro por rango de fechas
- [ ] Filtro por monto (rango de precios)
- [ ] Filtro por cliente
- [ ] Guardar filtros favoritos

**Archivos:**
- `components/Appointments.tsx` - Agregar más filtros

**UI:**
```tsx
<Select value={vehicleFilter} onValueChange={setVehicleFilter}>
  <SelectTrigger>
    <SelectValue placeholder="Todos los vehículos" />
  </SelectTrigger>
  <SelectContent>
    {vehicles.map(v => (
      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### 2.5 Mejorar Visualización de Citas
**Tiempo:** 4 horas | **Prioridad:** Baja

**Mejoras:**
- [ ] Vista de calendario mejorada
- [ ] Vista de timeline (línea de tiempo)
- [ ] Vista de tarjetas con más información
- [ ] Agrupar por fecha/vehículo
- [ ] Colores por estado más distintivos

**Componentes a crear:**
- `components/appointments/CalendarView.tsx`
- `components/appointments/TimelineView.tsx`
- `components/appointments/CardView.tsx`

---

## 🟠 NIVEL 3: TAREAS AVANZADAS (6-10 horas)

### 3.1 Refactorizar Componente Principal
**Tiempo:** 8 horas | **Prioridad:** Media

**Problema:** `Appointments.tsx` es muy grande (594 líneas)

**División propuesta:**
- [ ] `AppointmentsList.tsx` - Lista de citas
- [ ] `AppointmentCard.tsx` - Tarjeta individual
- [ ] `AppointmentFilters.tsx` - Filtros
- [ ] `AppointmentActions.tsx` - Acciones (completar, cancelar, etc.)
- [ ] `AppointmentHistory.tsx` - Historial de cliente
- [ ] Mantener `Appointments.tsx` como contenedor

**Estructura:**
```
components/appointments/
├── Appointments.tsx (contenedor principal)
├── NewAppointmentDialog.tsx (ya existe)
├── RescheduleDialog.tsx (nuevo)
├── AppointmentsList.tsx (nuevo)
├── AppointmentCard.tsx (nuevo)
├── AppointmentFilters.tsx (nuevo)
├── AppointmentActions.tsx (nuevo)
└── AppointmentHistory.tsx (nuevo)
```

---

### 3.2 Mejorar Sistema de Recurrencia
**Tiempo:** 6 horas | **Prioridad:** Baja

**Mejoras:**
- [ ] Vista previa de citas recurrentes antes de crear
- [ ] Editar serie completa de citas recurrentes
- [ ] Cancelar serie completa
- [ ] Excepciones en serie (saltar una fecha específica)
- [ ] Historial de citas recurrentes

**Archivos:**
- `components/appointments/RecurrencePreview.tsx` (nuevo)
- `components/appointments/RecurrenceManager.tsx` (nuevo)
- `hooks/useAppointments.ts` - Mejorar lógica de recurrencia

---

### 3.3 Implementar Notificaciones Automáticas
**Tiempo:** 8 horas | **Prioridad:** Media

**Funcionalidades:**
- [ ] Recordatorios automáticos (24h, 2h antes)
- [ ] Notificación de confirmación al crear
- [ ] Notificación al reprogramar
- [ ] Notificación al cancelar
- [ ] Integración con WhatsApp/Email/SMS

**Archivos:**
- `services/appointmentNotifications.ts` (nuevo)
- `hooks/useAppointmentNotifications.ts` (nuevo)
- Integrar con `services/notificationService.ts`

---

### 3.4 Agregar Exportación de Citas
**Tiempo:** 4 horas | **Prioridad:** Baja

**Formatos:**
- [ ] Exportar a Excel
- [ ] Exportar a PDF
- [ ] Exportar a CSV
- [ ] Exportar calendario (iCal)

**Funcionalidad:**
```typescript
const exportAppointments = (format: 'excel' | 'pdf' | 'csv' | 'ical') => {
  // Exportar citas filtradas
};
```

---

### 3.5 Implementar Búsqueda Avanzada
**Tiempo:** 5 horas | **Prioridad:** Baja

**Búsqueda por:**
- [ ] Nombre de cliente
- [ ] Nombre de mascota
- [ ] Documento de cliente
- [ ] Teléfono
- [ ] Dirección
- [ ] Notas de la cita
- [ ] Búsqueda combinada (AND/OR)

**Componente:**
- `components/appointments/AdvancedSearch.tsx` (nuevo)

---

## 🔴 NIVEL 4: TAREAS COMPLEJAS (10+ horas)

### 4.1 Implementar Drag & Drop para Reprogramar
**Tiempo:** 12 horas | **Prioridad:** Baja

**Funcionalidad:**
- [ ] Arrastrar citas en calendario para cambiar fecha/hora
- [ ] Validar disponibilidad al soltar
- [ ] Feedback visual durante arrastre
- [ ] Confirmar cambio antes de guardar

**Librería sugerida:**
- `react-beautiful-dnd` o `@dnd-kit/core`

---

### 4.2 Sistema de Conflictos y Resolución
**Tiempo:** 10 horas | **Prioridad:** Media

**Funcionalidades:**
- [ ] Detectar conflictos automáticamente
- [ ] Sugerir soluciones a conflictos
- [ ] Resolver conflictos automáticamente (opcional)
- [ ] Historial de conflictos resueltos

**Componente:**
- `components/appointments/ConflictResolver.tsx` (nuevo)

---

### 4.3 Optimización de Rutas desde Citas
**Tiempo:** 15 horas | **Prioridad:** Baja

**Funcionalidad:**
- [ ] Generar ruta automática desde citas del día
- [ ] Optimizar orden de visitas
- [ ] Calcular tiempos de viaje
- [ ] Visualizar ruta en mapa
- [ ] Ajustar horarios según ruta optimizada

**Integración:**
- Conectar con módulo de Rutas
- Usar Google Maps API

---

### 4.4 Analytics y Reportes de Citas
**Tiempo:** 12 horas | **Prioridad:** Baja

**Reportes:**
- [ ] Citas por día/semana/mes
- [ ] Tasa de cancelación
- [ ] Tasa de no-show
- [ ] Ingresos por citas
- [ ] Citas más populares por servicio
- [ ] Horarios más demandados
- [ ] Gráficos y visualizaciones

**Componente:**
- `components/appointments/AppointmentAnalytics.tsx` (nuevo)

---

## 📊 RESUMEN Y PRIORIZACIÓN

### 🎯 Esta Semana (Prioridad Alta)
1. ✅ Limpieza de código (1h)
2. ✅ Agregar estados de loading (1.5h)
3. ✅ Mejorar mensajes de error (1h)
4. ✅ Implementar reprogramación (4h)

**Total:** ~7.5 horas

### 🎯 Próxima Semana (Prioridad Media)
1. Mejorar manejo de items en backend (3h)
2. Mejorar validación de disponibilidad (3h)
3. Agregar filtros avanzados (3h)
4. Refactorizar componente principal (8h)

**Total:** ~17 horas

### 🎯 Cuando Tengas Tiempo (Prioridad Baja)
1. Mejorar sistema de recurrencia (6h)
2. Notificaciones automáticas (8h)
3. Exportación de citas (4h)
4. Búsqueda avanzada (5h)

---

## 🛠️ CHECKLIST DE INICIO

Antes de empezar:

- [ ] Backend Laravel funcionando
- [ ] Endpoint `/api/v1/appointments` funcionando
- [ ] Endpoint `/api/v1/appointments/{id}` funcionando
- [ ] Hook `useAppointments` funcionando
- [ ] Componente `Appointments.tsx` cargando correctamente

---

## 📝 NOTAS TÉCNICAS

### Estructura de Datos Actual

```typescript
interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  clientId: string;
  petId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  items?: any[]; // Servicios y productos
  vehicle?: any;
  // ... más campos
}
```

### Endpoints Backend Necesarios

```
GET    /api/v1/appointments           - Listar citas
POST   /api/v1/appointments           - Crear cita
GET    /api/v1/appointments/{id}      - Obtener cita
PUT    /api/v1/appointments/{id}      - Actualizar cita
DELETE /api/v1/appointments/{id}      - Eliminar cita
POST   /api/v1/appointments/{id}/reschedule - Reprogramar
POST   /api/v1/appointments/{id}/cancel     - Cancelar
POST   /api/v1/appointments/{id}/complete   - Completar
```

---

## ✅ PRIMEROS PASOS

1. **Limpieza (1h)**
   ```bash
   # Buscar console.log/error
   grep -r "console\." src/components/Appointments.tsx
   grep -r "console\." src/components/appointments/
   grep -r "console\." src/hooks/useAppointments.ts
   ```

2. **Agregar Loading States (1.5h)**
   - Modificar botones en `Appointments.tsx`
   - Agregar loading en `NewAppointmentDialog.tsx`

3. **Implementar Reprogramación (4h)**
   - Crear `RescheduleDialog.tsx`
   - Completar `handleReschedule` en `Appointments.tsx`

---

**¡Empecemos por lo fácil y vayamos avanzando! 🚀**
