import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export type TreatmentType = 'vaccine' | 'deworming' | 'flea' | 'surgery' | 'consultation' | 'other';

export interface MedicalRecord {
  id: string;
  petId: string;
  petName: string;      // Desnormalizado para facilitar listados
  ownerName: string;    // Desnormalizado para facilitar listados
  type: TreatmentType;
  name: string;         // Nombre del tratamiento (ej: "Vacuna Quintuple")
  date: string;         // Fecha de aplicación (ISO YYYY-MM-DD)
  nextDueDate?: string; // Fecha de próximo refuerzo (ISO YYYY-MM-DD)
  veterinarianName: string;
  notes?: string;
  cost: number;
  status: 'completed' | 'pending' | 'overdue' | 'upcoming';
  batchNumber?: string; // Para trazabilidad de vacunas
  weight?: number;      // Peso en el momento de la atención (kg)
}

// Convertir formato backend a frontend
const fromBackendFormat = (backendRecord: any): MedicalRecord => {
  const typeMap: Record<string, TreatmentType> = {
    'Vacunación': 'vaccine',
    'Desparasitación': 'deworming',
    'Tratamiento': 'flea',
    'Cirugía': 'surgery',
    'Consulta': 'consultation',
    'Chequeo': 'consultation',
    'Emergencia': 'consultation',
    'Laboratorio': 'other',
  };

  const statusMap: Record<string, 'completed' | 'pending' | 'overdue' | 'upcoming'> = {
    'completed': 'completed',
    'pending': 'pending',
  };

  // Determinar status basado en fecha
  let status: 'completed' | 'pending' | 'overdue' | 'upcoming' = 'completed';
  if (backendRecord.next_due_date) {
    const nextDate = new Date(backendRecord.next_due_date);
    const today = new Date();
    if (nextDate < today) {
      status = 'overdue';
    } else if (nextDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      status = 'upcoming';
    }
  }

  return {
    id: backendRecord.id.toString(),
    petId: backendRecord.pet_id?.toString() || '',
    petName: backendRecord.pet?.name || '',
    ownerName: backendRecord.client?.razon_social || '',
    type: typeMap[backendRecord.type] || 'other',
    name: backendRecord.title || backendRecord.description || '',
    date: backendRecord.date || '',
    nextDueDate: backendRecord.next_due_date || undefined,
    veterinarianName: backendRecord.user?.name || backendRecord.veterinarian || '',
    notes: backendRecord.notes || backendRecord.description || '',
    cost: 0, // El backend no tiene campo cost, se puede calcular o agregar
    status: status,
    weight: parseFloat(backendRecord.weight) || undefined,
  };
};

// Datos iniciales para demostración (si la BD está vacía)
const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-001',
    petId: '1', // Asumiendo ID de mascota existente
    petName: 'Max',
    ownerName: 'María González',
    type: 'vaccine',
    name: 'Vacuna Polivalente (Sextuple)',
    date: '2025-01-15',
    nextDueDate: '2026-01-15',
    veterinarianName: 'Dr. Carmen Silva',
    notes: 'Paciente tranquilo. Sin reacciones adversas inmediatas.',
    cost: 45.00,
    status: 'completed',
    weight: 12.5
  },
  {
    id: 'rec-002',
    petId: '2',
    petName: 'Luna',
    ownerName: 'Carlos Pérez',
    type: 'deworming',
    name: 'Desparasitación Interna (Drontal)',
    date: '2025-01-10',
    nextDueDate: '2025-04-10',
    veterinarianName: 'Dr. Juan López',
    notes: 'Se entregó pastilla para toma en casa.',
    cost: 15.00,
    status: 'completed',
    weight: 8.2
  },
  {
    id: 'rec-003',
    petId: '3',
    petName: 'Rocky',
    ownerName: 'Ana Martín',
    type: 'flea',
    name: 'Pipeta Antipulgas',
    date: '2024-12-20',
    nextDueDate: '2025-01-20',
    veterinarianName: 'Dr. Carmen Silva',
    notes: 'Aplicado en consultorio.',
    cost: 35.00,
    status: 'overdue', // Ya pasó la fecha
    weight: 25.0
  }
];

export const useMedicalRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async (filters?: { petId?: string; clientId?: string; type?: TreatmentType }) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters?.petId) params.pet_id = filters.petId;
      if (filters?.clientId) params.client_id = filters.clientId;
      if (filters?.type) {
        const typeMap: Record<TreatmentType, string> = {
          'vaccine': 'Vacunación',
          'deworming': 'Desparasitación',
          'flea': 'Tratamiento',
          'surgery': 'Cirugía',
          'consultation': 'Consulta',
          'other': 'Laboratorio',
        };
        params.type = typeMap[filters.type];
      }

      const response = await apiClient.get<{ data: any[]; meta?: any } | any[]>('/medical-records', params);
      
      const recordsArray = Array.isArray(response) ? response : (response.data || []);
      const mappedRecords = recordsArray.map(fromBackendFormat);
      
      setRecords(mappedRecords);
    } catch (e: any) {
      console.error("Error loading medical records", e);
      toast.error(e.message || "Error cargando historiales médicos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Convertir formato frontend a backend
  const toBackendFormat = (record: Partial<MedicalRecord>): any => {
    const typeMap: Record<TreatmentType, string> = {
      'vaccine': 'Vacunación',
      'deworming': 'Desparasitación',
      'flea': 'Tratamiento',
      'surgery': 'Cirugía',
      'consultation': 'Consulta',
      'other': 'Laboratorio',
    };

    return {
      pet_id: parseInt(record.petId || '0'),
      client_id: parseInt(record.petId || '0'), // Se puede obtener del pet
      type: typeMap[record.type || 'consultation'],
      title: record.name || '',
      description: record.notes || record.name || '',
      date: record.date || new Date().toISOString().split('T')[0],
      treatment: record.notes || '',
      weight: record.weight || null,
      notes: record.notes || '',
    };
  };

  const createRecord = async (recordData: Omit<MedicalRecord, 'id'> | MedicalRecord, isInitial = false) => {
    try {
      const backendData = toBackendFormat(recordData);
      const response = await apiClient.post<{ data: any }>('/medical-records', backendData);
      
      const backendRecord = response.data || response;
      const newRecord = fromBackendFormat(backendRecord);

      if (!isInitial) {
        setRecords(prev => [newRecord, ...prev]);
        toast.success('Historial médico registrado');
      }
      return newRecord;
    } catch (e: any) {
      console.error(e);
      if (!isInitial) toast.error(e.message || 'Error al guardar historial');
      throw e;
    }
  };

  const updateRecord = async (id: string, updates: Partial<MedicalRecord>) => {
    try {
      const backendData: any = {};
      
      if (updates.name) backendData.title = updates.name;
      if (updates.notes) backendData.description = updates.notes;
      if (updates.date) backendData.date = updates.date;
      if (updates.weight !== undefined) backendData.weight = updates.weight;
      if (updates.type) {
        const typeMap: Record<TreatmentType, string> = {
          'vaccine': 'Vacunación',
          'deworming': 'Desparasitación',
          'flea': 'Tratamiento',
          'surgery': 'Cirugía',
          'consultation': 'Consulta',
          'other': 'Laboratorio',
        };
        backendData.type = typeMap[updates.type];
      }

      await apiClient.put(`/medical-records/${id}`, backendData);

      // Actualizar estado local
      const current = records.find(r => r.id === id);
      if (current) {
        const updated = { ...current, ...updates };
        setRecords(prev => prev.map(r => r.id === id ? updated : r));
        toast.success('Registro actualizado');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al actualizar registro');
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await apiClient.delete(`/medical-records/${id}`);
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Registro eliminado');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al eliminar registro');
    }
  };

  // Obtener registros de una mascota específica
  const getRecordsByPet = (petId: string) => {
    return records.filter(r => r.petId === petId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Obtener recordatorios (próximos a vencer o vencidos)
  const getReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    return records
      .filter(r => r.nextDueDate) // Solo los que tienen fecha de próxima visita
      .map(r => {
        const dueDate = new Date(r.nextDueDate!);
        const todayDate = new Date(today);
        const diffTime = dueDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...r,
          daysUntil: diffDays,
          isOverdue: diffDays < 0
        };
      })
      .filter(r => r.daysUntil <= 30) // Mostrar recordatorios de los próximos 30 días o vencidos
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecordsByPet,
    getReminders,
    refreshRecords: fetchRecords
  };
};
