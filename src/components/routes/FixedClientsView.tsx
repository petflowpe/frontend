import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Truck, 
  BarChart3,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';

interface FixedClient {
  id: number;
  fullName: string;
  district: string;
  isFixedSchedule: boolean;
  appointmentFrequency: 'semanal' | 'quincenal' | 'mensual' | 'bajo_demanda';
  preferredDays: string[];
  preferredTimeSlot: 'mañana' | 'tarde' | 'noche';
  preferredTime?: string;
  zone?: string;
  assignedVehicle?: number;
  coordinates: string;
  scheduleNotes?: string;
  status: string;
}

interface FixedClientsViewProps {
  clients: FixedClient[];
  vehicles: any[];
}

export function FixedClientsView({ clients, vehicles }: FixedClientsViewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Filtrar solo clientes fijos activos
  const fixedClients = clients.filter(
    c => c.isFixedSchedule && 
         c.appointmentFrequency !== 'bajo_demanda' &&
         c.status === 'Activo'
  );

  // Filtrar por vehículo
  const filteredClients = selectedVehicle === 'all'
    ? fixedClients
    : fixedClients.filter(c => c.assignedVehicle?.toString() === selectedVehicle);

  // Agrupar clientes por vehículo
  const clientsByVehicle = vehicles.map(vehicle => ({
    vehicle,
    clients: fixedClients.filter(c => c.assignedVehicle === vehicle.id)
  }));

  // Agrupar clientes por día de la semana
  const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const clientsByDay: { [key: string]: FixedClient[] } = {};
  
  daysOfWeek.forEach(day => {
    clientsByDay[day] = filteredClients.filter(c =>
      c.preferredDays.includes(day)
    );
  });

  // Estadísticas
  const stats = {
    total: fixedClients.length,
    semanal: fixedClients.filter(c => c.appointmentFrequency === 'semanal').length,
    quincenal: fixedClients.filter(c => c.appointmentFrequency === 'quincenal').length,
    mensual: fixedClients.filter(c => c.appointmentFrequency === 'mensual').length,
    totalWeeklyAppointments: fixedClients.reduce((acc, c) => {
      if (c.appointmentFrequency === 'semanal') return acc + c.preferredDays.length;
      if (c.appointmentFrequency === 'quincenal') return acc + (c.preferredDays.length / 2);
      if (c.appointmentFrequency === 'mensual') return acc + (c.preferredDays.length / 4);
      return acc;
    }, 0)
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'semanal':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'quincenal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'mensual':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTimeSlotColor = (slot: string) => {
    switch (slot) {
      case 'mañana':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'tarde':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'noche':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fijos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Semanales</p>
                <p className="text-2xl font-bold text-green-600">{stats.semanal}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quincenales</p>
                <p className="text-2xl font-bold text-blue-600">{stats.quincenal}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mensuales</p>
                <p className="text-2xl font-bold text-purple-600">{stats.mensual}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Citas/Semana</p>
                <p className="text-2xl font-bold">{Math.round(stats.totalWeeklyAppointments)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtrar Clientes Fijos</CardTitle>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente Fijo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Vehículo</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Todos los vehículos</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Día de la semana</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Todos los días</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day} className="capitalize">{day}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="by-vehicle" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="by-vehicle">Por Vehículo</TabsTrigger>
          <TabsTrigger value="by-day">Por Día</TabsTrigger>
          <TabsTrigger value="list">Lista Completa</TabsTrigger>
        </TabsList>

        {/* Vista por Vehículo */}
        <TabsContent value="by-vehicle" className="space-y-4">
          {clientsByVehicle.map(({ vehicle, clients: vehicleClients }) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{vehicle.name}</CardTitle>
                      <CardDescription>
                        {vehicleClients.length} cliente{vehicleClients.length !== 1 ? 's' : ''} fijo{vehicleClients.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {vehicleClients.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {vehicleClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay clientes fijos asignados a este vehículo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicleClients.map(client => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{client.fullName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {client.district}
                            </div>
                            <Badge className={getFrequencyColor(client.appointmentFrequency)}>
                              {client.appointmentFrequency}
                            </Badge>
                            <Badge className={getTimeSlotColor(client.preferredTimeSlot)}>
                              {client.preferredTimeSlot} {client.preferredTime && `· ${client.preferredTime}`}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {client.preferredDays.map(day => (
                              <span
                                key={day}
                                className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded capitalize"
                              >
                                {day.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <PauseCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Vista por Día */}
        <TabsContent value="by-day" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map(day => {
              const dayClients = clientsByDay[day] || [];
              return (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {day}
                    </CardTitle>
                    <CardDescription>
                      {dayClients.length} cita{dayClients.length !== 1 ? 's' : ''} programada{dayClients.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dayClients.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sin clientes fijos
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dayClients
                          .sort((a, b) => (a.preferredTime || '').localeCompare(b.preferredTime || ''))
                          .map(client => (
                            <div
                              key={client.id}
                              className="p-2 border rounded text-sm"
                            >
                              <div className="font-medium flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {client.preferredTime || client.preferredTimeSlot}
                              </div>
                              <div className="text-muted-foreground mt-1">
                                {client.fullName}
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {client.district}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Lista Completa */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Clientes Fijos ({filteredClients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredClients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">No hay clientes fijos</p>
                  <p className="text-sm mt-2">
                    Los clientes con horario fijo aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClients.map(client => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg">{client.fullName}</span>
                          <Badge className={getFrequencyColor(client.appointmentFrequency)}>
                            🔁 {client.appointmentFrequency}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {client.district}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Truck className="h-3 w-3" />
                            Vehículo {client.assignedVehicle || 'Sin asignar'}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {client.preferredTimeSlot} {client.preferredTime && `· ${client.preferredTime}`}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {client.preferredDays.map(day => (
                              <span
                                key={day}
                                className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded capitalize"
                              >
                                {day.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </div>
                        {client.scheduleNotes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            📝 {client.scheduleNotes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-amber-600">
                          <PauseCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}