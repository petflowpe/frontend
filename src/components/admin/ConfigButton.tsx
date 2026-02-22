import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import ConfiguracionPanel from './ConfiguracionPanel';

/**
 * Botón flotante de configuración que aparece en toda la aplicación
 * Permite acceso rápido al panel de configuración desde cualquier página
 */
export default function ConfigButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        title="Configuración del Sistema"
      >
        <Settings className="size-6" />
      </Button>

      {/* Modal de configuración */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Settings className="size-6" />
                Configuración del Sistema
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="mt-4">
            <ConfiguracionPanel />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Versión inline del botón (para usar en headers/toolbars)
 */
export function ConfigButtonInline() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Settings className="size-4" />
        Configuración
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-6" />
              Configuración del Sistema
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <ConfiguracionPanel />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
