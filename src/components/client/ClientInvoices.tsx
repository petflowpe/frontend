import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useInvoices, Invoice } from '../../hooks/useInvoices';

const ESTADO_LABEL: Record<Invoice['estado'], string> = {
  pagada: 'Pagada',
  pendiente: 'Pendiente',
  vencida: 'Vencida',
  anulada: 'Anulada',
};

export function ClientInvoices() {
  const { invoices, loading, downloadInvoice } = useInvoices();
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleInvoice = (id: string) => {
    setExpandedInvoice(expandedInvoice === id ? null : id);
  };

  const getStatusColor = (label: string) => {
    switch (label) {
      case 'Pagada': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Anulada': return 'bg-red-100 text-red-800 border-red-200';
      case 'Vencida': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (label: string) => {
    switch (label) {
      case 'Pagada': return <CheckCircle className="w-4 h-4" />;
      case 'Pendiente': return <Clock className="w-4 h-4" />;
      case 'Anulada': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    String(inv.numero || '').includes(searchTerm) ||
    String(inv.serie || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Comprobantes</h2>
          <p className="text-slate-500 text-sm">Historial de facturas y boletas electrónicas</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar n° comprobante..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-700">No hay comprobantes</h3>
            <p className="text-slate-500 max-w-sm">
              No se encontraron comprobantes emitidos para tu cuenta.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="overflow-hidden transition-all hover:shadow-md border-slate-200">
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                onClick={() => toggleInvoice(invoice.id)}
              >
                {/* Icono y Tipo */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {invoice.serie}-{invoice.numero}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(invoice.serie || '').startsWith('F') ? 'Factura Electrónica' : 'Boleta Electrónica'}
                    </p>
                  </div>
                </div>

                {/* Fecha */}
                <div className="flex-1 md:text-center">
                  <p className="text-sm text-slate-500 mb-1">Fecha de Emisión</p>
                  <p className="font-medium text-slate-700">
                    {new Date(invoice.fecha).toLocaleDateString('es-PE', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Monto */}
                <div className="flex-1 md:text-center">
                  <p className="text-sm text-slate-500 mb-1">Monto Total</p>
                  <p className="font-bold text-slate-900">S/ {Number(invoice.total).toFixed(2)}</p>
                </div>

                {/* Estado */}
                <div className="min-w-[120px] flex justify-center">
                  <Badge variant="outline" className={`flex gap-1.5 py-1 px-3 ${getStatusColor(ESTADO_LABEL[invoice.estado])}`}>
                    {getStatusIcon(ESTADO_LABEL[invoice.estado])}
                    {ESTADO_LABEL[invoice.estado]}
                  </Badge>
                </div>

                {/* Botón Expandir */}
                <div className="hidden md:block">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {expandedInvoice === invoice.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Detalle Expandido */}
              <AnimatePresence>
                {expandedInvoice === invoice.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-5">
                      <h4 className="font-semibold text-sm text-slate-700 mb-3">Detalle del Comprobante</h4>
                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-4">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500">
                            <tr>
                              <th className="px-4 py-3 font-medium">Descripción</th>
                              <th className="px-4 py-3 font-medium text-center">Cant.</th>
                              <th className="px-4 py-3 font-medium text-right">P. Unit</th>
                              <th className="px-4 py-3 font-medium text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {invoice.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-slate-700">{item.descripcion}</td>
                                <td className="px-4 py-3 text-center text-slate-600">{item.cantidad}</td>
                                <td className="px-4 py-3 text-right text-slate-600">S/ {Number(item.precioUnitario).toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">S/ {Number(item.subtotal).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50">
                            <tr>
                              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-slate-700">Total a Pagar</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900">S/ {Number(invoice.total).toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice.id, 'XML')}>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar XML
                        </Button>
                        <Button size="sm" onClick={() => downloadInvoice(invoice.id, 'PDF')}>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
