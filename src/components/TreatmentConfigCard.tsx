import { useState } from 'react';
import { Card, Button, Badge, Input, Separator } from './ui';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { TreatmentConfig } from '../config/medicalTreatments';
import { toast } from 'sonner';

interface TreatmentConfigCardProps {
  treatment: TreatmentConfig;
  onUpdate: (updated: TreatmentConfig) => void;
  onDelete: (id: string) => void;
}

export function TreatmentConfigCard({ treatment, onUpdate, onDelete }: TreatmentConfigCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTreatment, setEditedTreatment] = useState<TreatmentConfig>(treatment);

  const handleSave = () => {
    onUpdate(editedTreatment);
    setIsEditing(false);
    toast.success('✅ Tratamiento actualizado correctamente');
  };

  const handleCancel = () => {
    setEditedTreatment(treatment);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (treatment.mandatory) {
      toast.error('❌ No se puede eliminar un tratamiento obligatorio');
      return;
    }
    onDelete(treatment.id);
  };

  if (!isEditing) {
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-3xl">{treatment.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{treatment.name}</h3>
              <p className="text-sm text-muted-foreground">{treatment.description}</p>
              {treatment.mandatory && (
                <Badge className="mt-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  Obligatorio
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Costo</p>
              <p className="text-xl font-bold text-primary">S/ {treatment.defaultCost.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              {!treatment.mandatory && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 border-red-300 text-red-600 hover:bg-red-100"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          <p className="font-semibold text-sm">Protocolo de Aplicación:</p>
          {treatment.schedules.map((schedule, sIdx) => (
            <div key={sIdx} className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {schedule.ageFrom < 1 
                      ? `${Math.round(schedule.ageFrom * 4)} semanas - ${Math.round(schedule.ageTo * 4)} semanas` 
                      : schedule.ageFrom < 12
                        ? `${schedule.ageFrom} - ${schedule.ageTo === 999 ? '∞' : schedule.ageTo} meses`
                        : schedule.ageFrom === 12 
                          ? '1 año en adelante' 
                          : `${Math.floor(schedule.ageFrom / 12)} años en adelante`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{schedule.description}</p>
                </div>
                <Badge variant="outline">
                  {schedule.frequencyDays === 0 
                    ? 'Dosis única' 
                    : schedule.frequencyDays === 30 
                      ? 'Mensual' 
                      : schedule.frequencyDays === 90 
                        ? 'Trimestral' 
                        : schedule.frequencyDays === 365 
                          ? 'Anual' 
                          : `Cada ${schedule.frequencyDays} días`}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Modo de edición
  return (
    <Card className="p-5 border-2 border-primary">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-sm font-medium">Nombre del Tratamiento</label>
              <Input
                value={editedTreatment.name}
                onChange={(e) => setEditedTreatment({ ...editedTreatment, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={editedTreatment.description}
                onChange={(e) => setEditedTreatment({ ...editedTreatment, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="w-32">
            <label className="text-sm font-medium">Costo (S/)</label>
            <Input
              type="number"
              value={editedTreatment.defaultCost}
              onChange={(e) => setEditedTreatment({ ...editedTreatment, defaultCost: parseFloat(e.target.value) || 0 })}
              className="mt-1"
              step="0.01"
            />
          </div>
          <div className="w-16">
            <label className="text-sm font-medium">Icono</label>
            <Input
              value={editedTreatment.icon}
              onChange={(e) => setEditedTreatment({ ...editedTreatment, icon: e.target.value })}
              className="mt-1 text-center text-2xl"
              maxLength={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>
    </Card>
  );
}
