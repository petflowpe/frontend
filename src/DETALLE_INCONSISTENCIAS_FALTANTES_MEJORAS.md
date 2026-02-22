# 📋 DETALLE COMPLETO: INCONSISTENCIAS, FALTANTES Y MEJORAS

**Sistema:** SmartPet - Clínica Veterinaria Móvil  
**Fecha:** 30 de Diciembre, 2024  
**Propósito:** Plan de acción detallado para mejorar el sistema

---

## 📑 ÍNDICE

1. [15 Inconsistencias entre Módulos](#inconsistencias)
2. [18 Funcionalidades Faltantes](#faltantes)
3. [23 Mejoras Sugeridas](#mejoras)
4. [Roadmap de Implementación](#roadmap)
5. [Matriz de Esfuerzo vs Impacto](#matriz)

---

## 1. 🔄 15 INCONSISTENCIAS ENTRE MÓDULOS {#inconsistencias}

### INCONSISTENCIA #1: Sincronización Citas ↔ Rutas

**📍 Ubicación:**
- `/components/Appointments.tsx` (Citas)
- `/components/Routes.tsx` (Rutas)
- `/components/routes/OptimizadorRutasMejorado.tsx` (Optimizador)

**❌ Problema Actual:**
Cuando se crea, modifica o cancela una cita, las rutas NO se actualizan automáticamente. El optimizador de rutas tiene que ejecutarse manualmente.

**🔍 Ejemplo del Problema:**
```typescript
// CITAS: Se crea una nueva cita
const addAppointment = (appointmentData) => {
  setAppointments([...appointments, newAppointment]);
  toast.success('Cita creada');
  // ❌ NO actualiza rutas automáticamente
};

// RUTAS: Tiene datos obsoletos
const rutaOptimizada = optimizarRuta(appointments); // Usa datos viejos
```

**✅ Solución Propuesta:**
```typescript
// Event-driven approach
import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

// En Appointments.tsx
const addAppointment = (appointmentData) => {
  setAppointments([...appointments, newAppointment]);
  
  // Emitir evento
  eventBus.emit('appointment.created', {
    appointment: newAppointment,
    date: newAppointment.date,
    vehicleId: newAppointment.vehicleId
  });
  
  toast.success('Cita creada');
};

// En Routes.tsx - Escuchar evento
useEffect(() => {
  eventBus.on('appointment.created', (data) => {
    // Re-optimizar ruta del día afectado
    optimizeRouteForDate(data.date, data.vehicleId);
  });
  
  eventBus.on('appointment.cancelled', (data) => {
    removeFromRoute(data.appointmentId);
  });
  
  return () => {
    eventBus.removeAllListeners();
  };
}, []);
```

**📊 Impacto:**
- **Severidad:** 🔴 Alta
- **Frecuencia:** Diaria
- **Usuarios afectados:** Personal operativo
- **Tiempo de implementación:** 3 días

**🎯 Beneficios:**
- Rutas siempre actualizadas
- Ahorro de tiempo (no recalcular manualmente)
- Mejor experiencia del groomer
- Optimización en tiempo real

---

### INCONSISTENCIA #2: Inventario ↔ Servicios

**📍 Ubicación:**
- `/components/ProductKardex.tsx` (Inventario)
- `/components/Appointments.tsx` (Servicios completados)
- `/contexts/AppContext.tsx` (Estado global)

**❌ Problema Actual:**
Cuando se completa un servicio que usa productos, el inventario NO se descuenta automáticamente. Hay que hacerlo manualmente.

**🔍 Ejemplo del Problema:**
```typescript
// SERVICIO: Define productos requeridos
const service = {
  id: 'SRV-001',
  name: 'Baño + Corte',
  requiredProducts: ['PROD-SHAMPOO', 'PROD-COND'] // ❌ Solo referencia
};

// CITA: Se completa el servicio
const completeAppointment = (appointmentId) => {
  updateAppointment(appointmentId, { status: 'completed' });
  // ❌ NO descuenta productos automáticamente
};

// KARDEX: Stock incorrecto
console.log(products.find(p => p.id === 'PROD-SHAMPOO').stock); 
// Todavía muestra 100 unidades cuando debería ser 99
```

**✅ Solución Propuesta:**

**Opción A: Con Trigger de Base de Datos (Supabase)**
```sql
-- Trigger automático en Supabase
CREATE OR REPLACE FUNCTION decrease_inventory_on_service()
RETURNS TRIGGER AS $$
DECLARE
  service_data RECORD;
  product_id UUID;
  product_quantity INTEGER;
BEGIN
  -- Solo ejecutar cuando el servicio se completa
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Obtener productos requeridos del servicio
    FOR service_data IN 
      SELECT sr.product_id, sr.quantity
      FROM service_requirements sr
      WHERE sr.service_id = ANY(NEW.service_ids)
    LOOP
      -- Descontar del inventario
      UPDATE products
      SET stock = stock - service_data.quantity
      WHERE id = service_data.product_id;
      
      -- Registrar en kardex
      INSERT INTO kardex_movements (
        product_id,
        type,
        quantity,
        reference_type,
        reference_id,
        created_at
      ) VALUES (
        service_data.product_id,
        'salida',
        service_data.quantity,
        'servicio',
        NEW.id,
        NOW()
      );
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_decrease_inventory
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION decrease_inventory_on_service();
```

**Opción B: Con Lógica en Frontend (temporal)**
```typescript
const completeAppointment = async (appointmentId: string) => {
  const appointment = appointments.find(a => a.id === appointmentId);
  
  // 1. Obtener productos requeridos
  const requiredProducts = appointment.serviceIds.flatMap(serviceId => {
    const service = services.find(s => s.id === serviceId);
    return service?.requiredProducts || [];
  });
  
  // 2. Descontar del inventario
  requiredProducts.forEach(productId => {
    updateProduct(productId, {
      stock: products.find(p => p.id === productId).stock - 1
    });
  });
  
  // 3. Registrar en kardex
  addKardexMovement({
    type: 'salida',
    reason: `Servicio completado - Cita ${appointmentId}`,
    products: requiredProducts,
    date: new Date().toISOString()
  });
  
  // 4. Actualizar estado de cita
  updateAppointment(appointmentId, { status: 'completed' });
  
  toast.success('Servicio completado e inventario actualizado');
};
```

**📊 Impacto:**
- **Severidad:** 🔴 Alta
- **Frecuencia:** Por cada servicio (10-50 veces/día)
- **Usuarios afectados:** Personal, administración
- **Tiempo de implementación:** 2 días

**🎯 Beneficios:**
- Stock siempre correcto
- Trazabilidad completa
- Alertas de stock bajo oportunas
- Reducción de errores humanos

---

### INCONSISTENCIA #3: Facturación ↔ Citas

**📍 Ubicación:**
- `/components/Invoicing.tsx` (Facturas)
- `/components/Payments.tsx` (Pagos)
- `/components/Appointments.tsx` (Citas)

**❌ Problema Actual:**
Cuando se paga una factura, el estado de la cita NO se actualiza a "pagado". Y viceversa.

**🔍 Ejemplo del Problema:**
```typescript
// PAGO: Se registra un pago
const registerPayment = (invoiceId, amount, method) => {
  updateInvoice(invoiceId, { 
    status: 'paid',
    paymentMethod: method 
  });
  // ❌ La cita relacionada sigue como 'paymentStatus: pending'
};

// CITA: Muestra información incorrecta
const appointment = appointments.find(a => a.id === 'APT-001');
console.log(appointment.paymentStatus); // 'pending' ❌ Debería ser 'paid'
```

**✅ Solución Propuesta:**
```typescript
// 1. Estructura bidireccional
interface Invoice {
  id: string;
  appointmentId?: string; // ✅ Referencia a cita
  // ... resto de campos
}

interface Appointment {
  id: string;
  invoiceId?: string; // ✅ Referencia a factura
  paymentStatus: 'pending' | 'partial' | 'paid';
  // ... resto de campos
}

// 2. Sincronización automática
const registerPayment = async (invoiceId: string, paymentData: Payment) => {
  // Actualizar factura
  const invoice = invoices.find(i => i.id === invoiceId);
  updateInvoice(invoiceId, { 
    status: 'paid',
    paymentMethod: paymentData.method,
    paymentDate: new Date().toISOString()
  });
  
  // ✅ Actualizar cita relacionada automáticamente
  if (invoice.appointmentId) {
    updateAppointment(invoice.appointmentId, {
      paymentStatus: 'paid',
      paymentMethod: paymentData.method
    });
    
    // Notificar al cliente
    sendNotification({
      to: appointment.clientId,
      type: 'payment_confirmed',
      message: 'Tu pago ha sido procesado exitosamente'
    });
  }
  
  toast.success('Pago registrado y cita actualizada');
};

// 3. Hook para mantener sincronización
const useSyncInvoiceAppointment = () => {
  useEffect(() => {
    // Escuchar cambios en facturas
    const unsubscribe = supabase
      .from('invoices')
      .on('UPDATE', (payload) => {
        if (payload.new.status === 'paid' && payload.new.appointmentId) {
          // Actualizar cita
          updateAppointment(payload.new.appointmentId, {
            paymentStatus: 'paid'
          });
        }
      })
      .subscribe();
      
    return () => unsubscribe();
  }, []);
};
```

**📊 Impacto:**
- **Severidad:** 🟡 Media-Alta
- **Frecuencia:** Cada pago (5-30 veces/día)
- **Usuarios afectados:** Clientes, contabilidad
- **Tiempo de implementación:** 2 días

**🎯 Beneficios:**
- Información consistente
- Mejor seguimiento de pagos
- Reportes precisos
- Experiencia del cliente mejorada

---

### INCONSISTENCIA #4: Clientes ↔ Segmentación

**📍 Ubicación:**
- `/components/Clients.tsx` (Gestión clientes)
- `/components/segmentacion/SegmentacionAutomatica.tsx` (Segmentación)
- `/supabase/migrations/001_segmentacion_automatica.sql` (Triggers)

**❌ Problema Actual:**
Los triggers de segmentación están creados en SQL pero el frontend NO está conectado a Supabase, por lo que NO se ejecutan.

**🔍 Ejemplo del Problema:**
```typescript
// CLIENTE: Agrega una mascota en frontend
const addPetToClient = (clientId, petData) => {
  const newPet = { ...petData, id: `PET-${Date.now()}` };
  
  setClients(prev => prev.map(client => {
    if (client.id === clientId) {
      return {
        ...client,
        pets: [...client.pets, newPet]
      };
    }
    return client;
  }));
  
  // ❌ NO actualiza categoría del cliente
  // ❌ El trigger SQL existe pero no se ejecuta porque los datos están solo en memoria
};

// SEGMENTACIÓN: Muestra datos incorrectos
const clientCategory = getClientCategory(clientId);
console.log(clientCategory); // 'Plata' (1 mascota)
// Pero ahora tiene 2 mascotas, debería ser 'Bronce'
```

**✅ Solución Propuesta:**
```typescript
// 1. Conectar con Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 2. Operaciones que disparan triggers automáticamente
const addPetToClient = async (clientId: string, petData: Omit<Pet, 'id'>) => {
  // ✅ Insertar en Supabase (dispara trigger automáticamente)
  const { data: newPet, error } = await supabase
    .from('pets')
    .insert({
      ...petData,
      userId: clientId,
      fallecido: false
    })
    .select()
    .single();
    
  if (error) {
    toast.error('Error al agregar mascota');
    return;
  }
  
  // ✅ El trigger SQL recalcula automáticamente la categoría
  // Recargar datos del cliente para ver la nueva categoría
  const { data: updatedClient } = await supabase
    .from('users')
    .select('*, pets(*)')
    .eq('id', clientId)
    .single();
    
  toast.success(`Mascota agregada. Categoría actualizada: ${updatedClient.categoria}`);
  
  // Actualizar estado local
  setClients(prev => prev.map(c => 
    c.id === clientId ? updatedClient : c
  ));
};

// 3. Marcar mascota como fallecida (también dispara recálculo)
const markPetAsDeceased = async (petId: string) => {
  const { data, error } = await supabase
    .from('pets')
    .update({ fallecido: true })
    .eq('id', petId)
    .select('userId')
    .single();
    
  if (error) {
    toast.error('Error al actualizar mascota');
    return;
  }
  
  // ✅ Trigger recalcula categoría automáticamente
  toast.success('Mascota marcada como fallecida. Categoría del cliente actualizada.');
  
  // Recargar cliente
  refreshClient(data.userId);
};

// 4. Suscribirse a cambios en tiempo real
const useClientCategoryRealtime = (clientId: string) => {
  const [category, setCategory] = useState<string | null>(null);
  
  useEffect(() => {
    // Cargar inicial
    supabase
      .from('users')
      .select('categoria, cantidad_mascotas')
      .eq('id', clientId)
      .single()
      .then(({ data }) => setCategory(data?.categoria));
    
    // ✅ Escuchar cambios en tiempo real
    const subscription = supabase
      .channel(`client-${clientId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${clientId}`
      }, (payload) => {
        setCategory(payload.new.categoria);
        toast.info(`Tu categoría cambió a: ${payload.new.categoria}`);
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [clientId]);
  
  return category;
};
```

**📊 Impacto:**
- **Severidad:** 🔴 Alta
- **Frecuencia:** Cada mascota registrada/fallecida (5-15 veces/semana)
- **Usuarios afectados:** Todos los clientes
- **Tiempo de implementación:** 3 días

**🎯 Beneficios:**
- Categorización automática y precisa
- Descuentos aplicados correctamente
- Priorización justa en rutas
- Notificaciones de cambio de categoría

---

### INCONSISTENCIA #5: Portal Cliente ↔ Sistema Admin

**📍 Ubicación:**
- `/components/booking/BookingPortal.tsx` (Portal público)
- `/components/Appointments.tsx` (Sistema admin)

**❌ Problema Actual:**
El portal cliente y el sistema admin están completamente separados. Las citas creadas en el portal NO aparecen en el admin.

**🔍 Ejemplo del Problema:**
```typescript
// PORTAL CLIENTE: Crea cita
const [portalAppointments, setPortalAppointments] = useState([]);

const createBooking = (bookingData) => {
  const newBooking = { ...bookingData, id: `BOOKING-${Date.now()}` };
  setPortalAppointments([...portalAppointments, newBooking]);
  // ❌ Solo se guarda en estado local del portal
};

// SISTEMA ADMIN: No ve la cita
const adminAppointments = useAppContext().appointments;
console.log(adminAppointments); 
// ❌ No incluye las citas del portal
```

**✅ Solución Propuesta:**
```typescript
// 1. Base de datos compartida (Supabase)
// Ambos usan la misma tabla 'appointments'

// PORTAL CLIENTE
const createBooking = async (bookingData: BookingData) => {
  // ✅ Guardar en Supabase (misma BD que admin)
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...bookingData,
      source: 'portal', // Marcar origen
      status: 'pending_confirmation', // Estado inicial
      createdAt: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    toast.error('Error al crear cita');
    return;
  }
  
  // ✅ Notificar al admin en tiempo real
  await supabase
    .from('admin_notifications')
    .insert({
      type: 'new_appointment',
      message: `Nueva cita desde portal: ${data.id}`,
      appointmentId: data.id,
      read: false
    });
  
  // Email al cliente
  await sendEmail({
    to: bookingData.clientEmail,
    subject: 'Cita recibida - Pendiente de confirmación',
    template: 'booking_received',
    data: { appointment: data }
  });
  
  toast.success('¡Cita solicitada! Te confirmaremos pronto.');
  return data;
};

// SISTEMA ADMIN - Ver todas las citas (incluyendo portal)
const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [newAppointmentAlert, setNewAppointmentAlert] = useState(false);
  
  useEffect(() => {
    // Cargar todas las citas
    const loadAppointments = async () => {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          client:users(*),
          services(*)
        `)
        .order('date', { ascending: true });
        
      setAppointments(data || []);
    };
    
    loadAppointments();
    
    // ✅ Escuchar nuevas citas en tiempo real
    const subscription = supabase
      .channel('appointments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments',
        filter: 'source=eq.portal' // Solo del portal
      }, (payload) => {
        // Mostrar notificación
        setNewAppointmentAlert(true);
        toast.info('Nueva cita desde el portal', {
          action: {
            label: 'Ver',
            onClick: () => openAppointment(payload.new.id)
          }
        });
        
        // Agregar a lista
        setAppointments(prev => [payload.new, ...prev]);
      })
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);
  
  // Confirmar cita desde admin
  const confirmAppointment = async (appointmentId: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ 
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        confirmedBy: currentUser.id
      })
      .eq('id', appointmentId)
      .select()
      .single();
      
    if (!error) {
      // ✅ Cliente recibe notificación automática
      await sendEmail({
        to: data.client.email,
        subject: '¡Cita confirmada!',
        template: 'appointment_confirmed',
        data: { appointment: data }
      });
      
      toast.success('Cita confirmada y cliente notificado');
    }
  };
  
  return (
    <div>
      {newAppointmentAlert && (
        <Alert variant="success">
          <Bell className="h-4 w-4" />
          <AlertTitle>Nueva cita desde el portal</AlertTitle>
          <AlertDescription>
            Revisa y confirma las citas pendientes
          </AlertDescription>
        </Alert>
      )}
      
      {/* Lista de citas con badge según origen */}
      {appointments.map(apt => (
        <AppointmentCard 
          key={apt.id} 
          appointment={apt}
          showSourceBadge={true} // 🌐 Portal o 🖥️ Admin
        />
      ))}
    </div>
  );
};
```

**📊 Impacto:**
- **Severidad:** 🔴 Crítica
- **Frecuencia:** Cada reserva online (20-50 veces/día)
- **Usuarios afectados:** Clientes, personal
- **Tiempo de implementación:** 4 días

**🎯 Beneficios:**
- Sistema unificado
- No se pierden reservas
- Confirmación rápida
- Mejor experiencia del cliente

---

### INCONSISTENCIA #6: Notificaciones ↔ Confirmaciones

**📍 Ubicación:**
- `/components/Notifications.tsx`
- `/components/Appointments.tsx`

**❌ Problema Actual:**
Confirmar una cita NO marca la notificación como leída automáticamente.

**✅ Solución:**
```typescript
const confirmAppointment = async (appointmentId: string) => {
  // Actualizar cita
  await updateAppointment(appointmentId, { 
    confirmationStatus: 'confirmed' 
  });
  
  // ✅ Marcar notificaciones relacionadas como leídas
  const relatedNotifications = notifications.filter(n => 
    n.appointmentId === appointmentId && 
    n.type === 'appointment_reminder'
  );
  
  relatedNotifications.forEach(notif => {
    markNotificationAsRead(notif.id);
  });
};
```

**📊 Impacto:** 🟡 Media | **Tiempo:** 1 día

---

### INCONSISTENCIA #7: GPS Tracking ↔ Rutas

**📍 Ubicación:**
- `/components/GPSTracking.tsx`
- `/components/Routes.tsx`

**❌ Problema Actual:**
La ubicación GPS del vehículo NO actualiza el progreso de la ruta en tiempo real.

**✅ Solución:**
```typescript
// WebSocket para actualización en tiempo real
const useGPSTracking = (vehicleId: string) => {
  useEffect(() => {
    const ws = new WebSocket(`wss://api.smartpet.com/gps/${vehicleId}`);
    
    ws.onmessage = (event) => {
      const location = JSON.parse(event.data);
      
      // Actualizar ubicación del vehículo
      updateVehicleLocation(vehicleId, location);
      
      // ✅ Actualizar estado de la ruta
      updateRouteProgress(vehicleId, location);
      
      // Notificar al cliente cuando el groomer está cerca
      checkProximityAlert(location);
    };
    
    return () => ws.close();
  }, [vehicleId]);
};
```

**📊 Impacto:** 🟡 Media | **Tiempo:** 3 días

---

### INCONSISTENCIA #8: Usuarios ↔ Permisos

**📍 Ubicación:**
- `/components/UserManagement.tsx`
- `/context/AuthContext.tsx`

**❌ Problema Actual:**
Cambiar el rol de un usuario NO actualiza sus permisos inmediatamente (requiere re-login).

**✅ Solución:**
```typescript
const updateUserRole = async (userId: string, newRole: string) => {
  // Actualizar en BD
  await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);
  
  // ✅ Invalidar sesión actual
  await supabase.auth.admin.signOut(userId);
  
  // ✅ Notificar al usuario
  await sendNotification(userId, {
    title: 'Rol actualizado',
    message: `Tu rol ha cambiado a ${newRole}. Por favor, vuelve a iniciar sesión.`
  });
};
```

**📊 Impacto:** 🟡 Media | **Tiempo:** 1 día

---

### INCONSISTENCIA #9: Reportes ↔ Datos Reales

**📍 Ubicación:**
- `/components/Reports.tsx`
- `/components/PredictiveAnalytics.tsx`

**❌ Problema Actual:**
Los reportes usan datos de ejemplo hardcodeados, no datos reales.

**✅ Solución:**
```typescript
// Antes (❌)
const salesData = [
  { month: 'Enero', sales: 45000 }, // Datos fake
  { month: 'Febrero', sales: 52000 }
];

// Después (✅)
const useSalesData = (startDate: string, endDate: string) => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'paid');
        
      // Agrupar por mes
      const salesByMonth = groupByMonth(invoices);
      setData(salesByMonth);
    };
    
    fetchData();
  }, [startDate, endDate]);
  
  return data;
};
```

**📊 Impacto:** 🔴 Alta | **Tiempo:** 2 días

---

### INCONSISTENCIA #10: Calendario ↔ Horarios de Trabajo

**📍 Ubicación:**
- `/components/Appointments.tsx`
- `/components/Settings.tsx` (businessSettings)

**❌ Problema Actual:**
El sistema permite agendar citas fuera del horario laboral configurado.

**✅ Solución:**
```typescript
const validateAppointmentTime = (date: string, time: string) => {
  const dayOfWeek = new Date(date).toLocaleLowerCase('en-US', { weekday: 'long' });
  const workingHours = businessSettings.workingHours[dayOfWeek];
  
  if (!workingHours.open) {
    return { valid: false, message: 'No trabajamos este día' };
  }
  
  const appointmentTime = parseTime(time);
  const startTime = parseTime(workingHours.startTime);
  const endTime = parseTime(workingHours.endTime);
  
  if (appointmentTime < startTime || appointmentTime > endTime) {
    return { 
      valid: false, 
      message: `Horario disponible: ${workingHours.startTime} - ${workingHours.endTime}` 
    };
  }
  
  return { valid: true };
};
```

**📊 Impacto:** 🟡 Media | **Tiempo:** 1 día

---

### INCONSISTENCIA #11: Productos ↔ Servicios (Validación)

**📍 Ubicación:**
- `/components/Services.tsx`
- `/components/ProductKardex.tsx`

**❌ Problema Actual:**
Permite agendar un servicio aunque no haya stock de productos requeridos.

**✅ Solución:**
```typescript
const validateServiceAvailability = async (serviceId: string, date: string) => {
  const service = services.find(s => s.id === serviceId);
  
  if (!service.requiredProducts || service.requiredProducts.length === 0) {
    return { available: true };
  }
  
  // Verificar stock de cada producto requerido
  for (const productId of service.requiredProducts) {
    const product = await getProduct(productId);
    
    if (product.stock < 1) {
      return {
        available: false,
        reason: `Sin stock de ${product.name}`,
        suggestedDate: await getNextAvailableDate(serviceId)
      };
    }
  }
  
  return { available: true };
};
```

**📊 Impacto:** 🟡 Media | **Tiempo:** 2 días

---

### INCONSISTENCIA #12: Mascotas ↔ Restricciones de Servicio

**📍 Ubicación:**
- `/components/Services.tsx`
- `/components/Clients.tsx` (pets)

**❌ Problema Actual:**
Permite agendar un servicio no apto para el tamaño/raza de la mascota.

**✅ Solución:**
```typescript
const validateServiceForPet = (service: Service, pet: Pet) => {
  // Validar tamaño
  if (service.allowedSizes && !service.allowedSizes.includes(pet.size)) {
    return {
      valid: false,
      message: `Este servicio solo está disponible para mascotas: ${service.allowedSizes.join(', ')}`
    };
  }
  
  // Validar raza restringida
  if (service.restrictedBreeds?.includes(pet.breed)) {
    return {
      valid: false,
      message: `Este servicio no está disponible para la raza ${pet.breed}`
    };
  }
  
  // Validar peso
  if (service.weightMultipliers) {
    const applicable = service.weightMultipliers.find(wm => 
      pet.weight >= wm.minWeight && pet.weight <= wm.maxWeight
    );
    
    if (!applicable) {
      return {
        valid: false,
        message: `Este servicio no está disponible para mascotas de ${pet.weight}kg`
      };
    }
  }
  
  return { valid: true };
};
```

**📊 Impacto:** 🟡 Media | **Tiempo:** 1 día

---

### INCONSISTENCIA #13: Zonas ↔ Clientes (Catálogo)

**📍 Ubicación:**
- `/components/Clients.tsx`
- `/components/Routes.tsx`

**❌ Problema Actual:**
El campo `zone` es texto libre, causando inconsistencias ("Miraflores" vs "miraflores" vs "MIRAFLORES").

**✅ Solución:**
```typescript
// Catálogo de zonas
const ZONES = [
  { id: 'ZONA-MF', name: 'Miraflores', districts: ['Miraflores'] },
  { id: 'ZONA-SI', name: 'San Isidro', districts: ['San Isidro'] },
  { id: 'ZONA-SUR', name: 'Surco', districts: ['Surco', 'La Molina'] },
  // ...
] as const;

// Componente de selección
<Select 
  value={client.zone}
  onChange={(zoneId) => updateClient(client.id, { zone: zoneId })}
>
  {ZONES.map(zone => (
    <SelectItem key={zone.id} value={zone.id}>
      {zone.name} ({zone.districts.join(', ')})
    </SelectItem>
  ))}
</Select>
```

**📊 Impacto:** 🟡 Media | **Tiempo:** 1 día

---

### INCONSISTENCIA #14: Descuentos ↔ Facturación

**📍 Ubicación:**
- `/components/Invoicing.tsx`
- `/components/segmentacion/SegmentacionAutomatica.tsx`

**❌ Problema Actual:**
Los descuentos por categoría a veces no se aplican correctamente.

**✅ Solución:**
```typescript
const calculateInvoiceTotal = (items: InvoiceItem[], client: Client) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  
  // ✅ Obtener descuento por categoría
  const categoryDiscount = getCategoryDiscount(client.categoria);
  
  // Aplicar descuento
  const discountAmount = (subtotal * categoryDiscount) / 100;
  const afterDiscount = subtotal - discountAmount;
  
  // Calcular impuestos
  const tax = afterDiscount * 0.18; // IGV 18%
  
  const total = afterDiscount + tax;
  
  return {
    subtotal,
    discount: discountAmount,
    discountPercentage: categoryDiscount,
    tax,
    total
  };
};

const getCategoryDiscount = (categoria: string) => {
  const discounts = {
    'Oro': 15,
    'Bronce': 10,
    'Plata': 0
  };
  
  return discounts[categoria] || 0;
};
```

**📊 Impacto:** 🟡 Media | **Tiempo:** 1 día

---

### INCONSISTENCIA #15: Analytics ↔ Filtros Globales

**📍 Ubicación:**
- `/components/PredictiveAnalytics.tsx`
- `/components/Reports.tsx`

**❌ Problema Actual:**
Aplicar filtro de fecha en un gráfico no lo aplica a todos los demás.

**✅ Solución:**
```typescript
// Context para filtros globales
interface AnalyticsFilters {
  dateRange: { start: string; end: string };
  zone?: string;
  category?: string;
}

const AnalyticsContext = createContext<{
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
}>();

// Usar en todos los componentes de analytics
const SalesChart = () => {
  const { filters } = useAnalyticsContext();
  
  const salesData = useMemo(() => {
    return fetchSalesData(filters.dateRange, filters.zone);
  }, [filters]);
  
  return <Chart data={salesData} />;
};
```

**📊 Impacto:** 🟢 Baja | **Tiempo:** 2 días

---

## 2. 🚫 18 FUNCIONALIDADES FALTANTES {#faltantes}

### FALTANTE #1: Sistema de Backups Automáticos

**📋 Descripción:**
No existe un sistema automatizado de respaldo de datos. Si se pierde la base de datos, se pierde todo.

**🎯 Funcionalidad Deseada:**
```typescript
// Sistema de backups automáticos
interface BackupSystem {
  // Configuración
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number; // días
  storage: 'supabase' | 's3' | 'google-cloud';
  
  // Funciones
  createBackup(): Promise<Backup>;
  listBackups(): Promise<Backup[]>;
  restoreBackup(backupId: string): Promise<void>;
  scheduleBackup(config: BackupConfig): Promise<void>;
}

// Implementación con Supabase
const setupBackups = async () => {
  // 1. Backup diario automático (3 AM)
  await supabase.rpc('create_backup_schedule', {
    name: 'daily-backup',
    schedule: '0 3 * * *', // cron expression
    retention_days: 30
  });
  
  // 2. Backup antes de actualizaciones importantes
  const createPreUpdateBackup = async () => {
    const backup = await supabase.rpc('create_manual_backup', {
      label: `pre-update-${new Date().toISOString()}`
    });
    
    console.log(`Backup creado: ${backup.id}`);
  };
  
  // 3. Restauración
  const restoreFromBackup = async (backupId: string) => {
    const confirmation = confirm(
      '¿Estás seguro? Esto sobrescribirá los datos actuales.'
    );
    
    if (confirmation) {
      await supabase.rpc('restore_backup', { backup_id: backupId });
      toast.success('Base de datos restaurada');
    }
  };
};
```

**📦 Componentes a Crear:**
```
/components/admin/BackupManager.tsx
/services/backupService.ts
/hooks/useBackups.ts
```

**🔧 Configuración Supabase:**
```sql
-- Función para crear backups
CREATE OR REPLACE FUNCTION create_backup()
RETURNS TABLE(backup_id UUID, created_at TIMESTAMP) AS $$
BEGIN
  -- Crear snapshot de todas las tablas
  -- Implementación específica según estrategia
END;
$$ LANGUAGE plpgsql;

-- Programar backup diario
SELECT cron.schedule(
  'daily-backup',
  '0 3 * * *', -- 3 AM todos los días
  $$ SELECT create_backup(); $$
);
```

**📊 Detalles:**
- **Prioridad:** 🔴 Crítica
- **Esfuerzo:** 2 días
- **Dependencias:** Supabase configurado
- **Beneficio:** Protección contra pérdida de datos

---

### FALTANTE #2: Recuperación de Contraseña

**📋 Descripción:**
No hay forma de recuperar contraseña olvidada. El usuario queda bloqueado.

**🎯 Funcionalidad Deseada:**
```typescript
// Flujo completo de recuperación
interface PasswordRecovery {
  requestReset(email: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

// Implementación
const ForgotPasswordFlow = () => {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // Paso 1: Solicitar recuperación
  const requestPasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://smartpet.com/reset-password'
    });
    
    if (!error) {
      toast.success('Revisa tu email para continuar');
      setStep('code');
    }
  };
  
  // Paso 2: Validar código (si se usa código en vez de link)
  const validateResetCode = async (code: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'recovery'
    });
    
    if (!error) {
      setResetToken(data.session.access_token);
      setStep('reset');
    }
  };
  
  // Paso 3: Establecer nueva contraseña
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (!error) {
      toast.success('Contraseña actualizada exitosamente');
      router.push('/login');
    }
  };
  
  return (
    <div>
      {step === 'email' && (
        <EmailInput onSubmit={requestPasswordReset} />
      )}
      {step === 'code' && (
        <CodeInput onSubmit={validateResetCode} />
      )}
      {step === 'reset' && (
        <NewPasswordForm onSubmit={updatePassword} />
      )}
    </div>
  );
};
```

**📦 Componentes a Crear:**
```
/components/auth/ForgotPassword.tsx
/components/auth/ResetPassword.tsx
/services/passwordRecoveryService.ts
```

**📧 Templates de Email:**
```html
<!-- forgot-password-email.html -->
<div>
  <h1>Recupera tu contraseña</h1>
  <p>Hola {{name}},</p>
  <p>Recibimos una solicitud para restablecer tu contraseña.</p>
  <a href="{{reset_link}}">Restablecer contraseña</a>
  <p>Este enlace expira en 1 hora.</p>
  <p>Si no solicitaste esto, ignora este email.</p>
</div>
```

**📊 Detalles:**
- **Prioridad:** 🔴 Alta
- **Esfuerzo:** 3 días
- **Dependencias:** Servicio de email configurado
- **Beneficio:** Mejora experiencia de usuario

---

### FALTANTE #3: Firma Digital para Documentos Médicos

**📋 Descripción:**
Los documentos médicos (recetas, certificados) no tienen firma digital, lo que reduce su validez legal.

**🎯 Funcionalidad Deseada:**
```typescript
// Sistema de firma digital
interface DigitalSignature {
  signDocument(documentId: string, userId: string): Promise<SignedDocument>;
  verifySignature(documentId: string): Promise<VerificationResult>;
  getCertificate(userId: string): Promise<Certificate>;
}

// Implementación
const signMedicalDocument = async (
  documentId: string,
  veterinarianId: string
) => {
  // 1. Obtener certificado del veterinario
  const certificate = await getCertificate(veterinarianId);
  
  // 2. Generar hash del documento
  const documentHash = await generateDocumentHash(documentId);
  
  // 3. Firmar con clave privada
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    certificate.privateKey,
    documentHash
  );
  
  // 4. Guardar firma
  await supabase.from('document_signatures').insert({
    document_id: documentId,
    signer_id: veterinarianId,
    signature: arrayBufferToBase64(signature),
    signed_at: new Date().toISOString(),
    certificate_thumbprint: certificate.thumbprint
  });
  
  // 5. Agregar marca visual en el documento
  const signedPDF = await addVisualSignature(documentId, {
    name: certificate.ownerName,
    date: new Date(),
    logo: certificate.logo
  });
  
  return signedPDF;
};

// Componente de firma
const DigitalSignaturePanel = ({ documentId }) => {
  const [signing, setSigning] = useState(false);
  const { user } = useAuth();
  
  const handleSign = async () => {
    setSigning(true);
    
    // Solicitar PIN o biométrico
    const authenticated = await requestBiometricAuth();
    
    if (authenticated) {
      await signDocument(documentId, user.id);
      toast.success('Documento firmado digitalmente');
    }
    
    setSigning(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Firma Digital</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Tu firma digital tiene validez legal equivalente a una firma manuscrita.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleSign} disabled={signing}>
            {signing ? 'Firmando...' : 'Firmar Documento'}
          </Button>
          
          <div className="text-sm text-gray-600">
            Firmante: Dr. {user.name}
            <br />
            Certificado: RENIEC-VET-{user.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

**📦 Librerías Necesarias:**
```bash
npm install node-forge pdf-lib
```

**📄 Documentos que requieren firma:**
- Recetas médicas
- Certificados de salud
- Resultados de laboratorio
- Historias clínicas
- Constancias de vacunación

**📊 Detalles:**
- **Prioridad:** 🟡 Media
- **Esfuerzo:** 5 días
- **Dependencias:** Certificados digitales
- **Beneficio:** Validez legal de documentos

---

### FALTANTE #4: Integración WhatsApp Business API

**📋 Descripción:**
Actualmente las notificaciones de WhatsApp son simuladas. Se necesita integración real.

**🎯 Funcionalidad Deseada:**
```typescript
// Cliente de WhatsApp Business API
import { Client } from 'whatsapp-web.js';

const whatsappClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

// Inicializar
whatsappClient.on('ready', () => {
  console.log('WhatsApp Business conectado');
});

// Enviar mensaje
const sendWhatsAppMessage = async (
  phone: string,
  message: string,
  templateId?: string
) => {
  try {
    // Formatear número
    const chatId = `51${phone.replace(/\D/g, '')}@c.us`;
    
    // Enviar mensaje
    if (templateId) {
      // Usar plantilla aprobada
      await whatsappClient.sendMessage(chatId, message, {
        templateName: templateId,
        templateLanguage: 'es'
      });
    } else {
      await whatsappClient.sendMessage(chatId, message);
    }
    
    // Registrar envío
    await supabase.from('whatsapp_messages').insert({
      phone,
      message,
      status: 'sent',
      sent_at: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return { success: false, error };
  }
};

// Plantillas pre-aprobadas
const WHATSAPP_TEMPLATES = {
  appointment_reminder: {
    id: 'appointment_reminder_24h',
    message: (data: any) => `
Hola ${data.clientName} 👋

Te recordamos tu cita para *${data.petName}*:
📅 ${data.date}
🕐 ${data.time}
📍 ${data.address}
🚐 Groomer: ${data.groomerName}

¿Todo en orden? Responde:
1️⃣ Confirmar
2️⃣ Cancelar
3️⃣ Reprogramar
    `.trim()
  },
  
  appointment_confirmed: {
    id: 'appointment_confirmed',
    message: (data: any) => `
✅ *Cita Confirmada*

Hola ${data.clientName},

Tu cita ha sido confirmada:
🐕 ${data.petName}
📅 ${data.date} a las ${data.time}
💰 Total: S/ ${data.total}

Te avisaremos cuando tu groomer esté en camino.
    `.trim()
  },
  
  groomer_on_the_way: {
    id: 'groomer_enroute',
    message: (data: any) => `
🚐 *Tu groomer está en camino*

${data.groomerName} llegará en aproximadamente *${data.eta} minutos*.

📍 Seguimiento en tiempo real:
${data.trackingLink}
    `.trim()
  }
};

// Hook para enviar notificaciones
const useWhatsAppNotifications = () => {
  const sendAppointmentReminder = async (appointment: Appointment) => {
    const client = await getClient(appointment.clientId);
    const template = WHATSAPP_TEMPLATES.appointment_reminder;
    
    await sendWhatsAppMessage(
      client.phone,
      template.message({
        clientName: client.firstName,
        petName: appointment.petName,
        date: formatDate(appointment.date),
        time: appointment.time,
        address: appointment.location.address,
        groomerName: appointment.groomerName
      }),
      template.id
    );
  };
  
  const sendGroomerEnRoute = async (appointment: Appointment) => {
    const client = await getClient(appointment.clientId);
    const eta = calculateETA(appointment.id);
    
    await sendWhatsAppMessage(
      client.phone,
      WHATSAPP_TEMPLATES.groomer_on_the_way.message({
        groomerName: appointment.groomerName,
        eta,
        trackingLink: `https://smartpet.com/track/${appointment.id}`
      }),
      WHATSAPP_TEMPLATES.groomer_on_the_way.id
    );
  };
  
  return {
    sendAppointmentReminder,
    sendGroomerEnRoute
  };
};
```

**📦 Componentes a Crear:**
```
/services/whatsappService.ts
/components/admin/WhatsAppConfig.tsx
/hooks/useWhatsAppNotifications.ts
```

**⚙️ Configuración:**
```typescript
// whatsapp.config.ts
export const WHATSAPP_CONFIG = {
  apiKey: process.env.WHATSAPP_API_KEY,
  phoneNumberId: process.env.WHATSAPP_PHONE_ID,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ID,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_TOKEN
};
```

**📊 Detalles:**
- **Prioridad:** 🔴 Alta
- **Esfuerzo:** 1 semana
- **Costo mensual:** ~$50-100 USD
- **Beneficio:** Comunicación directa con clientes

---

### FALTANTE #5: App Móvil para Groomers

**📋 Descripción:**
Los groomers necesitan una app móvil para gestionar sus citas en movimiento.

**🎯 Funcionalidad Deseada:**
```typescript
// React Native App
// screens/GroomerDashboard.tsx

interface GroomerAppointment {
  id: string;
  time: string;
  client: string;
  pet: string;
  address: string;
  services: string[];
  status: 'pending' | 'in-progress' | 'completed';
  navigation: {
    lat: number;
    lng: number;
    distance: number;
    duration: number;
  };
}

const GroomerDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState<GroomerAppointment[]>([]);
  const [currentAppointment, setCurrentAppointment] = useState<GroomerAppointment | null>(null);
  const { user } = useAuth();
  
  // Cargar citas del día
  useEffect(() => {
    const loadAppointments = async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('groomer_id', user.id)
        .eq('date', format(new Date(), 'yyyy-MM-dd'))
        .order('start_time', { ascending: true });
        
      setTodayAppointments(data || []);
    };
    
    loadAppointments();
  }, []);
  
  // Navegar a próxima cita
  const navigateToAppointment = (appointment: GroomerAppointment) => {
    // Abrir Google Maps / Waze
    const url = Platform.select({
      ios: `maps://app?daddr=${appointment.navigation.lat},${appointment.navigation.lng}`,
      android: `google.navigation:q=${appointment.navigation.lat},${appointment.navigation.lng}`
    });
    
    Linking.openURL(url);
  };
  
  // Iniciar servicio
  const startService = async (appointmentId: string) => {
    await supabase
      .from('appointments')
      .update({ 
        status: 'in-progress',
        started_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
      
    // Notificar al cliente
    await sendNotification(appointment.client_id, {
      title: 'Servicio iniciado',
      body: 'Tu groomer ha comenzado el servicio'
    });
  };
  
  // Completar servicio (con fotos antes/después)
  const completeService = async (appointmentId: string, photos: string[]) => {
    await supabase
      .from('appointments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        after_photos: photos
      })
      .eq('id', appointmentId);
      
    // Solicitar calificación al cliente
    await requestReview(appointmentId);
  };
  
  return (
    <ScrollView>
      {/* Resumen del día */}
      <Card>
        <CardContent>
          <Text>Citas de hoy: {todayAppointments.length}</Text>
          <Text>Completadas: {todayAppointments.filter(a => a.status === 'completed').length}</Text>
          <Text>Ingresos estimados: S/ {calculateTotalEarnings(todayAppointments)}</Text>
        </CardContent>
      </Card>
      
      {/* Lista de citas */}
      {todayAppointments.map(appointment => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onNavigate={() => navigateToAppointment(appointment)}
          onStart={() => startService(appointment.id)}
          onComplete={(photos) => completeService(appointment.id, photos)}
        />
      ))}
    </ScrollView>
  );
};

// Componente de tarjeta de cita
const AppointmentCard = ({ appointment, onNavigate, onStart, onComplete }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true
    });
    
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>{appointment.time}</Text>
          <StatusBadge status={appointment.status} />
        </View>
      </CardHeader>
      
      <CardContent>
        <Text>{appointment.client}</Text>
        <Text>{appointment.pet}</Text>
        <Text>{appointment.address}</Text>
        
        {appointment.status === 'pending' && (
          <View style={{ gap: 8, marginTop: 16 }}>
            <Button onPress={onNavigate}>
              <Navigation size={16} />
              <Text>Navegar ({appointment.navigation.distance} km)</Text>
            </Button>
            <Button onPress={onStart}>
              <Play size={16} />
              <Text>Iniciar Servicio</Text>
            </Button>
          </View>
        )}
        
        {appointment.status === 'in-progress' && (
          <View>
            <Button onPress={takePhoto}>
              <Camera size={16} />
              <Text>Tomar Foto ({photos.length}/4)</Text>
            </Button>
            
            {photos.length >= 2 && (
              <Button onPress={() => onComplete(photos)}>
                <CheckCircle size={16} />
                <Text>Completar Servicio</Text>
              </Button>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  );
};
```

**📱 Pantallas de la App:**
1. Login / Auth
2. Dashboard del día
3. Lista de citas
4. Detalle de cita
5. Navegación
6. Cámara (fotos antes/después)
7. Completar servicio
8. Historial
9. Estadísticas personales
10. Configuración

**📊 Detalles:**
- **Prioridad:** 🔴 Alta
- **Esfuerzo:** 2 meses
- **Tecnología:** React Native + Expo
- **Beneficio:** Productividad del groomer

---

### FALTANTE #6: Sistema de Turnos de Personal

**📋 Descripción:**
No hay gestión de turnos/horarios del personal (groomers, veterinarios, choferes).

**🎯 Funcionalidad Deseada:**
```typescript
// Gestión de turnos
interface Shift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'morning' | 'afternoon' | 'night' | 'full';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  break?: { start: string; end: string };
}

const ShiftManagement = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  
  // Plantilla semanal
  const createWeeklySchedule = async () => {
    const template = {
      monday: [
        { userId: 'USER-001', type: 'morning' },
        { userId: 'USER-002', type: 'afternoon' }
      ],
      tuesday: [
        { userId: 'USER-001', type: 'full' },
        { userId: 'USER-003', type: 'afternoon' }
      ],
      // ...
    };
    
    await applyTemplate(template, selectedWeek);
  };
  
  // Solicitar cambio de turno
  const requestShiftSwap = async (shiftId: string, targetUserId: string) => {
    await supabase.from('shift_swap_requests').insert({
      shift_id: shiftId,
      requester_id: getCurrentUserId(),
      target_id: targetUserId,
      status: 'pending'
    });
    
    // Notificar al colega
    sendNotification(targetUserId, {
      title: 'Solicitud de cambio de turno',
      message: 'Un compañero quiere intercambiar turno contigo'
    });
  };
  
  return (
    <div>
      <Calendar
        view="week"
        date={selectedWeek}
        events={shifts}
        onEventClick={handleShiftClick}
        onDrop={handleShiftDrag}
      />
      
      <ShiftLegend />
      <ShiftStats />
    </div>
  );
};
```

**📊 Detalles:**
- **Prioridad:** 🟡 Media
- **Esfuerzo:** 1 semana
- **Beneficio:** Mejor organización del personal

---

### FALTANTE #7: Gestión de Proveedores

**📋 Descripción:**
No hay módulo para gestionar proveedores de productos e insumos.

**🎯 Funcionalidad Deseada:**
```typescript
interface Supplier {
  id: string;
  name: string;
  ruc: string;
  email: string;
  phone: string;
  address: string;
  category: string[];
  paymentTerms: string;
  rating: number;
  productsSupplied: string[];
  totalPurchases: number;
  lastPurchaseDate: string;
}

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const createPurchaseOrder = async (supplierId: string, items: OrderItem[]) => {
    const order = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: supplierId,
        items,
        total: calculateTotal(items),
        status: 'pending',
        expected_delivery: addDays(new Date(), 7)
      })
      .select()
      .single();
      
    // Enviar orden por email
    await sendEmail({
      to: supplier.email,
      subject: 'Orden de Compra',
      template: 'purchase_order',
      data: { order }
    });
    
    return order;
  };
  
  return <SupplierTable suppliers={suppliers} />;
};
```

**📊 Detalles:**
- **Prioridad:** 🟡 Media
- **Esfuerzo:** 1 semana

---

### FALTANTE #8: Sistema de Lealtad Gamificado

**📋 Descripción:**
El programa de lealtad actual es básico. Falta gamificación (badges, logros, desafíos).

**🎯 Funcionalidad Deseada:**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsReward: number;
  requirements: {
    type: 'appointments' | 'spending' | 'referrals' | 'reviews';
    count: number;
  };
}

const ACHIEVEMENTS = [
  {
    id: 'first-appointment',
    name: 'Primera Cita',
    description: 'Completa tu primera cita',
    icon: '🎉',
    pointsReward: 100,
    requirements: { type: 'appointments', count: 1 }
  },
  {
    id: 'loyal-customer',
    name: 'Cliente Leal',
    description: 'Completa 10 citas',
    icon: '⭐',
    pointsReward: 500,
    requirements: { type: 'appointments', count: 10 }
  },
  {
    id: 'big-spender',
    name: 'Gran Gastador',
    description: 'Gasta más de S/ 1000',
    icon: '💎',
    pointsReward: 300,
    requirements: { type: 'spending', count: 1000 }
  },
  {
    id: 'referral-master',
    name: 'Maestro de Referidos',
    description: 'Refiere a 5 amigos',
    icon: '🤝',
    pointsReward: 1000,
    requirements: { type: 'referrals', count: 5 }
  }
];

const LoyaltyGamification = ({ clientId }) => {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState({});
  
  const checkAchievements = async () => {
    const client = await getClient(clientId);
    
    ACHIEVEMENTS.forEach(achievement => {
      const earned = hasEarnedAchievement(achievement, client);
      
      if (earned && !achievements.includes(achievement.id)) {
        unlockAchievement(clientId, achievement);
      }
    });
  };
  
  const unlockAchievement = async (clientId, achievement) => {
    // Guardar en BD
    await supabase.from('client_achievements').insert({
      client_id: clientId,
      achievement_id: achievement.id,
      unlocked_at: new Date().toISOString()
    });
    
    // Dar puntos
    await addLoyaltyPoints(clientId, achievement.pointsReward);
    
    // Notificar con animación
    toast.success(
      <div>
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <strong>¡Logro Desbloqueado!</strong>
          <p>{achievement.name}</p>
          <p>+{achievement.pointsReward} puntos</p>
        </div>
      </div>,
      { duration: 5000 }
    );
  };
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {ACHIEVEMENTS.map(achievement => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          unlocked={achievements.includes(achievement.id)}
          progress={progress[achievement.id]}
        />
      ))}
    </div>
  );
};
```

**🎮 Elementos de Gamificación:**
- Badges/Logros
- Niveles (Bronze → Silver → Gold → Platinum)
- Desafíos mensuales
- Tabla de líderes
- Recompensas especiales
- Racha de visitas (streak)

**📊 Detalles:**
- **Prioridad:** 🟢 Baja
- **Esfuerzo:** 2 semanas

---

### FALTANTE #9: Chat Interno para Staff

**📋 Descripción:**
No hay sistema de comunicación interna entre el personal.

**🎯 Funcionalidad Deseada:**
```typescript
// Chat en tiempo real con Supabase Realtime
const InternalChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channel, setChannel] = useState('general');
  
  useEffect(() => {
    // Cargar mensajes
    loadMessages(channel);
    
    // Suscribirse a nuevos mensajes
    const subscription = supabase
      .channel(`chat:${channel}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel=eq.${channel}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [channel]);
  
  const sendMessage = async (text: string) => {
    await supabase.from('chat_messages').insert({
      channel,
      user_id: currentUser.id,
      message: text,
      sent_at: new Date().toISOString()
    });
  };
  
  return <ChatInterface messages={messages} onSend={sendMessage} />;
};
```

**💬 Canales:**
- #general
- #groomers
- #admin
- #emergencias
- Mensajes directos

**📊 Detalles:**
- **Prioridad:** 🟡 Media
- **Esfuerzo:** 1 semana

---

### FALTANTE #10: Integración con Redes Sociales

**📋 Descripción:**
No hay publicación automática en redes sociales de logros, fotos antes/después, etc.

**🎯 Funcionalidad Deseada:**
```typescript
// Publicar automáticamente en redes
const shareToSocialMedia = async (content: SocialPost) => {
  // Facebook
  if (settings.autoShareFacebook) {
    await axios.post(`https://graph.facebook.com/v12.0/${pageId}/photos`, {
      url: content.imageUrl,
      caption: content.caption,
      access_token: facebookToken
    });
  }
  
  // Instagram
  if (settings.autoShareInstagram) {
    await axios.post(`https://graph.instagram.com/${igUserId}/media`, {
      image_url: content.imageUrl,
      caption: content.caption,
      access_token: instagramToken
    });
  }
};

// Auto-compartir después de servicio
const onServiceComplete = async (appointment) => {
  if (appointment.afterPhotos.length > 0) {
    const bestPhoto = selectBestPhoto(appointment.afterPhotos);
    
    await shareToSocialMedia({
      imageUrl: bestPhoto,
      caption: `¡Otro cliente feliz! 🐕✨ ${appointment.petName} luciendo hermoso después de su ${appointment.serviceName}. #SmartPet #GroomingMovil`
    });
  }
};
```

**📊 Detalles:**
- **Prioridad:** 🟢 Baja
- **Esfuerzo:** 1 semana

---

**[Continuará con los faltantes #11-#18 y las 23 mejoras en el próximo bloque...]**

---

## Resumen de Prioridades

### 🔴 CRÍTICAS (Hacer primero)
1. Sistema de Backups
2. Recuperación de Contraseña
3. App Móvil Groomers
4. WhatsApp Business API

### 🟡 ALTAS (Hacer pronto)
5. Firma Digital
6. Sistema de Turnos
7. Gestión de Proveedores
8. Chat Interno

### 🟢 MEDIAS/BAJAS (Hacer después)
9. Gamificación
10. Redes Sociales
11-18. Resto de funcionalidades

---

**¿Quieres que continúe con el resto de faltantes (#11-#18) y las 23 mejoras sugeridas?**
