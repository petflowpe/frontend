import { parse, addMinutes, isWithinInterval } from 'date-fns';
import {
  getAppointmentDateOnly,
  formatAppointmentTimeForDisplay,
} from '../components/calendar/calendarDateUtils';

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  resourceId?: string; // vehicle ID
  appointmentId?: string; // to exclude self when editing
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingAppointments: any[];
  message?: string;
}

/**
 * Verifica si dos citas se traslapan en tiempo
 */
export function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Si tienen diferentes fechas, no hay conflicto
  if (slot1.date !== slot2.date) return false;

  // Si están asignados a diferentes recursos (vehículos), no hay conflicto
  if (slot1.resourceId && slot2.resourceId && slot1.resourceId !== slot2.resourceId) {
    return false;
  }

  // Parsear las horas
  const start1 = parse(`${slot1.date} ${slot1.time}`, 'yyyy-MM-dd HH:mm', new Date());
  const end1 = addMinutes(start1, slot1.duration);

  const start2 = parse(`${slot2.date} ${slot2.time}`, 'yyyy-MM-dd HH:mm', new Date());
  const end2 = addMinutes(start2, slot2.duration);

  // Verificar si hay traslape
  // slot1 empieza durante slot2, o slot2 empieza durante slot1
  const overlaps = (
    isWithinInterval(start1, { start: start2, end: end2 }) ||
    isWithinInterval(start2, { start: start1, end: end1 }) ||
    (start1.getTime() <= start2.getTime() && end1.getTime() >= end2.getTime()) ||
    (start2.getTime() <= start1.getTime() && end2.getTime() >= end1.getTime())
  );

  return overlaps;
}

/**
 * Valida si una nueva cita tiene conflictos con citas existentes
 */
export function validateAppointmentConflicts(
  newSlot: TimeSlot,
  existingAppointments: any[]
): ConflictResult {
  const conflicts: any[] = [];

  for (const apt of existingAppointments) {
    // Ignorar citas canceladas o completadas
    if (apt.status === 'cancelled' || apt.status === 'completed') {
      continue;
    }

    // Ignorar la misma cita si estamos editando
    if (newSlot.appointmentId && apt.id === newSlot.appointmentId) {
      continue;
    }

    const existingSlot: TimeSlot = {
      date: getAppointmentDateOnly(apt.date || ''),
      time: formatAppointmentTimeForDisplay(apt.time || '09:00'),
      duration: apt.totalDuration || apt.duration || 60,
      resourceId: apt.vehicle?.id != null ? String(apt.vehicle.id) : apt.vehicle ? String(apt.vehicle) : undefined,
      appointmentId: apt.id,
    };

    if (doTimeSlotsOverlap(newSlot, existingSlot)) {
      conflicts.push(apt);
    }
  }

  if (conflicts.length > 0) {
    const resourceName = conflicts[0].vehicle?.name || 'el mismo vehículo';
    return {
      hasConflict: true,
      conflictingAppointments: conflicts,
      message: `Ya existe una cita programada para ${resourceName} en ese horario`,
    };
  }

  return {
    hasConflict: false,
    conflictingAppointments: [],
  };
}

/**
 * Sugiere el próximo horario disponible
 */
export function suggestNextAvailableSlot(
  preferredSlot: TimeSlot,
  existingAppointments: any[],
  stepMinutes: number = 30
): TimeSlot | null {
  let currentTime = preferredSlot.time;
  const maxAttempts = 24; // Intentar hasta 12 horas después

  for (let i = 0; i < maxAttempts; i++) {
    const testSlot: TimeSlot = {
      ...preferredSlot,
      time: currentTime,
    };

    const result = validateAppointmentConflicts(testSlot, existingAppointments);
    
    if (!result.hasConflict) {
      return testSlot;
    }

    // Avanzar al siguiente slot
    const [hours, minutes] = currentTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + stepMinutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }

  return null;
}

/**
 * Obtiene todas las citas conflictivas en un rango de tiempo
 */
export function getConflictsInRange(
  date: string,
  startTime: string,
  endTime: string,
  appointments: any[],
  resourceId?: string
): any[] {
  const conflicts: any[] = [];

  const rangeStart = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const rangeEnd = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

  for (const apt of appointments) {
    if (apt.date !== date) continue;
    if (apt.status === 'cancelled' || apt.status === 'completed') continue;
    
    if (resourceId) {
      const aptResourceId = apt.vehicle?.id || apt.vehicle;
      if (aptResourceId !== resourceId) continue;
    }

    const aptStart = parse(`${apt.date} ${apt.time}`, 'yyyy-MM-dd HH:mm', new Date());
    const aptEnd = addMinutes(aptStart, apt.totalDuration || apt.duration || 60);

    if (
      isWithinInterval(aptStart, { start: rangeStart, end: rangeEnd }) ||
      isWithinInterval(aptEnd, { start: rangeStart, end: rangeEnd }) ||
      (aptStart.getTime() <= rangeStart.getTime() && aptEnd.getTime() >= rangeEnd.getTime())
    ) {
      conflicts.push(apt);
    }
  }

  return conflicts;
}
