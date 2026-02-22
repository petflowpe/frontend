import { Card } from '../ui/card';
import { Calendar, CheckCircle, Repeat, AlertCircle } from 'lucide-react';
import { Appointment } from '../../hooks/useAppointments';

interface AppointmentStatsProps {
  appointments: Appointment[];
}

export function AppointmentStats({ appointments }: AppointmentStatsProps) {
  const today = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const completedToday = todayAppointments.filter(apt => apt.status === 'completed').length;
  const inProgressToday = todayAppointments.filter(apt => apt.status === 'in-progress').length;
  const pendingToday = todayAppointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed').length;
  const recurringCount = appointments.filter(apt => apt.recurring).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Total Hoy</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {todayAppointments.length}
            </p>
          </div>
          <Calendar className="h-12 w-12 text-blue-500" />
        </div>
      </Card>
      
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">Confirmadas</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">
              {pendingToday}
            </p>
          </div>
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
      </Card>
      
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Completadas</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              {completedToday}
            </p>
          </div>
          <CheckCircle className="h-12 w-12 text-purple-500" />
        </div>
      </Card>
      
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">En Progreso</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
              {inProgressToday}
            </p>
          </div>
          <AlertCircle className="h-12 w-12 text-orange-500" />
        </div>
      </Card>
      
      <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-2 border-pink-200 dark:border-pink-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-pink-600 dark:text-pink-400">Recurrentes</p>
            <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">
              {recurringCount}
            </p>
          </div>
          <Repeat className="h-12 w-12 text-pink-500" />
        </div>
      </Card>
    </div>
  );
}
