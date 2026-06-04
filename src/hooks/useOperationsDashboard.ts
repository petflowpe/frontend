import { useMemo } from 'react';
import type { Appointment } from './useAppointments';
import type { Vehicle } from './useVehicles';

export interface LiveUnit {
  id: string;
  name: string;
  driver: string;
  status: 'moving' | 'serving' | 'stopped';
  nextStop: string;
  eta: string;
  visitsTotal: number;
  visitsDone: number;
  visitsActive: number;
}

export interface OpsAlert {
  id: string;
  type: 'delay' | 'unassigned' | 'pending';
  level: 'high' | 'medium' | 'low';
  message: string;
  time: string;
  appointmentId?: string;
}

function todayIso(): string {
  return new Date().toLocaleDateString('en-CA');
}

function parseAppointmentDateTime(apt: Appointment): Date | null {
  const d = apt.date?.slice(0, 10);
  const t = (apt.time || '09:00').slice(0, 5);
  if (!d) return null;
  const dt = new Date(`${d}T${t}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function useOperationsDashboard(appointments: Appointment[], vehicles: Vehicle[]) {
  const today = todayIso();
  const todayAppointments = appointments.filter((a) => a.date?.slice(0, 10) === today);

  const liveUnits: LiveUnit[] = useMemo(() => {
    const activeVehicles = vehicles.filter((v) => v.activo !== false);

    return activeVehicles.map((vehicle) => {
      const vehicleApts = todayAppointments.filter(
        (a) => String(a.vehicle?.id ?? '') === String(vehicle.id)
      );

      const inProgress = vehicleApts.filter((a) => a.status === 'in-progress');
      const pending = vehicleApts.filter(
        (a) => a.status === 'pending' || a.status === 'confirmed'
      );
      const completed = vehicleApts.filter((a) => a.status === 'completed');

      let status: LiveUnit['status'] = 'stopped';
      if (inProgress.length > 0) status = 'serving';
      else if (pending.length > 0) {
        const next = pending
          .map((a) => ({ apt: a, dt: parseAppointmentDateTime(a) }))
          .filter((x) => x.dt)
          .sort((a, b) => (a.dt!.getTime() - b.dt!.getTime()))[0];
        if (next?.dt && next.dt.getTime() <= Date.now() + 60 * 60 * 1000) {
          status = 'moving';
        }
      }

      const nextApt =
        [...pending, ...inProgress]
          .map((a) => ({ apt: a, dt: parseAppointmentDateTime(a) }))
          .filter((x) => x.dt)
          .sort((a, b) => a.dt!.getTime() - b.dt!.getTime())[0]?.apt ?? null;

      return {
        id: String(vehicle.id),
        name: vehicle.name || `Móvil ${vehicle.id}`,
        driver: vehicle.driver_name || vehicle.driver || 'Sin conductor',
        status,
        nextStop: nextApt
          ? `${nextApt.clientName || nextApt.client} — ${nextApt.district || nextApt.address || ''}`
          : completed.length === vehicleApts.length && vehicleApts.length > 0
            ? 'Ruta completada'
            : 'Sin visitas pendientes',
        eta: nextApt?.time || '—',
        visitsTotal: vehicleApts.length,
        visitsDone: completed.length,
        visitsActive: inProgress.length,
      };
    });
  }, [todayAppointments, vehicles]);

  const alerts: OpsAlert[] = useMemo(() => {
    const list: OpsAlert[] = [];
    const now = Date.now();

    todayAppointments.forEach((apt) => {
      if (!apt.vehicle?.id) {
        list.push({
          id: `unassigned-${apt.id}`,
          type: 'unassigned',
          level: 'high',
          message: `Cita #${apt.id} sin vehículo (${apt.clientName || apt.client})`,
          time: 'Hoy',
          appointmentId: apt.id,
        });
      }

      const dt = parseAppointmentDateTime(apt);
      if (
        dt &&
        dt.getTime() < now &&
        (apt.status === 'pending' || apt.status === 'confirmed')
      ) {
        list.push({
          id: `delay-${apt.id}`,
          type: 'delay',
          level: 'high',
          message: `Retraso: ${apt.clientName || apt.client} a las ${apt.time} (${apt.vehicle?.name || 'sin móvil'})`,
          time: apt.time,
          appointmentId: apt.id,
        });
      }
    });

    return list.slice(0, 20);
  }, [todayAppointments]);

  const stats = useMemo(() => {
    const total = todayAppointments.length;
    const completed = todayAppointments.filter((a) => a.status === 'completed').length;
    const onTime = total > 0 ? Math.round((completed / total) * 100) : 100;
    const activeUnits = liveUnits.filter((u) => u.status !== 'stopped' || u.visitsTotal > 0).length;

    return {
      totalVisits: total,
      completed,
      activeUnits,
      alertCount: alerts.length,
      onTimePercent: onTime,
    };
  }, [todayAppointments, liveUnits, alerts]);

  return { liveUnits, alerts, stats, todayAppointments };
}
