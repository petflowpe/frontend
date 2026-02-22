import { useState, useMemo } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Car, Scissors, Star, Calendar, Clock, Edit2, Trash2, Settings, CreditCard, Briefcase, IdCard, User, Home, Building2, Globe } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { 
  EMPLOYEE_POSITION_OPTIONS, 
  EMPLOYEE_STATUS_OPTIONS, 
  COST_CENTER_OPTIONS,
  DOCUMENT_TYPES,
  GENDER_OPTIONS,
  WORKDAY_TYPES,
  PERU_DEPARTMENTS,
  PERU_DISTRICTS_LIMA,
  PERU_PROVINCES_LIMA,
  PERU_POSTAL_CODES,
  PERU_BANKS
} from '../config/defaults';

// Datos de vehículos para el selector
const AVAILABLE_VEHICLES = [
  'Furgoneta SmartPet #001',
  'Furgoneta SmartPet #002',
  'Furgoneta SmartPet #003'
];

export function Staff() {
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  
  // Estados para los diálogos de configuración
  const [showPositionConfig, setShowPositionConfig] = useState(false);
  const [showStatusConfig, setShowStatusConfig] = useState(false);
  const [showCostCenterConfig, setShowCostCenterConfig] = useState(false);
  
  // Estados para las configuraciones
  const [positions, setPositions] = useState([...EMPLOYEE_POSITION_OPTIONS]);
  const [statuses, setStatuses] = useState([...EMPLOYEE_STATUS_OPTIONS]);
  const [costCenters, setCostCenters] = useState([...COST_CENTER_OPTIONS]);

  const { staff, loading: staffLoading, reload: reloadStaff, createUser } = useStaff();
  const employees = useMemo(() => staff.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    address: '',
    position: s.position || s.role_display || s.role || 'Usuario',
    hireDate: s.created_at?.slice(0, 10) || '',
    salary: 0,
    status: s.status || (s.active ? 'active' : 'inactive'),
    vehicle: '',
    license: '',
    rating: 0,
    completedServices: 0,
    specialties: [] as string[],
  })), [staff]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusObj = statuses.find(s => s.id === status);
    return statusObj ? statusObj.label : status;
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveEmployee = async (employeeData: any) => {
    if (editingEmployee) {
      setEditingEmployee(null);
      setShowNewEmployee(false);
      return;
    }
    try {
      await createUser({
        name: employeeData.name || '',
        email: employeeData.email || '',
        password: employeeData.password || (Math.random().toString(36) + 'A1a!'),
        role_name: employeeData.role_name || 'company_user',
      });
      reloadStaff();
      setShowNewEmployee(false);
    } catch (_e) {}
  };

  const handleDeleteEmployee = (_id: number) => {
    if (selectedEmployee?.id === _id) setSelectedEmployee(null);
  };

  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const averageRating = employees.length ? employees.reduce((acc, emp) => acc + (emp.rating || 0), 0) / employees.length : 0;
  const totalServices = employees.reduce((acc, emp) => acc + (emp.completedServices || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-primary">Gestión de Personal</h1>
          <p className="text-muted-foreground">Administra tu equipo de groomers y personal</p>
        </div>
        <div className="flex gap-2">
          {/* Botón Configurar Puestos */}
          <Dialog open={showPositionConfig} onOpenChange={setShowPositionConfig}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Briefcase className="h-4 w-4 mr-2" />
                Config. Puestos
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Configurar Puestos"
              items={positions}
              onSave={setPositions}
              onClose={() => setShowPositionConfig(false)}
            />
          </Dialog>

          {/* Botón Configurar Estados */}
          <Dialog open={showStatusConfig} onOpenChange={setShowStatusConfig}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Config. Estados
              </Button>
            </DialogTrigger>
            <StatusConfigDialog
              items={statuses}
              onSave={setStatuses}
              onClose={() => setShowStatusConfig(false)}
            />
          </Dialog>

          {/* Botón Configurar Centro de Costo */}
          <Dialog open={showCostCenterConfig} onOpenChange={setShowCostCenterConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-[rgba(0,92,240,0.3)] text-[rgb(255,255,255)]">
                <CreditCard className="h-4 w-4 mr-2" />
                Config. Centro de Costo
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Configurar Centros de Costo"
              items={costCenters}
              onSave={setCostCenters}
              onClose={() => setShowCostCenterConfig(false)}
            />
          </Dialog>

          {/* Botón Nuevo Empleado */}
          <Dialog open={showNewEmployee} onOpenChange={setShowNewEmployee}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEmployee(null)} className="bg-[rgb(44,48,219)]">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <EmployeeDialog 
              employee={editingEmployee}
              positions={positions}
              statuses={statuses}
              costCenters={costCenters}
              vehicles={AVAILABLE_VEHICLES}
              onSave={handleSaveEmployee}
              onClose={() => {
                setShowNewEmployee(false);
                setEditingEmployee(null);
              }}
            />
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl">{activeEmployees}</p>
              <p className="text-sm text-muted-foreground">Empleados Activos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Rating Promedio</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Scissors className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl">{totalServices}</p>
              <p className="text-sm text-muted-foreground">Servicios Completados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl">{employees.filter(emp => emp.vehicle).length}</p>
              <p className="text-sm text-muted-foreground">Vehículos Asignados</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nombre, puesto o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employees List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredEmployees.map((employee) => (
            <Card 
              key={employee.id} 
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${ selectedEmployee?.id === employee.id ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              onClick={() => setSelectedEmployee(employee)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <Badge className={getStatusColor(employee.status)}>
                        {getStatusText(employee.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{employee.position}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{employee.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{employee.district}</span>
                      </div>
                    </div>
                    {employee.vehicle && (
                      <div className="flex items-center space-x-2 text-sm bg-muted px-3 py-1.5 rounded-lg w-fit">
                        <Car className="h-4 w-4 text-primary" />
                        <span className="font-medium">{employee.vehicle}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center space-x-1 mb-2 justify-end">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-lg">{employee.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{employee.completedServices} servicios</p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEmployee(employee);
                        setShowNewEmployee(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEmployee(employee.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Employee Details Panel */}
        <div>
          {selectedEmployee ? (
            <Card className="p-6 sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-lg">{selectedEmployee.name}</h3>
                <Badge className={getStatusColor(selectedEmployee.status)}>
                  {getStatusText(selectedEmployee.status)}
                </Badge>
              </div>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="schedule">Horario</TabsTrigger>
                  <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="font-medium text-xs text-muted-foreground">Puesto</span>
                      <p className="mt-1">{selectedEmployee.position}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="font-medium text-xs text-muted-foreground">Email</span>
                      <p className="mt-1">{selectedEmployee.email}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="font-medium text-xs text-muted-foreground">Teléfono</span>
                      <p className="mt-1">{selectedEmployee.phone}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="font-medium text-xs text-muted-foreground">Dirección</span>
                      <p className="mt-1">{selectedEmployee.address}, {selectedEmployee.district}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="font-medium text-xs text-muted-foreground">Jornada</span>
                        <p className="mt-1">{selectedEmployee.workday === 'full' ? 'Completa' : 'Parcial'}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="font-medium text-xs text-muted-foreground">Centro de Costo</span>
                        <p className="mt-1">{selectedEmployee.costCenter}</p>
                      </div>
                    </div>
                    {selectedEmployee.vehicle && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <span className="font-medium text-xs text-primary">Vehículo asignado</span>
                        <p className="mt-1 font-medium">{selectedEmployee.vehicle}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="font-medium text-xs text-muted-foreground">Documento</span>
                      <p className="mt-1">{selectedEmployee.documentType.toUpperCase()} - {selectedEmployee.documentNumber}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="font-medium text-xs text-muted-foreground">Fecha de Nacimiento</span>
                        <p className="mt-1">{selectedEmployee.birthDate}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="font-medium text-xs text-muted-foreground">Sexo</span>
                        <p className="mt-1">{selectedEmployee.gender === 'male' ? 'Masculino' : 'Femenino'}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="font-medium text-xs text-muted-foreground">Ubicación</span>
                      <p className="mt-1">{selectedEmployee.district}, {selectedEmployee.province} - {selectedEmployee.department}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="font-medium text-xs text-muted-foreground">Banco</span>
                      <p className="mt-1">{selectedEmployee.bankEntity}</p>
                      <p className="text-xs text-muted-foreground mt-1">Cta: {selectedEmployee.bankAccount}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="font-medium text-xs text-muted-foreground">Fecha de Ingreso</span>
                        <p className="mt-1">{selectedEmployee.hireDate}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="font-medium text-xs text-muted-foreground">Salario</span>
                        <p className="mt-1">S/ {selectedEmployee.salary}</p>
                      </div>
                    </div>
                    {selectedEmployee.license && (
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="font-medium text-xs text-muted-foreground">Licencia</span>
                        <p className="mt-1">{selectedEmployee.license}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-3 mt-4">
                  {Object.entries(selectedEmployee.availability).map(([day, schedule]: [string, any]) => {
                    const dayNames: { [key: string]: string } = {
                      monday: 'Lunes',
                      tuesday: 'Martes',
                      wednesday: 'Miércoles',
                      thursday: 'Jueves',
                      friday: 'Viernes',
                      saturday: 'Sábado',
                      sunday: 'Domingo'
                    };

                    return (
                      <div key={day} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{dayNames[day]}</span>
                        {schedule.available ? (
                          <span className="text-sm text-primary font-medium">
                            {schedule.start} - {schedule.end}
                          </span>
                        ) : (
                          <Badge variant="secondary">No disponible</Badge>
                        )}
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="performance" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Puntualidad</span>
                        <span className="text-sm font-medium">{selectedEmployee.performance.punctuality}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all" 
                          style={{ width: `${selectedEmployee.performance.punctuality}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Calidad del trabajo</span>
                        <span className="text-sm font-medium">{selectedEmployee.performance.quality}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full transition-all" 
                          style={{ width: `${selectedEmployee.performance.quality}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Satisfacción del cliente</span>
                        <span className="text-sm font-medium">{selectedEmployee.performance.customerSatisfaction}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full transition-all" 
                          style={{ width: `${selectedEmployee.performance.customerSatisfaction}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span>Rating general:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-lg">{selectedEmployee.rating}/5</span>
                        </div>
                      </div>
                      <div className="mt-2 text-center p-3 bg-muted rounded-lg">
                        <span className="text-2xl font-semibold">{selectedEmployee.completedServices}</span>
                        <p className="text-xs text-muted-foreground mt-1">Servicios Completados</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="p-8 text-center sticky top-6">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg mb-2">Selecciona un empleado</h3>
              <p className="text-muted-foreground text-sm">
                Haz clic en un empleado para ver sus detalles completos
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para el diálogo de empleado - MEJORADO CON NUEVA ESTRUCTURA
function EmployeeDialog({ employee, positions, statuses, costCenters, vehicles, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    // Información Personal
    name: employee?.name || '',
    documentType: employee?.documentType || 'dni',
    documentNumber: employee?.documentNumber || '',
    birthDate: employee?.birthDate || '',
    gender: employee?.gender || 'male',
    email: employee?.email || '',
    phone: employee?.phone || '',
    address: employee?.address || '',
    district: employee?.district || PERU_DISTRICTS_LIMA[0],
    department: employee?.department || PERU_DEPARTMENTS[0],
    province: employee?.province || PERU_PROVINCES_LIMA[0],
    postalCode: employee?.postalCode || '',
    country: employee?.country || 'Perú',
    
    // Información Laboral
    position: employee?.position || positions[0],
    vehicle: employee?.vehicle || '',
    license: employee?.license || '',
    salary: employee?.salary || 1500,
    workday: employee?.workday || 'full',
    status: employee?.status || 'active',
    costCenter: employee?.costCenter || costCenters[0],
    bankEntity: employee?.bankEntity || PERU_BANKS[0],
    bankAccount: employee?.bankAccount || '',
    specialties: employee?.specialties || [],
    
    // Horario de trabajo
    availability: employee?.availability || {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '', end: '', available: false },
      sunday: { start: '', end: '', available: false }
    },
    
    // Seguridad
    password: employee?.password || ''
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  // Buscar código postal automático al cambiar distrito
  const handleDistrictChange = (newDistrict: string) => {
    const postalInfo = PERU_POSTAL_CODES.find(p => p.district === newDistrict);
    setFormData({
      ...formData,
      district: newDistrict,
      postalCode: postalInfo?.code || ''
    });
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((_: any, i: number) => i !== index)
    });
  };

  const updateAvailability = (day: string, field: string, value: any) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [field]: value
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      hireDate: employee?.hireDate || new Date().toISOString().split('T')[0],
      rating: employee?.rating || 4.0,
      completedServices: employee?.completedServices || 0,
      performance: employee?.performance || {
        punctuality: 90,
        quality: 90,
        customerSatisfaction: 90
      }
    });
  };

  const dayNames: { [key: string]: string } = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  return (
    <DialogContent className="max-w-[98vw] w-[1600px] max-h-[95vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
        </DialogTitle>
        <DialogDescription>
          {employee ? 'Modifica la información del empleado.' : 'Completa el formulario para agregar un nuevo empleado al sistema.'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto px-1">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. INFORMACIÓN PERSONAL */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
              <IdCard className="h-5 w-5" />
              1. Información Personal
            </h3>
            
            {/* Nombre Completo, Tipo y Nro Documento, Fecha Nacimiento, Sexo */}
            <div className="grid grid-cols-8 gap-3">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Juan Carlos Pérez López" className="text-[rgb(119,187,255)]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento *</Label>
                <select
                  id="documentType"
                  className="w-full p-2 border rounded-md text-[rgb(255,255,255)]"
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="documentNumber">Nro de Documento *</Label>
                <Input
                  id="documentNumber"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  required
                  placeholder="Ej: 72345678"
                  maxLength={formData.documentType === 'dni' ? 8 : 12}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Sexo *</Label>
                <select
                  id="gender"
                  className="w-full p-2 border rounded-md"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  {GENDER_OPTIONS.map((gender) => (
                    <option key={gender.id} value={gender.id}>{gender.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email, Teléfono, Dirección y ubicación */}
            <div className="grid grid-cols-8 gap-3">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="ejemplo@smartpet.com"
                />
              </div>
              
              <div className="space-y-2 bg-[rgba(242,20,20,0)]">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+51 987 654 321"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Av. Larco 1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">Distrito *</Label>
                <select
                  id="district"
                  className="w-full p-2 border rounded-md"
                  value={formData.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                >
                  {PERU_DISTRICTS_LIMA.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <select
                  id="department"
                  className="w-full p-2 border rounded-md"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {PERU_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="province">Ciudad (Provincia) *</Label>
                <select
                  id="province"
                  className="w-full p-2 border rounded-md"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                >
                  {PERU_PROVINCES_LIMA.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-8 gap-3 bg-[rgba(250,75,75,0)]">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal (Ubigeo)</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="Auto"
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>

          {/* 2. INFORMACIÓN LABORAL */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
              <Briefcase className="h-5 w-5" />
              2. Información Laboral
            </h3>

            {/* Cargo, Vehículo, Licencia, Sueldo, Jornada, Estado, Centro de Costo, Especialidad */}
            <div className="grid grid-cols-8 gap-3">
              <div className="space-y-2">
                <Label htmlFor="position">Cargo *</Label>
                <select
                  id="position"
                  className="w-full p-2 border rounded-md"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                >
                  {positions.map((pos: string) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="vehicle">Vehículo Asignado {formData.position === 'Chofer' && '*'}</Label>
                <select
                  id="vehicle"
                  className="w-full p-2 border rounded-md"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  disabled={formData.position !== 'Chofer'}
                  required={formData.position === 'Chofer'}
                >
                  <option value="">Sin vehículo asignado</option>
                  {vehicles.map((vehicle: string) => (
                    <option key={vehicle} value={vehicle}>{vehicle}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license">Licencia de Conducir {formData.position === 'Chofer' && '*'}</Label>
                <Input
                  id="license"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  placeholder="Ej: Q12345678"
                  required={formData.position === 'Chofer'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary">Sueldo Base (S/) *</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  placeholder="1500"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workday">Jornada *</Label>
                <select
                  id="workday"
                  className="w-full p-2 border rounded-md"
                  value={formData.workday}
                  onChange={(e) => setFormData({ ...formData, workday: e.target.value })}
                >
                  {WORKDAY_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <select
                  id="status"
                  className="w-full p-2 border rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map((status: any) => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="costCenter">Centro de Costo *</Label>
                <select
                  id="costCenter"
                  className="w-full p-2 border rounded-md"
                  value={formData.costCenter}
                  onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                >
                  {costCenters.map((center: string) => (
                    <option key={center} value={center}>{center}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Banco y Cuenta */}
            <div className="grid grid-cols-8 gap-3">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="bankEntity">Entidad Bancaria *</Label>
                <select
                  id="bankEntity"
                  className="w-full p-2 border rounded-md"
                  value={formData.bankEntity}
                  onChange={(e) => setFormData({ ...formData, bankEntity: e.target.value })}
                >
                  {PERU_BANKS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="bankAccount">Nro de Cuenta</Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="Ej: 191-1234567-0-00"
                />
              </div>
            </div>

            {/* Especialidades */}
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Agregar especialidad..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                />
                <Button type="button" onClick={addSpecialty} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.specialties.map((specialty: string, index: number) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1">
                      {specialty}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeSpecialty(index)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Configuración de Días y Horarios */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Configuración de Días y Horario de Trabajo
              </Label>
              <div className="grid grid-cols-7 gap-2 bg-muted/50 p-3 rounded-lg">
                {Object.entries(formData.availability).map(([day, schedule]: [string, any]) => (
                  <div key={day} className="flex flex-col gap-2 p-2 bg-background rounded-md">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={schedule.available}
                        onCheckedChange={(checked) => updateAvailability(day, 'available', checked)}
                      />
                      <span className="font-medium text-xs">{dayNames[day]}</span>
                    </div>
                    {schedule.available ? (
                      <div className="space-y-1">
                        <Input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => updateAvailability(day, 'start', e.target.value)}
                          className="text-xs h-8"
                        />
                        <Input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => updateAvailability(day, 'end', e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground text-center">No disponible</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seguridad */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <Settings className="h-4 w-4" />
              Seguridad
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña {!employee && '*'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Ingrese una contraseña segura"
                  required={!employee}
                />
                {employee && (
                  <p className="text-xs text-muted-foreground">Deja en blanco para mantener la contraseña actual</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Botones de Acción - Fixed al fondo */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-primary" onClick={(e: any) => {
          e.preventDefault();
          const form = e.target.closest('form') || document.querySelector('form');
          if (form) form.requestSubmit();
        }}>
          {employee ? 'Guardar Cambios' : 'Crear Empleado'}
        </Button>
      </div>
    </DialogContent>
  );
}

// Componente para configurar puestos y centros de costo (simples strings)
function ConfigDialog({ title, items, onSave, onClose }: any) {
  const [localItems, setLocalItems] = useState([...items]);
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = () => {
    if (newItem.trim() && !localItems.includes(newItem.trim())) {
      setLocalItems([...localItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(localItems[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updated = [...localItems];
      updated[editingIndex] = editingValue.trim();
      setLocalItems(updated);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleDelete = (index: number) => {
    setLocalItems(localItems.filter((_: any, i: number) => i !== index));
  };

  const handleSave = () => {
    onSave(localItems);
    onClose();
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Gestiona los elementos de esta categoría.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Nuevo elemento..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <Button type="button" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {localItems.map((item: string, index: number) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {editingIndex === index ? (
                <>
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveEdit}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1">{item}</span>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(index)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Componente para configurar estados (con id y label)
function StatusConfigDialog({ items, onSave, onClose }: any) {
  const [localItems, setLocalItems] = useState([...items]);
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleAdd = () => {
    if (newId.trim() && newLabel.trim() && !localItems.find((item: any) => item.id === newId.trim())) {
      setLocalItems([...localItems, { id: newId.trim(), label: newLabel.trim() }]);
      setNewId('');
      setNewLabel('');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingItem({ ...localItems[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingItem.id.trim() && editingItem.label.trim()) {
      const updated = [...localItems];
      updated[editingIndex] = editingItem;
      setLocalItems(updated);
      setEditingIndex(null);
      setEditingItem(null);
    }
  };

  const handleDelete = (index: number) => {
    setLocalItems(localItems.filter((_: any, i: number) => i !== index));
  };

  const handleSave = () => {
    onSave(localItems);
    onClose();
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Configurar Estados</DialogTitle>
        <DialogDescription>
          Gestiona los estados de empleados con sus identificadores y etiquetas.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="ID (ej: active)"
          />
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Etiqueta (ej: Activo)"
          />
          <Button type="button" onClick={handleAdd} className="col-span-2">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Estado
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {localItems.map((item: any, index: number) => (
            <div key={index} className="p-3 bg-muted rounded-lg">
              {editingIndex === index ? (
                <div className="space-y-2">
                  <Input
                    value={editingItem.id}
                    onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })}
                    placeholder="ID"
                  />
                  <Input
                    value={editingItem.label}
                    onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                    placeholder="Etiqueta"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} className="flex-1">
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(index)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
