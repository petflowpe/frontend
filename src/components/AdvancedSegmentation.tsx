import { useState } from 'react';
import {
  Users,
  Plus,
  X,
  Filter,
  Save,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Heart,
  Award,
  Target,
  Sparkles,
  Copy,
  Trash2,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useApp, Client } from '../contexts/AppContext';
import { toast } from 'sonner';

// Tipos de operadores
type Operator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between' | 'in_last_days';

// Tipo de condición
interface Condition {
  id: string;
  field: string;
  operator: Operator;
  value: string | number;
  value2?: string | number; // Para operadores "between"
}

// Tipo de segmento
interface Segment {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  logicOperator: 'AND' | 'OR';
  clientCount: number;
  createdAt: string;
}

interface AdvancedSegmentationProps {
  onSegmentSelected?: (segment: Segment, clients: Client[]) => void;
}

export function AdvancedSegmentation({ onSegmentSelected }: AdvancedSegmentationProps) {
  const { clients } = useApp();
  
  // Estados
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('AND');
  const [savedSegments, setSavedSegments] = useState<Segment[]>([
    {
      id: '1',
      name: 'Clientes VIP Inactivos',
      description: 'Clientes Oro/Platino sin visitas en 30+ días',
      conditions: [
        { id: '1', field: 'loyaltyTier', operator: 'equals', value: 'gold' },
        { id: '2', field: 'lastVisit', operator: 'in_last_days', value: 30 },
      ],
      logicOperator: 'AND',
      clientCount: 12,
      createdAt: '2024-11-15',
    },
    {
      id: '2',
      name: 'Alto Valor, Baja Frecuencia',
      description: 'Gastan mucho pero vienen poco',
      conditions: [
        { id: '1', field: 'totalSpent', operator: 'greater_than', value: 1000 },
        { id: '2', field: 'visitCount', operator: 'less_than', value: 5 },
      ],
      logicOperator: 'AND',
      clientCount: 23,
      createdAt: '2024-11-10',
    },
    {
      id: '3',
      name: 'Nuevos Clientes Prometedores',
      description: 'Menos de 60 días, 2+ visitas, gasto promedio alto',
      conditions: [
        { id: '1', field: 'firstVisit', operator: 'in_last_days', value: 60 },
        { id: '2', field: 'visitCount', operator: 'greater_than', value: 2 },
        { id: '3', field: 'avgTicket', operator: 'greater_than', value: 150 },
      ],
      logicOperator: 'AND',
      clientCount: 18,
      createdAt: '2024-11-05',
    },
  ]);

  // Campos disponibles para segmentación
  const availableFields = [
    { value: 'loyaltyTier', label: 'Tier de Fidelidad', icon: '👑', type: 'select' },
    { value: 'loyaltyPoints', label: 'Puntos de Fidelidad', icon: '⭐', type: 'number' },
    { value: 'totalSpent', label: 'Total Gastado (S/)', icon: '💰', type: 'number' },
    { value: 'visitCount', label: 'Número de Visitas', icon: '📊', type: 'number' },
    { value: 'avgTicket', label: 'Ticket Promedio (S/)', icon: '🎫', type: 'number' },
    { value: 'lastVisit', label: 'Última Visita', icon: '📅', type: 'date' },
    { value: 'firstVisit', label: 'Primera Visita', icon: '🎉', type: 'date' },
    { value: 'petCount', label: 'Número de Mascotas', icon: '🐾', type: 'number' },
    { value: 'petSize', label: 'Tamaño de Mascota', icon: '📏', type: 'select' },
    { value: 'city', label: 'Ciudad', icon: '🏙️', type: 'text' },
    { value: 'age', label: 'Edad del Cliente', icon: '👤', type: 'number' },
    { value: 'email', label: 'Email', icon: '📧', type: 'text' },
  ];

  // Operadores disponibles según el tipo de campo
  const getOperatorsForField = (fieldType: string): { value: Operator; label: string }[] => {
    switch (fieldType) {
      case 'number':
        return [
          { value: 'equals', label: 'Igual a' },
          { value: 'not_equals', label: 'Diferente de' },
          { value: 'greater_than', label: 'Mayor que' },
          { value: 'less_than', label: 'Menor que' },
          { value: 'between', label: 'Entre' },
        ];
      case 'text':
        return [
          { value: 'equals', label: 'Igual a' },
          { value: 'not_equals', label: 'Diferente de' },
          { value: 'contains', label: 'Contiene' },
        ];
      case 'date':
        return [
          { value: 'in_last_days', label: 'En los últimos X días' },
          { value: 'greater_than', label: 'Más reciente que' },
          { value: 'less_than', label: 'Más antiguo que' },
        ];
      case 'select':
        return [
          { value: 'equals', label: 'Es' },
          { value: 'not_equals', label: 'No es' },
        ];
      default:
        return [{ value: 'equals', label: 'Igual a' }];
    }
  };

  // Opciones para campos tipo select
  const getSelectOptions = (field: string) => {
    switch (field) {
      case 'loyaltyTier':
        return [
          { value: 'bronze', label: '🥉 Bronce' },
          { value: 'silver', label: '🥈 Plata' },
          { value: 'gold', label: '🥇 Oro' },
          { value: 'platinum', label: '💎 Platino' },
        ];
      case 'petSize':
        return [
          { value: 'small', label: 'Pequeño' },
          { value: 'medium', label: 'Mediano' },
          { value: 'large', label: 'Grande' },
          { value: 'extra-large', label: 'Extra Grande' },
        ];
      default:
        return [];
    }
  };

  // Agregar nueva condición
  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      field: 'totalSpent',
      operator: 'greater_than',
      value: '',
    };
    setConditions([...conditions, newCondition]);
  };

  // Actualizar condición
  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Eliminar condición
  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  // Aplicar filtro a los clientes
  const applySegmentFilter = (segment: Segment): Client[] => {
    return clients.filter((client) => {
      const results = segment.conditions.map((condition) => {
        const fieldValue = getClientFieldValue(client, condition.field);
        return evaluateCondition(fieldValue, condition);
      });

      return segment.logicOperator === 'AND'
        ? results.every((r) => r)
        : results.some((r) => r);
    });
  };

  // Obtener valor del campo del cliente
  const getClientFieldValue = (client: Client, field: string): any => {
    switch (field) {
      case 'loyaltyTier':
        return client.loyaltyTier;
      case 'loyaltyPoints':
        return client.loyaltyPoints;
      case 'totalSpent':
        return client.totalSpent;
      case 'visitCount':
        return client.pets[0]?.appointmentHistory?.length || 0;
      case 'avgTicket':
        const visits = client.pets[0]?.appointmentHistory?.length || 1;
        return client.totalSpent / visits;
      case 'lastVisit':
        const lastAppt = client.pets[0]?.appointmentHistory?.[0]?.date;
        return lastAppt ? new Date(lastAppt) : null;
      case 'firstVisit':
        const history = client.pets[0]?.appointmentHistory || [];
        const firstAppt = history[history.length - 1]?.date;
        return firstAppt ? new Date(firstAppt) : null;
      case 'petCount':
        return client.pets.length;
      case 'petSize':
        return client.pets[0]?.size;
      case 'city':
        return client.address || '';
      case 'email':
        return client.email;
      default:
        return null;
    }
  };

  // Evaluar condición
  const evaluateCondition = (fieldValue: any, condition: Condition): boolean => {
    if (fieldValue === null || fieldValue === undefined) return false;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value || fieldValue.toString() === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value && fieldValue.toString() !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'between':
        return (
          Number(fieldValue) >= Number(condition.value) &&
          Number(fieldValue) <= Number(condition.value2)
        );
      case 'contains':
        return fieldValue.toString().toLowerCase().includes(condition.value.toString().toLowerCase());
      case 'in_last_days':
        if (!(fieldValue instanceof Date)) return false;
        const daysDiff = (new Date().getTime() - fieldValue.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= Number(condition.value);
      default:
        return false;
    }
  };

  // Vista previa del segmento actual
  const previewSegment = () => {
    if (conditions.length === 0) {
      toast.error('Agrega al menos una condición');
      return;
    }

    const tempSegment: Segment = {
      id: 'temp',
      name: segmentName || 'Vista Previa',
      description: segmentDescription,
      conditions,
      logicOperator,
      clientCount: 0,
      createdAt: new Date().toISOString(),
    };

    const matchedClients = applySegmentFilter(tempSegment);
    toast.success(`${matchedClients.length} clientes coinciden con este segmento`);
  };

  // Guardar segmento
  const saveSegment = () => {
    if (!segmentName || conditions.length === 0) {
      toast.error('Completa el nombre y al menos una condición');
      return;
    }

    const tempSegment: Segment = {
      id: 'temp',
      name: segmentName,
      description: segmentDescription,
      conditions,
      logicOperator,
      clientCount: 0,
      createdAt: new Date().toISOString(),
    };

    const matchedClients = applySegmentFilter(tempSegment);

    const newSegment: Segment = {
      id: Date.now().toString(),
      name: segmentName,
      description: segmentDescription,
      conditions: [...conditions],
      logicOperator,
      clientCount: matchedClients.length,
      createdAt: new Date().toISOString(),
    };

    setSavedSegments([newSegment, ...savedSegments]);
    toast.success(`Segmento "${segmentName}" guardado con ${matchedClients.length} clientes`);
    
    // Reset form
    setShowCreateDialog(false);
    setSegmentName('');
    setSegmentDescription('');
    setConditions([]);
    setLogicOperator('AND');
  };

  // Seleccionar segmento para campaña
  const selectSegment = (segment: Segment) => {
    const matchedClients = applySegmentFilter(segment);
    toast.success(`Segmento "${segment.name}" seleccionado (${matchedClients.length} clientes)`);
    onSegmentSelected?.(segment, matchedClients);
  };

  // Duplicar segmento
  const duplicateSegment = (segment: Segment) => {
    const newSegment: Segment = {
      ...segment,
      id: Date.now().toString(),
      name: `${segment.name} (Copia)`,
      createdAt: new Date().toISOString(),
    };
    setSavedSegments([newSegment, ...savedSegments]);
    toast.success('Segmento duplicado');
  };

  // Eliminar segmento
  const deleteSegment = (id: string) => {
    setSavedSegments(savedSegments.filter((s) => s.id !== id));
    toast.success('Segmento eliminado');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Segmentación Avanzada</h2>
          <p className="text-muted-foreground">
            Crea audiencias específicas para campañas ultra-personalizadas
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Segmento
        </Button>
      </div>

      {/* Segmentos Rápidos Predefinidos */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Segmentos Rápidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'VIP en Riesgo',
              description: 'Oro/Platino, sin visitas en 30+ días',
              count: 12,
              color: 'from-orange-400 to-red-400',
              icon: '⚠️',
            },
            {
              name: 'Nuevos Prometedores',
              description: 'Menos de 60 días, alta frecuencia',
              count: 18,
              color: 'from-green-400 to-emerald-400',
              icon: '🌟',
            },
            {
              name: 'Alto CLV',
              description: 'S/ 1000+ gastados, activos',
              count: 34,
              color: 'from-purple-400 to-pink-400',
              icon: '💎',
            },
          ].map((quick, idx) => (
            <Card
              key={idx}
              className={`p-4 bg-gradient-to-br ${quick.color} text-white cursor-pointer hover:shadow-lg transition-all`}
              onClick={() => toast.info(`Aplicando segmento: ${quick.name}`)}
            >
              <div className="text-3xl mb-2">{quick.icon}</div>
              <h4 className="font-bold mb-1">{quick.name}</h4>
              <p className="text-sm opacity-90 mb-3">{quick.description}</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-white/20 text-white">{quick.count} clientes</Badge>
                <Target className="h-4 w-4" />
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Segmentos Guardados */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          Segmentos Guardados ({savedSegments.length})
        </h3>
        <div className="space-y-4">
          {savedSegments.map((segment) => {
            const matchedClients = applySegmentFilter(segment);
            const estimatedRevenue = matchedClients.reduce((sum, c) => sum + c.totalSpent, 0) / matchedClients.length * 0.3; // 30% del avg

            return (
              <Card key={segment.id} className="p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold">{segment.name}</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {segment.logicOperator}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        <Users className="h-3 w-3 mr-1" />
                        {matchedClients.length} clientes
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{segment.description}</p>
                    
                    {/* Condiciones */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {segment.conditions.map((condition, idx) => {
                        const field = availableFields.find((f) => f.value === condition.field);
                        return (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {field?.icon} {field?.label} {condition.operator.replace('_', ' ')} {condition.value}
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Insights */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Ingresos Est.</p>
                          <p className="font-semibold">S/ {estimatedRevenue.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">CLV Promedio</p>
                          <p className="font-semibold">
                            S/{' '}
                            {matchedClients.length > 0
                              ? (matchedClients.reduce((sum, c) => sum + c.totalSpent, 0) / matchedClients.length).toFixed(0)
                              : 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Creado</p>
                          <p className="font-semibold">
                            {new Date(segment.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" onClick={() => selectSegment(segment)}>
                      <Target className="h-4 w-4 mr-1" />
                      Usar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => duplicateSegment(segment)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteSegment(segment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {savedSegments.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tienes segmentos guardados</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer segmento
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Diálogo: Crear Segmento */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Crear Nuevo Segmento
            </DialogTitle>
            <DialogDescription>Define condiciones para crear una audiencia específica</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nombre y Descripción */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="segment-name">Nombre del Segmento *</Label>
                <Input
                  id="segment-name"
                  placeholder="Ej: Clientes VIP Inactivos"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segment-description">Descripción</Label>
                <Input
                  id="segment-description"
                  placeholder="Ej: Oro/Platino sin visitas en 30+ días"
                  value={segmentDescription}
                  onChange={(e) => setSegmentDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Operador Lógico */}
            <div className="space-y-2">
              <Label>Lógica entre Condiciones</Label>
              <div className="flex gap-4">
                <Card
                  className={`p-4 flex-1 cursor-pointer transition-all ${
                    logicOperator === 'AND'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                  onClick={() => setLogicOperator('AND')}
                >
                  <div className="font-semibold mb-1">Y (AND)</div>
                  <p className="text-xs text-muted-foreground">
                    El cliente debe cumplir <strong>todas</strong> las condiciones
                  </p>
                </Card>
                <Card
                  className={`p-4 flex-1 cursor-pointer transition-all ${
                    logicOperator === 'OR'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                  onClick={() => setLogicOperator('OR')}
                >
                  <div className="font-semibold mb-1">O (OR)</div>
                  <p className="text-xs text-muted-foreground">
                    El cliente debe cumplir <strong>al menos una</strong> condición
                  </p>
                </Card>
              </div>
            </div>

            {/* Condiciones */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Condiciones ({conditions.length})</Label>
                <Button size="sm" variant="outline" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Condición
                </Button>
              </div>

              {conditions.length === 0 && (
                <Card className="p-8 text-center border-dashed">
                  <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Agrega condiciones para definir tu segmento</p>
                </Card>
              )}

              {conditions.map((condition, idx) => {
                const field = availableFields.find((f) => f.value === condition.field);
                const operators = getOperatorsForField(field?.type || 'text');
                const selectOptions = field?.type === 'select' ? getSelectOptions(condition.field) : [];

                return (
                  <Card key={condition.id} className="p-4">
                    <div className="flex items-center gap-3">
                      {idx > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {logicOperator}
                        </Badge>
                      )}
                      
                      {/* Campo */}
                      <Select
                        value={condition.field}
                        onValueChange={(value) =>
                          updateCondition(condition.id, { field: value, operator: 'equals', value: '' })
                        }
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.icon} {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Operador */}
                      <Select
                        value={condition.operator}
                        onValueChange={(value: Operator) => updateCondition(condition.id, { operator: value })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Valor */}
                      {field?.type === 'select' ? (
                        <Select
                          value={condition.value.toString()}
                          onValueChange={(value) => updateCondition(condition.id, { value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field?.type === 'number' || field?.type === 'date' ? 'number' : 'text'}
                          placeholder="Valor"
                          className="flex-1"
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        />
                      )}

                      {/* Valor 2 (para "between") */}
                      {condition.operator === 'between' && (
                        <>
                          <span className="text-muted-foreground">y</span>
                          <Input
                            type="number"
                            placeholder="Valor 2"
                            className="w-32"
                            value={condition.value2 || ''}
                            onChange={(e) => updateCondition(condition.id, { value2: e.target.value })}
                          />
                        </>
                      )}

                      {/* Eliminar */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Vista Previa */}
            {conditions.length > 0 && (
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">Vista Previa del Segmento</h4>
                    <p className="text-sm text-muted-foreground">
                      {conditions.length} condición(es) con lógica {logicOperator}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={previewSegment}>
                    <Eye className="h-4 w-4 mr-1" />
                    Calcular Alcance
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveSegment} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="h-4 w-4 mr-2" />
              Guardar Segmento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
