import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Dog, Cat } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export interface ConfigDialogProps {
  title: string;
  description?: string;
  items: string[];
  onSave?: (items: string[]) => Promise<void> | void;
  onClose: () => void;
}

export function ConfigDialog({ title, description, items, onSave, onClose }: ConfigDialogProps) {
  const [localItems, setLocalItems] = useState([...items]);
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalItems(Array.isArray(items) ? [...items] : []);
  }, [items]);

  const handleAdd = () => {
    const value = newItem.trim();
    if (!value) return;
    const exists = localItems.some((item) => item.trim().toLowerCase() === value.toLowerCase());
    if (exists) {
      toast.error('Esta opción ya existe');
      return;
    }
    setLocalItems([...localItems, value]);
    setNewItem('');
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
    setLocalItems(localItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!onSave) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      const seen = new Set<string>();
      const clean = localItems
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => {
          const key = item.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      await onSave(clean);
      onClose();
    } catch {
      // El toast de error lo muestra saveConfigurations
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description ?? 'Agrega, edita o elimina opciones'}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Nueva opción..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <Button type="button" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {localItems.map((item, index) => (
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
                    <Edit className="h-4 w-4" />
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
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export interface BreedConfigDialogProps {
  speciesList?: string[];
  breedsBySpecies?: Record<string, string[]>;
  onSave?: (species: string, items: string[]) => Promise<void> | void;
  onAllSaved?: () => void;
  onClose: () => void;
}

export function BreedConfigDialog({
  speciesList = [],
  breedsBySpecies = {},
  onSave,
  onAllSaved,
  onClose,
}: BreedConfigDialogProps) {
  const species = Array.isArray(speciesList) && speciesList.length > 0 ? speciesList : ['Perro', 'Gato'];
  const [activeTab, setActiveTab] = useState(species[0]);
  const [localBreedsBySpecies, setLocalBreedsBySpecies] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    species.forEach((s: string) => {
      init[s] = Array.isArray(breedsBySpecies[s]) ? [...breedsBySpecies[s]] : [];
    });
    return init;
  });
  const [newBreed, setNewBreed] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next: Record<string, string[]> = {};
    species.forEach((s: string) => {
      next[s] = Array.isArray(breedsBySpecies[s]) ? [...breedsBySpecies[s]] : [];
    });
    setLocalBreedsBySpecies(next);
    if (!species.includes(activeTab)) setActiveTab(species[0]);
  }, [breedsBySpecies, speciesList]);

  const currentBreeds = Array.isArray(localBreedsBySpecies[activeTab]) ? localBreedsBySpecies[activeTab] : [];
  const setCurrentBreeds = (items: string[]) => {
    setLocalBreedsBySpecies((prev) => ({ ...prev, [activeTab]: items }));
  };

  const handleAdd = () => {
    const value = newBreed.trim();
    if (!value) return;
    const exists = currentBreeds.some((breed) => breed.trim().toLowerCase() === value.toLowerCase());
    if (exists) {
      toast.error('Esta raza ya existe');
      return;
    }
    setCurrentBreeds([...currentBreeds, value]);
    setNewBreed('');
  };

  const handleDelete = (index: number) => {
    setCurrentBreeds(currentBreeds.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        for (const s of species) {
          const items = localBreedsBySpecies[s] ?? [];
          await onSave(s, items);
        }
      }
      onAllSaved?.();
      toast.success('Razas guardadas correctamente');
      onClose();
    } catch {
      // El toast de error lo muestra saveConfigurations
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Configurar Razas</DialogTitle>
        <DialogDescription>Gestiona las razas por especie. Las especies se cargan desde la configuración.</DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1">
          {species.map((s: string) => (
            <TabsTrigger key={s} value={s} className="flex items-center gap-1">
              {s === 'Perro' && <Dog className="h-4 w-4" />}
              {s === 'Gato' && <Cat className="h-4 w-4" />}
              {s}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              value={newBreed}
              onChange={(e) => setNewBreed(e.target.value)}
              placeholder={`Nueva raza de ${activeTab}...`}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            />
            <Button type="button" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {currentBreeds.map((breed, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{breed}</span>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(index)} className="h-6 w-6 p-0 text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </DialogContent>
  );
}
