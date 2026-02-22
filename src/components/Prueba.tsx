import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Beaker, Send, Star, Shield, Search, FileText, User, Calendar, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { LoadingSpinner } from './LoadingSpinner';

interface PruebaProps {
  onNavigate?: (tab: string) => void;
}

export function Prueba({ onNavigate }: PruebaProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: ''
  });

  const [auditFilter, setAuditFilter] = useState('');
  const { logs: auditLogs, loading: auditLoading, fetchLogs } = useAuditLogs({ per_page: 100 });

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    toast.success(`Formulario enviado: ${formData.nombre} ${formData.apellido}`);
    console.log('Datos enviados:', formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Éxito</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">Alerta</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Info</Badge>;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const q = auditFilter.toLowerCase();
    const user = log.user?.name ?? '';
    const resource = log.model_type ?? '';
    return log.action.toLowerCase().includes(q) || user.toLowerCase().includes(q) || resource.toLowerCase().includes(q) || (log.description ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-primary">Módulo de Prueba</h1>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Beaker className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        {/* Botón de navegación a Reviews */}
        <Button 
          onClick={() => onNavigate?.('reviews')}
          variant="outline"
          className="gap-2 border-yellow-500/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
        >
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          Ir a Reseñas
        </Button>
      </div>
      
      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="forms">Formulario Básico</TabsTrigger>
          <TabsTrigger value="audit">Prototipo Auditoría</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="animate-in fade-in slide-in-from-left-2 duration-300">
          <p className="text-muted-foreground mb-4">
            Área de experimentación y pruebas de componentes básicos.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario */}
            <Card className="p-6 border-l-4 border-l-purple-500 shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                Formulario Básico
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input 
                      id="nombre"
                      name="nombre"
                      placeholder="Ej. Juan" 
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input 
                      id="apellido"
                      name="apellido"
                      placeholder="Ej. Pérez" 
                      value={formData.apellido}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4 mr-2" />
                  Procesar Datos
                </Button>
              </form>

              {(formData.nombre || formData.apellido) && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Vista Previa en Tiempo Real</p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                      {formData.nombre.charAt(0)}{formData.apellido.charAt(0)}
                    </div>
                    <p className="font-medium text-lg">
                      {formData.nombre} {formData.apellido}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Tarjetas Informativas */}
            <div className="space-y-6">
              <Card className="p-6 hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                <h3 className="font-bold text-lg mb-2">Estado del Componente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Este formulario utiliza <code>useState</code> para controlar los inputs de nombre y apellido.
                </p>
                <div className="flex gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 p-2 rounded">
                  <span className="text-purple-600">nombre:</span> "{formData.nombre}"
                  <br/>
                  <span className="text-purple-600">apellido:</span> "{formData.apellido}"
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all border-l-4 border-l-green-500">
                <h3 className="font-bold text-lg mb-2">Acciones Disponibles</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Al enviar el formulario, se ejecuta una validación simple y se muestra una notificación toast.
                </p>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" size="sm" onClick={() => setFormData({ nombre: 'Usuario', apellido: 'Prueba' })}>
                    Rellenar Automáticamente
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    onClick={() => onNavigate?.('reviews')}
                  >
                    <Star className="h-3 w-3" />
                    Probar Navegación a Reseñas
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Registro de Auditoría
                </h2>
                <p className="text-muted-foreground">
                  Monitoreo de actividades y cambios en el sistema (Mock Data).
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success('Lista actualizada')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Button variant="default" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Reporte
                </Button>
              </div>
            </div>

            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por acción, usuario o recurso..."
                    className="pl-9"
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los eventos</SelectItem>
                    <SelectItem value="security">Seguridad</SelectItem>
                    <SelectItem value="data">Datos</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <div className="w-full overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Acción</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Recurso</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Fecha/Hora</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              {log.action}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {log.user}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge variant="outline" className="font-normal">
                              {log.resource}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {log.timestamp}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {getStatusBadge(log.status)}
                          </td>
                          <td className="p-4 align-middle text-muted-foreground">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
