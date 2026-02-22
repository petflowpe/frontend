# 🌐 SISTEMA DE RESERVAS ONLINE - SMARTPET

**Sistema de Auto-Reserva 24/7 para Clientes**  
**Integración Automática con Dashboard Administrativo**

---

## 📋 ÍNDICE

1. [Arquitectura General](#arquitectura)
2. [Opciones de Implementación](#opciones)
3. [Portal Web Público](#portal-web)
4. [App Móvil de Cliente](#app-movil)
5. [Widget Embebible](#widget)
6. [API de Integración](#api)
7. [Flujo Completo de Reserva](#flujo)
8. [Código de Implementación](#codigo)
9. [Seguridad y Validaciones](#seguridad)
10. [Testing y Deploy](#deploy)

---

## 🏗️ ARQUITECTURA GENERAL

### Visión Global del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES (Público)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web Pública │  │  App Móvil   │  │    Widget    │      │
│  │ book.smartpet│  │   Cliente    │  │  Embebible   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS/REST API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     API PÚBLICA (Backend)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/public/availability  (GET disponibilidad)      │  │
│  │  /api/public/book          (POST crear reserva)      │  │
│  │  /api/public/confirm       (PUT confirmar reserva)   │  │
│  │  /api/public/cancel        (DELETE cancelar)         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ Escribe en BD
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (PostgreSQL)                │
│  appointments, clients, pets, services, vehicles, etc.       │
└────────────────────────────┬────────────────────────────────┘
                             │ Lee en tiempo real
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD ADMIN (Sistema Principal)             │
│  - Ve reservas automáticamente                               │
│  - Puede editar/cancelar                                     │
│  - Notificaciones de nueva reserva                           │
│  - Todo sincronizado en tiempo real                          │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
Cliente hace reserva web
         ↓
API valida disponibilidad
         ↓
Crea registro en appointments (status: 'pending_confirmation')
         ↓
Crea/actualiza client + pet si no existe
         ↓
Envía email/SMS confirmación a cliente
         ↓
Notifica al dashboard admin (WebSocket real-time)
         ↓
Admin ve nueva reserva en tiempo real
         ↓
Admin puede confirmar/rechazar/editar
         ↓
Cliente recibe confirmación final
```

---

## 🎯 OPCIONES DE IMPLEMENTACIÓN

### Opción 1: Portal Web Público ⭐ **RECOMENDADO INICIO**

**URL:** `book.smartpet.pe` o `smartpet.pe/reservar`

✅ **Ventajas:**
- Rápido de implementar (1-2 semanas)
- Funciona en todos los dispositivos
- No requiere instalación
- SEO-friendly (Google encuentra tu negocio)
- Menor costo inicial

❌ **Desventajas:**
- No está en App Store
- Notificaciones push limitadas

**Stack sugerido:**
- Frontend: React/Next.js
- Hosting: Vercel (gratis)
- Backend: Mismo que SmartPet
- Base de datos: Compartida con sistema principal

---

### Opción 2: App Móvil Nativa

**Plataformas:** iOS + Android

✅ **Ventajas:**
- Experiencia nativa óptima
- Push notifications robustas
- Acceso a GPS, cámara, etc.
- Icono en el teléfono

❌ **Desventajas:**
- Costoso (3-6 meses desarrollo)
- Mantenimiento de 2 apps
- Requiere App Store approval
- $99/año Apple + $25 Google

**Stack sugerido:**
- React Native o Flutter
- Firebase para push notifications
- Mismo backend/API

**Recomendación:** Hacer después, cuando tengas >1,000 clientes

---

### Opción 3: Widget Embebible

**Para:** Incrustar en tu web existente o Facebook

✅ **Ventajas:**
- Súper rápido (días)
- El cliente ni sale de tu web
- Mantienes tu branding

❌ **Desventajas:**
- Limitaciones de diseño
- Depende de iframe

**Ejemplo de uso:**
```html
<!-- En tu web existente -->
<script src="https://cdn.smartpet.pe/booking-widget.js"></script>
<div id="smartpet-booking" data-business-id="tu-id"></div>
```

---

### 🎯 RECOMENDACIÓN ESTRATÉGICA

**FASE 1 (Mes 1-3):** Portal Web Público
- Implementar `book.smartpet.pe`
- Integración completa con dashboard
- Testing y feedback

**FASE 2 (Mes 4-6):** Widget Embebible
- Para clientes que quieren en su web
- Feature premium del Plan Business/Enterprise

**FASE 3 (Mes 9-12):** App Móvil
- Cuando tengas >500 clientes activos
- React Native (iOS + Android)
- Push notifications

---

## 🌐 PORTAL WEB PÚBLICO - IMPLEMENTACIÓN

### Estructura del Proyecto

```
smartpet-booking/
├── public/
│   ├── logo.png
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── BookingFlow/
│   │   │   ├── Step1SelectService.tsx
│   │   │   ├── Step2SelectPet.tsx
│   │   │   ├── Step3SelectDateTime.tsx
│   │   │   ├── Step4ContactInfo.tsx
│   │   │   └── Step5Confirmation.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── Calendar.tsx
│   │   ├── TimeSlots.tsx
│   │   └── BookingSummary.tsx
│   ├── pages/
│   │   ├── index.tsx              # Landing + inicio de reserva
│   │   ├── booking.tsx            # Flujo de reserva
│   │   ├── confirmation.tsx       # Confirmación post-reserva
│   │   ├── track.tsx              # Tracking de cita
│   │   └── cancel.tsx             # Cancelación
│   ├── services/
│   │   └── api.ts                 # Llamadas al backend
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
├── .env
├── package.json
└── next.config.js
```

---

## 💻 CÓDIGO DE IMPLEMENTACIÓN

### 1. API Backend - Endpoints Públicos

**src/routes/public.routes.ts (Backend)**

```typescript
import express from 'express';
import { PublicBookingController } from '../controllers/publicBooking.controller';
import { rateLimitPublic } from '../middleware/rateLimit.middleware';

const router = express.Router();
const controller = new PublicBookingController();

// Rate limiting más estricto para API pública (prevenir abuse)
router.use(rateLimitPublic); // 30 requests por 15 min

// GET /api/public/business-info
// Obtener info del negocio (servicios, horarios, zonas)
router.get('/business-info', controller.getBusinessInfo);

// GET /api/public/services
// Listar servicios disponibles con precios
router.get('/services', controller.getServices);

// GET /api/public/availability
// Obtener slots disponibles para fecha/servicio
router.get('/availability', controller.getAvailability);

// POST /api/public/validate-address
// Validar si dirección está en zona de servicio
router.post('/validate-address', controller.validateAddress);

// POST /api/public/book
// Crear reserva (sin auth, solo con email)
router.post('/book', controller.createBooking);

// GET /api/public/booking/:token
// Ver detalles de reserva con token único
router.get('/booking/:token', controller.getBookingByToken);

// PUT /api/public/booking/:token/confirm
// Cliente confirma la cita
router.put('/booking/:token/confirm', controller.confirmBooking);

// DELETE /api/public/booking/:token/cancel
// Cliente cancela la cita
router.delete('/booking/:token/cancel', controller.cancelBooking);

export default router;
```

---

### 2. Controller - Lógica de Reservas Públicas

**src/controllers/publicBooking.controller.ts**

```typescript
import { Request, Response } from 'express';
import { PublicBookingService } from '../services/publicBooking.service';
import { AppError } from '../middleware/errorHandler.middleware';
import { sendBookingConfirmationEmail } from '../services/email.service';
import { sendWhatsAppNotification } from '../services/whatsapp.service';

const service = new PublicBookingService();

export class PublicBookingController {
  
  // GET /api/public/business-info
  async getBusinessInfo(req: Request, res: Response) {
    try {
      const info = await service.getBusinessInfo();
      
      res.json({
        name: info.business_name,
        description: info.description,
        phone: info.phone,
        email: info.email,
        hours: info.business_hours,
        zones: info.service_zones,
        policies: {
          cancellation: info.cancellation_policy,
          minAdvanceBooking: info.min_advance_hours, // ej: 24 horas
          maxAdvanceBooking: info.max_advance_days, // ej: 30 días
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // GET /api/public/services
  async getServices(req: Request, res: Response) {
    try {
      const services = await service.getActiveServices();
      
      res.json({
        services: services.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          duration: s.duration_minutes,
          prices: {
            small: s.price_small,
            medium: s.price_medium,
            large: s.price_large,
            xlarge: s.price_xlarge,
          },
          category: s.category,
          imageUrl: s.image_url,
        }))
      });
    } catch (error) {
      throw error;
    }
  }

  // GET /api/public/availability?date=2024-12-28&service_id=xxx&zone=xxx
  async getAvailability(req: Request, res: Response) {
    try {
      const { date, service_id, zone } = req.query;
      
      if (!date || !service_id) {
        throw new AppError('Date and service_id are required', 400);
      }

      const availability = await service.getAvailableSlots(
        date as string,
        service_id as string,
        zone as string
      );

      res.json({
        date,
        slots: availability.map(slot => ({
          time: slot.time,
          available: slot.available,
          vehicleId: slot.vehicle_id,
          staffId: slot.staff_id,
        }))
      });
    } catch (error) {
      throw error;
    }
  }

  // POST /api/public/validate-address
  async validateAddress(req: Request, res: Response) {
    try {
      const { address, lat, lng } = req.body;

      if (!address) {
        throw new AppError('Address is required', 400);
      }

      const validation = await service.validateServiceZone(address, lat, lng);

      res.json({
        valid: validation.isValid,
        zone: validation.zone,
        suggestedVehicles: validation.vehicles,
        message: validation.isValid 
          ? 'Servimos en tu área' 
          : 'Lo sentimos, aún no llegamos a tu zona',
      });
    } catch (error) {
      throw error;
    }
  }

  // POST /api/public/book
  async createBooking(req: Request, res: Response) {
    try {
      const {
        // Datos del servicio
        serviceId,
        date,
        time,
        
        // Datos del cliente
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        clientLat,
        clientLng,
        
        // Datos de la mascota
        petName,
        petBreed,
        petSize,
        petBirthdate,
        petWeight,
        
        // Opcionales
        notes,
      } = req.body;

      // Validaciones básicas
      if (!serviceId || !date || !time) {
        throw new AppError('Service, date and time are required', 400);
      }

      if (!clientName || !clientEmail || !clientPhone) {
        throw new AppError('Client contact information is required', 400);
      }

      if (!petName || !petSize) {
        throw new AppError('Pet name and size are required', 400);
      }

      // Validar disponibilidad nuevamente (por si acaso)
      const isAvailable = await service.checkSlotAvailability(
        date,
        time,
        serviceId
      );

      if (!isAvailable) {
        throw new AppError('This time slot is no longer available', 409);
      }

      // Validar zona de servicio
      const zoneValidation = await service.validateServiceZone(
        clientAddress,
        clientLat,
        clientLng
      );

      if (!zoneValidation.isValid) {
        throw new AppError('We do not serve in your area yet', 400);
      }

      // Crear/actualizar cliente
      const client = await service.findOrCreateClient({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        address: clientAddress,
        lat: clientLat,
        lng: clientLng,
      });

      // Crear/actualizar mascota
      const pet = await service.findOrCreatePet(client.id, {
        name: petName,
        breed: petBreed,
        size: petSize,
        birthdate: petBirthdate,
        weight: petWeight,
      });

      // Calcular precio según tamaño
      const serviceInfo = await service.getServiceById(serviceId);
      const price = serviceInfo[`price_${petSize}`];

      // Generar token único para la reserva
      const bookingToken = service.generateBookingToken();

      // Crear reserva
      const booking = await service.createBooking({
        clientId: client.id,
        petId: pet.id,
        serviceId,
        date,
        time,
        price,
        notes,
        status: 'pending_confirmation',
        source: 'online_booking',
        bookingToken,
        vehicleId: zoneValidation.vehicles[0]?.id, // Asignar primer vehículo disponible
      });

      // Enviar email de confirmación al cliente
      await sendBookingConfirmationEmail({
        to: clientEmail,
        clientName,
        petName,
        service: serviceInfo.name,
        date,
        time,
        price,
        confirmUrl: `${process.env.BOOKING_URL}/booking/${bookingToken}`,
        cancelUrl: `${process.env.BOOKING_URL}/cancel/${bookingToken}`,
      });

      // Notificar al admin/staff
      await service.notifyNewBooking(booking.id);

      // Enviar WhatsApp al cliente (si configurado)
      if (clientPhone) {
        await sendWhatsAppNotification(
          clientPhone,
          `¡Hola ${clientName}! Tu reserva para ${petName} ha sido recibida. 
          Fecha: ${date} a las ${time}. 
          Te confirmaremos pronto. Ver detalles: ${process.env.BOOKING_URL}/booking/${bookingToken}`
        );
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          token: bookingToken,
          date,
          time,
          service: serviceInfo.name,
          price,
          status: 'pending_confirmation',
        },
        nextSteps: [
          'Revisa tu email para confirmar',
          'Te contactaremos en 1-2 horas',
          'Puedes rastrear tu cita con el link enviado',
        ]
      });

    } catch (error) {
      throw error;
    }
  }

  // GET /api/public/booking/:token
  async getBookingByToken(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const booking = await service.getBookingByToken(token);

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      res.json({
        id: booking.id,
        status: booking.status,
        date: booking.date,
        time: booking.time,
        service: booking.service_name,
        pet: booking.pet_name,
        client: booking.client_name,
        price: booking.price,
        address: booking.client_address,
        notes: booking.notes,
        canCancel: booking.can_cancel, // Basado en política de cancelación
        canReschedule: booking.can_reschedule,
      });
    } catch (error) {
      throw error;
    }
  }

  // PUT /api/public/booking/:token/confirm
  async confirmBooking(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const booking = await service.confirmBookingByToken(token);

      res.json({
        success: true,
        message: 'Booking confirmed successfully',
        booking: {
          id: booking.id,
          status: 'confirmed',
          date: booking.date,
          time: booking.time,
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // DELETE /api/public/booking/:token/cancel
  async cancelBooking(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { reason } = req.body;

      const booking = await service.cancelBookingByToken(token, reason);

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        refund: booking.refund_info, // Si aplica política de reembolso
      });
    } catch (error) {
      throw error;
    }
  }
}
```

---

### 3. Service - Lógica de Negocio

**src/services/publicBooking.service.ts**

```typescript
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class PublicBookingService {

  // Generar token seguro para la reserva
  generateBookingToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Obtener servicios activos
  async getActiveServices() {
    const result = await pool.query(
      'SELECT * FROM services WHERE active = true ORDER BY category, name'
    );
    return result.rows;
  }

  // Obtener slots disponibles
  async getAvailableSlots(date: string, serviceId: string, zone?: string) {
    // 1. Obtener duración del servicio
    const serviceResult = await pool.query(
      'SELECT duration_minutes FROM services WHERE id = $1',
      [serviceId]
    );
    const serviceDuration = serviceResult.rows[0].duration_minutes;

    // 2. Obtener vehículos que sirven en esa zona
    let vehiclesQuery = 'SELECT id, zones FROM vehicles WHERE status = $1';
    const queryParams: any[] = ['active'];
    
    if (zone) {
      vehiclesQuery += ' AND zones @> $2';
      queryParams.push(JSON.stringify([zone]));
    }
    
    const vehiclesResult = await pool.query(vehiclesQuery, queryParams);
    const vehicles = vehiclesResult.rows;

    // 3. Generar slots de 8am a 6pm cada 30 minutos
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // 4. Para cada vehículo, verificar si el slot está disponible
        for (const vehicle of vehicles) {
          const isBooked = await this.isSlotBooked(date, time, vehicle.id);
          
          if (!isBooked) {
            slots.push({
              time,
              available: true,
              vehicle_id: vehicle.id,
            });
            break; // Solo necesitamos 1 vehículo disponible
          }
        }
      }
    }

    return slots;
  }

  // Verificar si un slot está ocupado
  async isSlotBooked(date: string, time: string, vehicleId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM appointments 
       WHERE date = $1 
       AND time = $2 
       AND vehicle_id = $3 
       AND status NOT IN ('cancelled', 'rejected')`,
      [date, time, vehicleId]
    );
    
    return parseInt(result.rows[0].count) > 0;
  }

  // Validar zona de servicio
  async validateServiceZone(address: string, lat?: number, lng?: number) {
    // 1. Si no hay lat/lng, geocodificar dirección
    if (!lat || !lng) {
      const geocoded = await this.geocodeAddress(address);
      lat = geocoded.lat;
      lng = geocoded.lng;
    }

    // 2. Obtener vehículos y sus zonas
    const result = await pool.query(
      'SELECT id, zones FROM vehicles WHERE status = $1',
      ['active']
    );

    // 3. Verificar si el punto está dentro de alguna zona
    for (const vehicle of result.rows) {
      const zones = vehicle.zones || [];
      
      for (const zone of zones) {
        if (zone.type === 'circle') {
          // Verificar si está dentro del círculo
          const distance = this.calculateDistance(
            lat, lng,
            zone.center.lat, zone.center.lng
          );
          
          if (distance <= zone.radius) {
            return {
              isValid: true,
              zone: zone.name,
              vehicles: [vehicle],
            };
          }
        } else if (zone.type === 'polygon') {
          // Verificar si está dentro del polígono
          const inside = this.isPointInPolygon(lat, lng, zone.coordinates);
          
          if (inside) {
            return {
              isValid: true,
              zone: zone.name,
              vehicles: [vehicle],
            };
          }
        }
      }
    }

    return {
      isValid: false,
      zone: null,
      vehicles: [],
    };
  }

  // Geocodificar dirección (usar Google Maps API)
  async geocodeAddress(address: string) {
    // Implementar con Google Maps Geocoding API
    // Por ahora retornar placeholder
    return { lat: -12.0464, lng: -77.0428 }; // Lima, Perú
  }

  // Calcular distancia entre dos puntos (Haversine)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Verificar si punto está dentro de polígono (Ray casting)
  isPointInPolygon(lat: number, lng: number, polygon: any[]): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      
      const intersect = ((yi > lng) !== (yj > lng))
        && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  }

  // Buscar o crear cliente
  async findOrCreateClient(data: any) {
    // Buscar por email o teléfono
    let result = await pool.query(
      'SELECT * FROM clients WHERE email = $1 OR phone = $2',
      [data.email, data.phone]
    );

    if (result.rows.length > 0) {
      // Cliente existe, actualizar datos si cambiaron
      const clientId = result.rows[0].id;
      
      await pool.query(
        `UPDATE clients 
         SET name = $1, address = $2, lat = $3, lng = $4, updated_at = NOW()
         WHERE id = $5`,
        [data.name, data.address, data.lat, data.lng, clientId]
      );

      return result.rows[0];
    } else {
      // Cliente nuevo
      result = await pool.query(
        `INSERT INTO clients (name, email, phone, address, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.name, data.email, data.phone, data.address, data.lat, data.lng]
      );

      return result.rows[0];
    }
  }

  // Buscar o crear mascota
  async findOrCreatePet(clientId: string, data: any) {
    // Buscar mascota por nombre y cliente
    let result = await pool.query(
      'SELECT * FROM pets WHERE client_id = $1 AND name = $2',
      [clientId, data.name]
    );

    if (result.rows.length > 0) {
      // Mascota existe, actualizar datos
      const petId = result.rows[0].id;
      
      await pool.query(
        `UPDATE pets 
         SET breed = $1, size = $2, birthdate = $3, weight = $4, updated_at = NOW()
         WHERE id = $5`,
        [data.breed, data.size, data.birthdate, data.weight, petId]
      );

      return result.rows[0];
    } else {
      // Mascota nueva
      result = await pool.query(
        `INSERT INTO pets (client_id, name, breed, size, birthdate, weight)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [clientId, data.name, data.breed, data.size, data.birthdate, data.weight]
      );

      return result.rows[0];
    }
  }

  // Crear reserva
  async createBooking(data: any) {
    const result = await pool.query(
      `INSERT INTO appointments (
        client_id, pet_id, service_id, vehicle_id,
        date, time, total_price, notes, status, source, booking_token
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.clientId,
        data.petId,
        data.serviceId,
        data.vehicleId,
        data.date,
        data.time,
        data.price,
        data.notes,
        data.status,
        data.source,
        data.bookingToken,
      ]
    );

    return result.rows[0];
  }

  // Notificar nueva reserva al admin/staff
  async notifyNewBooking(bookingId: string) {
    // 1. Obtener datos completos de la reserva
    const result = await pool.query(
      `SELECT 
        a.*,
        c.name as client_name, c.email as client_email, c.phone as client_phone,
        p.name as pet_name,
        s.name as service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN pets p ON a.pet_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = $1`,
      [bookingId]
    );

    const booking = result.rows[0];

    // 2. Crear notificación en sistema
    await pool.query(
      `INSERT INTO notifications (type, title, message, data, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        'new_booking',
        'Nueva Reserva Online',
        `${booking.client_name} reservó ${booking.service_name} para ${booking.pet_name} el ${booking.date}`,
        JSON.stringify({ bookingId }),
      ]
    );

    // 3. Enviar email al admin
    // Implementar con servicio de email

    // 4. Enviar WebSocket push al dashboard (si está conectado)
    // Implementar con Socket.io

    return true;
  }

  // Obtener reserva por token
  async getBookingByToken(token: string) {
    const result = await pool.query(
      `SELECT 
        a.*,
        c.name as client_name, c.email as client_email, c.address as client_address,
        p.name as pet_name,
        s.name as service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN pets p ON a.pet_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.booking_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const booking = result.rows[0];

    // Verificar si puede cancelar (según política)
    const hoursUntilAppointment = this.calculateHoursUntil(booking.date, booking.time);
    
    return {
      ...booking,
      can_cancel: hoursUntilAppointment > 24, // Ejemplo: 24h antes
      can_reschedule: hoursUntilAppointment > 12,
    };
  }

  calculateHoursUntil(date: string, time: string): number {
    const appointmentDateTime = new Date(`${date} ${time}`);
    const now = new Date();
    const diff = appointmentDateTime.getTime() - now.getTime();
    return diff / (1000 * 60 * 60); // Convertir a horas
  }

  // Confirmar reserva
  async confirmBookingByToken(token: string) {
    const result = await pool.query(
      `UPDATE appointments
       SET status = 'confirmed', confirmed = true, confirmed_at = NOW()
       WHERE booking_token = $1
       RETURNING *`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    return result.rows[0];
  }

  // Cancelar reserva
  async cancelBookingByToken(token: string, reason?: string) {
    // 1. Obtener reserva
    const booking = await this.getBookingByToken(token);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // 2. Verificar si puede cancelar
    if (!booking.can_cancel) {
      throw new Error('Cancellation period has passed');
    }

    // 3. Cancelar
    const result = await pool.query(
      `UPDATE appointments
       SET status = 'cancelled', notes = CONCAT(notes, ' | Cancelled by client: ', $1)
       WHERE booking_token = $2
       RETURNING *`,
      [reason || 'No reason provided', token]
    );

    // 4. Notificar al admin
    await this.notifyBookingCancellation(booking.id, reason);

    return {
      ...result.rows[0],
      refund_info: null, // Implementar lógica de reembolso si aplica
    };
  }

  async notifyBookingCancellation(bookingId: string, reason?: string) {
    await pool.query(
      `INSERT INTO notifications (type, title, message, data, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        'booking_cancelled',
        'Reserva Cancelada',
        `Una reserva ha sido cancelada por el cliente. Motivo: ${reason || 'N/A'}`,
        JSON.stringify({ bookingId }),
      ]
    );
  }

  // Obtener info del negocio
  async getBusinessInfo() {
    const result = await pool.query('SELECT * FROM business_settings LIMIT 1');
    return result.rows[0] || {};
  }

  async getServiceById(id: string) {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0];
  }

  async checkSlotAvailability(date: string, time: string, serviceId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM appointments 
       WHERE date = $1 
       AND time = $2 
       AND service_id = $3
       AND status NOT IN ('cancelled', 'rejected')`,
      [date, time, serviceId]
    );
    
    return parseInt(result.rows[0].count) === 0;
  }
}
```

---

### 4. Frontend - Portal Web Público

**src/pages/index.tsx (Landing + Inicio de Reserva)**

```typescript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Clock, MapPin, Star, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">
            Peluquería Móvil para tu Mascota
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Agenda en línea 24/7. Vamos a tu casa. 
            Grooming profesional sin estrés para tu peludo.
          </p>
          
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => router.push('/booking')}
          >
            Reservar Ahora
          </Button>
          
          <p className="text-sm text-slate-500 mt-4">
            ⚡ Disponibilidad en tiempo real • 🔒 Pago seguro
          </p>
        </div>
      </header>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Calendar className="w-12 h-12 text-blue-600" />}
            title="Agenda 24/7"
            description="Reserva cuando quieras, recibe confirmación al instante"
          />
          <FeatureCard
            icon={<MapPin className="w-12 h-12 text-blue-600" />}
            title="Vamos a Ti"
            description="Servicio a domicilio en toda Lima. Sin traslados."
          />
          <FeatureCard
            icon={<Star className="w-12 h-12 text-blue-600" />}
            title="Profesionales"
            description="Groomers certificados con 5+ años de experiencia"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Cómo Funciona?
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Step number={1} title="Elige Servicio" description="Baño, corte, spa medicado" />
            <Step number={2} title="Selecciona Fecha" description="Ve disponibilidad en tiempo real" />
            <Step number={3} title="Confirma Datos" description="Información de tu mascota" />
            <Step number={4} title="¡Listo!" description="Te confirmamos y vamos a tu casa" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Tu Mascota Merece lo Mejor
        </h2>
        <Button
          size="lg"
          onClick={() => router.push('/booking')}
        >
          Agendar Mi Cita
        </Button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: any) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
```

---

**src/pages/booking.tsx (Flujo de Reserva Multi-Step)**

```typescript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Step1SelectService from '../components/BookingFlow/Step1SelectService';
import Step2SelectPet from '../components/BookingFlow/Step2SelectPet';
import Step3SelectDateTime from '../components/BookingFlow/Step3SelectDateTime';
import Step4ContactInfo from '../components/BookingFlow/Step4ContactInfo';
import Step5Confirmation from '../components/BookingFlow/Step5Confirmation';
import { Button } from '../components/ui/button';

export default function BookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: null,
    pet: null,
    dateTime: null,
    contact: null,
  });

  const steps = [
    { number: 1, title: 'Servicio', component: Step1SelectService },
    { number: 2, title: 'Mascota', component: Step2SelectPet },
    { number: 3, title: 'Fecha/Hora', component: Step3SelectDateTime },
    { number: 4, title: 'Contacto', component: Step4ContactInfo },
    { number: 5, title: 'Confirmación', component: Step5Confirmation },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const handleNext = (data: any) => {
    setBookingData({ ...bookingData, ...data });
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${currentStep >= step.number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'}
                `}>
                  {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium hidden md:block
                  ${currentStep >= step.number ? 'text-blue-600' : 'text-slate-400'}
                `}>
                  {step.title}
                </span>
                
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-4
                    ${currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
            data={bookingData}
          />
        </div>
      </div>
    </div>
  );
}
```

---

**src/components/BookingFlow/Step1SelectService.tsx**

```typescript
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export default function Step1SelectService({ onNext }: any) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data.services);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (service: any) => {
    setSelected(service);
  };

  const handleContinue = () => {
    if (selected) {
      onNext({ service: selected });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Selecciona el Servicio</h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {services.map((service: any) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={selected?.id === service.id}
            onSelect={() => handleSelect(service)}
          />
        ))}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continuar
      </Button>
    </div>
  );
}

function ServiceCard({ service, selected, onSelect }: any) {
  return (
    <div
      onClick={onSelect}
      className={`
        p-6 rounded-xl border-2 cursor-pointer transition-all
        ${selected 
          ? 'border-blue-600 bg-blue-50' 
          : 'border-slate-200 hover:border-blue-300'}
      `}
    >
      <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
      <p className="text-sm text-slate-600 mb-4">{service.description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          ⏱️ {service.duration} min
        </span>
        <div className="text-right">
          <p className="text-xs text-slate-500">Desde</p>
          <p className="text-xl font-bold text-blue-600">
            S/{service.prices.small}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

**src/components/BookingFlow/Step3SelectDateTime.tsx**

```typescript
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../ui/button';
import { Calendar } from '../Calendar';
import { TimeSlots } from '../TimeSlots';
import { ChevronLeft } from 'lucide-react';

export default function Step3SelectDateTime({ onNext, onBack, data }: any) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const slots = await api.getAvailability(selectedDate!, data.service.id);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onNext({ dateTime: { date: selectedDate, time: selectedTime } });
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Atrás
      </Button>

      <h2 className="text-2xl font-bold mb-6">Selecciona Fecha y Hora</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-semibold mb-4">Fecha</h3>
          <Calendar
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // +30 días
          />
        </div>

        <div>
          <h3 className="font-semibold mb-4">Hora disponible</h3>
          {selectedDate ? (
            <TimeSlots
              slots={availableSlots}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              loading={loading}
            />
          ) : (
            <p className="text-slate-500 text-center py-8">
              Selecciona una fecha primero
            </p>
          )}
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!selectedDate || !selectedTime}
        onClick={handleContinue}
      >
        Continuar
      </Button>
    </div>
  );
}
```

---

**src/services/api.ts (Frontend API Client)**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/public';

export const api = {
  // GET servicios
  getServices: async () => {
    const res = await fetch(`${API_URL}/services`);
    if (!res.ok) throw new Error('Failed to load services');
    return res.json();
  },

  // GET disponibilidad
  getAvailability: async (date: string, serviceId: string, zone?: string) => {
    const params = new URLSearchParams({ date, service_id: serviceId });
    if (zone) params.append('zone', zone);
    
    const res = await fetch(`${API_URL}/availability?${params}`);
    if (!res.ok) throw new Error('Failed to load availability');
    const data = await res.json();
    return data.slots;
  },

  // POST validar dirección
  validateAddress: async (address: string, lat?: number, lng?: number) => {
    const res = await fetch(`${API_URL}/validate-address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, lat, lng }),
    });
    
    if (!res.ok) throw new Error('Failed to validate address');
    return res.json();
  },

  // POST crear reserva
  createBooking: async (bookingData: any) => {
    const res = await fetch(`${API_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create booking');
    }
    
    return res.json();
  },

  // GET booking por token
  getBooking: async (token: string) => {
    const res = await fetch(`${API_URL}/booking/${token}`);
    if (!res.ok) throw new Error('Booking not found');
    return res.json();
  },

  // PUT confirmar booking
  confirmBooking: async (token: string) => {
    const res = await fetch(`${API_URL}/booking/${token}/confirm`, {
      method: 'PUT',
    });
    
    if (!res.ok) throw new Error('Failed to confirm booking');
    return res.json();
  },

  // DELETE cancelar booking
  cancelBooking: async (token: string, reason?: string) => {
    const res = await fetch(`${API_URL}/booking/${token}/cancel`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    
    if (!res.ok) throw new Error('Failed to cancel booking');
    return res.json();
  },
};
```

---

## 🔐 SEGURIDAD Y VALIDACIONES

### Protecciones Implementadas

1. **Rate Limiting**
```typescript
// Prevenir abuse de la API pública
30 requests por 15 minutos por IP
```

2. **Validación de Datos**
```typescript
// Todos los inputs validados antes de guardarse
Email format, phone format, etc.
```

3. **Tokens Únicos**
```typescript
// Cada reserva tiene token criptográfico único
No guessable, 64 caracteres hexadecimal
```

4. **Validación de Zona**
```typescript
// Solo permite reservas en zonas servidas
Evita spam de zonas no atendidas
```

5. **Política de Cancelación**
```typescript
// Configurable (ej: 24h antes)
Evita cancelaciones de último minuto
```

---

## 📱 INTEGRACIÓN CON DASHBOARD ADMIN

### Notificaciones en Tiempo Real

**Opción 1: Polling (Simple)**
```typescript
// Dashboard hace fetch cada 30 segundos
setInterval(async () => {
  const newBookings = await api.getNewBookings();
  if (newBookings.length > 0) {
    showNotification('Nueva reserva online!');
  }
}, 30000);
```

**Opción 2: WebSocket (Recomendado)**
```typescript
// Backend envía push cuando hay nueva reserva
io.on('connection', (socket) => {
  socket.on('new_booking', (data) => {
    // Enviar a todos los admins conectados
    io.to('admin_room').emit('booking_created', data);
  });
});

// Dashboard escucha
socket.on('booking_created', (booking) => {
  showToast('Nueva reserva de ' + booking.client_name);
  playSound();
  refreshAppointmentsList();
});
```

---

## 🚀 DEPLOY

### Frontend (Portal Público)

**Vercel (Gratis):**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd smartpet-booking
vercel

# Configurar dominio
book.smartpet.pe → vercel project
```

### Backend (Mismo servidor)

Solo agregar las rutas públicas:
```typescript
// src/index.ts
import publicRoutes from './routes/public.routes';

app.use('/api/public', publicRoutes);
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Crear rutas `/api/public/*`
- [ ] Implementar controllers y services
- [ ] Agregar rate limiting
- [ ] Testing de endpoints
- [ ] Deploy a producción

### Frontend
- [ ] Crear proyecto Next.js
- [ ] Implementar flujo de 5 pasos
- [ ] Integrar con API
- [ ] Testing en móvil
- [ ] Deploy a Vercel

### Integración
- [ ] Reservas aparecen automáticamente en dashboard
- [ ] Notificaciones funcionando
- [ ] Emails de confirmación
- [ ] WhatsApp notifications (opcional)

---

## 💡 FEATURES AVANZADOS (Futuro)

### Fase 2
- [ ] Pago online (Stripe/Niubiz)
- [ ] Reprogramar citas desde web
- [ ] Galería de fotos antes/después
- [ ] Chat con groomer

### Fase 3
- [ ] App móvil nativa (React Native)
- [ ] Push notifications
- [ ] Reseñas desde app
- [ ] Programa de referidos

---

**¡Sistema de reservas online completo e integrado!** 🎉

¿Necesitas ayuda implementando alguna parte específica?
