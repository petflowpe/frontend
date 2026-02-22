import { useState, useEffect } from 'react';
import { FileText, Send, Download, RefreshCw, FileCheck, BookOpen, FileX, Truck, Receipt, Plus, Building2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ElectronicInvoicing } from '../ElectronicInvoicing';
import { sunatService } from '../../services/sunatService';
import { useCompanies } from '../../hooks/useCompanies';
import { useBranches } from '../../hooks/useBranches';
import { useAuth } from '../../context/AuthContext';
import { useCreditNotes } from '../../hooks/useCreditNotes';
import { useDebitNotes } from '../../hooks/useDebitNotes';
import { useDailySummaries } from '../../hooks/useDailySummaries';
import { useVoidedDocuments } from '../../hooks/useVoidedDocuments';
import { useDispatchGuides } from '../../hooks/useDispatchGuides';
import { VoidedDocumentForm } from './VoidedDocumentForm';
import { DailySummaryForm } from './DailySummaryForm';
import { CreditNoteForm } from './CreditNoteForm';
import { DebitNoteForm } from './DebitNoteForm';
import { DispatchGuideForm } from './DispatchGuideForm';

function DocTableSunat({
  loading,
  onRefresh,
  columns,
  rows,
  emptyMessage,
  onSendSunat,
  onDownloadXml,
  onDownloadPdf,
  hasPdf = true,
}: {
  loading: boolean;
  onRefresh: () => void;
  columns: { key: string; label: string }[];
  rows: Record<string, any>[];
  emptyMessage: string;
  onSendSunat?: (id: string | number) => void;
  onDownloadXml?: (id: string | number) => void;
  onDownloadPdf?: (id: string | number) => void;
  hasPdf?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Listado</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{row[col.key] ?? '-'}</TableCell>
                  ))}
                  <TableCell className="text-right space-x-1">
                    {onSendSunat && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSendSunat(row.id)}
                        title="Enviar a SUNAT"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    {onDownloadXml && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadXml(row.id)}
                        title="Descargar XML"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {hasPdf && onDownloadPdf && (
                      <Button variant="outline" size="sm" onClick={() => onDownloadPdf(row.id)} title="Descargar PDF">
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function SunatFacturacionCompleta() {
  const [activeTab, setActiveTab] = useState('facturas-boletas');
  const [showVoidedForm, setShowVoidedForm] = useState(false);
  const [showDailySummaryForm, setShowDailySummaryForm] = useState(false);
  const [showCreditNoteForm, setShowCreditNoteForm] = useState(false);
  const [showDebitNoteForm, setShowDebitNoteForm] = useState(false);
  const [showDispatchGuideForm, setShowDispatchGuideForm] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [preferredVoidDoc, setPreferredVoidDoc] = useState<{ tipo_documento: string; serie: string; correlativo: string; fecha_referencia?: string } | null>(null);
  const [companyConfig, setCompanyConfig] = useState<{ ruc: string; razonSocial: string; oseProvider?: string } | null>(null);

  const { user } = useAuth();
  const { companies, loading: loadingCompanies } = useCompanies();
  const { branches, loading: loadingBranches } = useBranches(companyId);

  useEffect(() => {
    if (companies.length === 0 || companyId !== null) return;
    const userCompanyId = user?.companyId;
    if (userCompanyId != null && companies.some(c => c.id === userCompanyId)) {
      setCompanyId(userCompanyId);
    } else {
      setCompanyId(companies[0].id);
    }
  }, [companies, companyId, user?.companyId]);

  useEffect(() => {
    if (branches.length === 0) {
      setBranchId(null);
      return;
    }
    if (branchId !== null && branches.some(b => b.id === branchId)) return;
    const userBranchId = user?.branchId;
    if (userBranchId != null && branches.some(b => b.id === userBranchId)) {
      setBranchId(userBranchId);
    } else {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId, user?.branchId]);

  const creditNotes = useCreditNotes(companyId ?? 1, branchId ?? 1);
  const debitNotes = useDebitNotes(companyId ?? 1, branchId ?? 1);
  const dailySummaries = useDailySummaries(companyId ?? 1, branchId ?? 1);
  const voidedDocs = useVoidedDocuments(companyId ?? 1, branchId ?? 1);
  const dispatchGuides = useDispatchGuides(companyId ?? 1, branchId ?? 1);

  const creditNoteRows = creditNotes.list.map((d) => ({
    id: d.id,
    numero: d.numero_completo || `${d.serie}-${d.numero || ''}`,
    fecha: d.fecha_emision,
    doc_afectado: d.num_doc_afectado,
    cliente: d.client?.razon_social ?? '-',
    total: d.mto_imp_venta ?? d.total ?? '-',
    estado: d.estado_sunat ?? '-',
  }));

  const debitNoteRows = debitNotes.list.map((d) => ({
    id: d.id,
    numero: d.numero_completo || `${d.serie}-${d.numero || ''}`,
    fecha: d.fecha_emision,
    cliente: d.client?.razon_social ?? '-',
    total: d.mto_imp_venta ?? d.total ?? '-',
    estado: d.estado_sunat ?? '-',
  }));

  const dailySummaryRows = dailySummaries.list.map((d) => ({
    id: d.id,
    fecha: d.fecha_resumen,
    identificador: d.identificador ?? '-',
    estado: d.estado_sunat ?? d.estado_proceso ?? '-',
  }));

  const voidedRows = voidedDocs.list.map((d) => ({
    id: d.id,
    identificador: d.identificador ?? '-',
    fecha: d.fecha_emision,
    motivo: (d.motivo_baja || '').slice(0, 40),
    estado: d.estado_sunat ?? '-',
  }));

  const dispatchRows = dispatchGuides.list.map((d) => ({
    id: d.id,
    numero: d.numero_completo || `${d.serie}-${d.numero || ''}`,
    fecha: d.fecha_emision,
    destinatario: d.destinatario?.razon_social ?? '-',
    estado: d.estado_sunat ?? '-',
  }));

  const hasCompanyBranch = companyId != null && branchId != null;

  useEffect(() => {
    if (hasCompanyBranch && companyId != null && branchId != null) {
      sunatService.setCompanyBranch(companyId, branchId);
    }
  }, [hasCompanyBranch, companyId, branchId]);

  useEffect(() => {
    if (companyId == null) {
      setCompanyConfig(null);
      return;
    }
    sunatService.fetchCompanyConfig(companyId).then((config) => {
      setCompanyConfig(config ? { ruc: config.ruc, razonSocial: config.razonSocial, oseProvider: config.oseProvider } : null);
    }).catch(() => setCompanyConfig(null));
  }, [companyId]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Facturación SUNAT</h1>
        <p className="text-slate-500 text-sm">Facturas, boletas, notas de crédito/débito, resúmenes diarios, comunicaciones de baja y guías de remisión</p>
      </div>

      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label className="flex items-center gap-1"><Building2 className="w-4 h-4" /> Empresa</Label>
            <Select
              value={companyId?.toString() ?? ''}
              onValueChange={v => { setCompanyId(v ? parseInt(v, 10) : null); setBranchId(null); }}
              disabled={loadingCompanies || companies.length === 0}
            >
              <SelectTrigger><SelectValue placeholder={companies.length === 0 ? 'No hay empresas' : 'Seleccione empresa'} /></SelectTrigger>
              <SelectContent>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.razon_social} {c.ruc ? `(${c.ruc})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 min-w-[200px]">
            <Label className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Sucursal</Label>
            <Select
              value={branchId?.toString() ?? ''}
              onValueChange={v => setBranchId(v ? parseInt(v, 10) : null)}
              disabled={loadingBranches || !companyId || branches.length === 0}
            >
              <SelectTrigger><SelectValue placeholder={!companyId ? 'Primero seleccione empresa' : branches.length === 0 ? 'No hay sucursales' : 'Seleccione sucursal'} /></SelectTrigger>
              <SelectContent>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()}>{b.nombre} {b.codigo ? `(${b.codigo})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {companies.length === 0 && !loadingCompanies && (
          <p className="text-sm text-amber-600 mt-2">No hay empresas en la base de datos. Cree una empresa y sucursal para usar facturación SUNAT.</p>
        )}
      </Card>

      {!hasCompanyBranch && (
        <Card className="p-8 text-center text-muted-foreground">
          Seleccione una empresa y una sucursal para ver los comprobantes y crear nuevos.
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" style={{ display: hasCompanyBranch ? undefined : 'none' }}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
          <TabsTrigger value="facturas-boletas" className="gap-1">
            <Receipt className="w-4 h-4" />
            Facturas y Boletas
          </TabsTrigger>
          <TabsTrigger value="notas-credito" className="gap-1">
            <FileCheck className="w-4 h-4" />
            Notas de Crédito
          </TabsTrigger>
          <TabsTrigger value="notas-debito" className="gap-1">
            <FileText className="w-4 h-4" />
            Notas de Débito
          </TabsTrigger>
          <TabsTrigger value="resumenes" className="gap-1">
            <BookOpen className="w-4 h-4" />
            Resúmenes Diarios
          </TabsTrigger>
          <TabsTrigger value="comunicaciones-baja" className="gap-1">
            <FileX className="w-4 h-4" />
            Comunicaciones de Baja
          </TabsTrigger>
          <TabsTrigger value="guias" className="gap-1">
            <Truck className="w-4 h-4" />
            Guías de Remisión
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facturas-boletas" className="mt-4">
          <ElectronicInvoicing
            companyId={companyId ?? undefined}
            branchId={branchId ?? undefined}
            companyConfig={companyConfig}
            onAnular={(record) => {
              const correlativo = record.correlativo ?? record.numero ?? (record.numero_completo ? String(record.numero_completo).split('-').pop() : '') ?? '';
              setPreferredVoidDoc({
                tipo_documento: record.tipo_documento ?? '03',
                serie: record.serie ?? (record.numero_completo ? String(record.numero_completo).split('-')[0] : 'B001'),
                correlativo: String(correlativo),
                fecha_referencia: record.fecha_emision,
              });
              setActiveTab('comunicaciones-baja');
              setShowVoidedForm(true);
            }}
          />
        </TabsContent>

        <TabsContent value="notas-credito" className="mt-4">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setShowCreditNoteForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva nota de crédito
            </Button>
          </div>
          <DocTableSunat
            loading={creditNotes.loading}
            onRefresh={creditNotes.refresh}
            columns={[
              { key: 'numero', label: 'Número' },
              { key: 'fecha', label: 'Fecha' },
              { key: 'doc_afectado', label: 'Doc. Afectado' },
              { key: 'cliente', label: 'Cliente' },
              { key: 'total', label: 'Total' },
              { key: 'estado', label: 'Estado SUNAT' },
            ]}
            rows={creditNoteRows}
            emptyMessage="No hay notas de crédito. Use el botón superior para crear una."
            onSendSunat={creditNotes.sendToSunat}
            onDownloadXml={creditNotes.downloadXml}
            onDownloadPdf={creditNotes.downloadPdf}
          />
          <CreditNoteForm open={showCreditNoteForm} onOpenChange={setShowCreditNoteForm} onSuccess={creditNotes.refresh} companyId={companyId ?? 1} branchId={branchId ?? 1} />
        </TabsContent>

        <TabsContent value="notas-debito" className="mt-4">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setShowDebitNoteForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva nota de débito
            </Button>
          </div>
          <DocTableSunat
            loading={debitNotes.loading}
            onRefresh={debitNotes.refresh}
            columns={[
              { key: 'numero', label: 'Número' },
              { key: 'fecha', label: 'Fecha' },
              { key: 'cliente', label: 'Cliente' },
              { key: 'total', label: 'Total' },
              { key: 'estado', label: 'Estado SUNAT' },
            ]}
            rows={debitNoteRows}
            emptyMessage="No hay notas de débito. Use el botón superior para crear una."
            onSendSunat={debitNotes.sendToSunat}
            onDownloadXml={debitNotes.downloadXml}
            onDownloadPdf={debitNotes.downloadPdf}
          />
          <DebitNoteForm open={showDebitNoteForm} onOpenChange={setShowDebitNoteForm} onSuccess={debitNotes.refresh} companyId={companyId ?? 1} branchId={branchId ?? 1} />
        </TabsContent>

        <TabsContent value="resumenes" className="mt-4">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setShowDailySummaryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Generar resumen diario
            </Button>
          </div>
          <DocTableSunat
            loading={dailySummaries.loading}
            onRefresh={dailySummaries.refresh}
            columns={[
              { key: 'fecha', label: 'Fecha Resumen' },
              { key: 'identificador', label: 'Identificador' },
              { key: 'estado', label: 'Estado' },
            ]}
            rows={dailySummaryRows}
            emptyMessage="No hay resúmenes diarios. Use el botón superior para generar uno."
            onSendSunat={dailySummaries.sendToSunat}
            onDownloadXml={dailySummaries.downloadXml}
            onDownloadPdf={dailySummaries.downloadPdf}
          />
          <DailySummaryForm open={showDailySummaryForm} onOpenChange={setShowDailySummaryForm} onSuccess={dailySummaries.refresh} companyId={companyId ?? 1} branchId={branchId ?? 1} />
        </TabsContent>

        <TabsContent value="comunicaciones-baja" className="mt-4">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setShowVoidedForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva comunicación de baja
            </Button>
          </div>
          <DocTableSunat
            loading={voidedDocs.loading}
            onRefresh={voidedDocs.refresh}
            columns={[
              { key: 'identificador', label: 'Identificador' },
              { key: 'fecha', label: 'Fecha' },
              { key: 'motivo', label: 'Motivo' },
              { key: 'estado', label: 'Estado SUNAT' },
            ]}
            rows={voidedRows}
            emptyMessage="No hay comunicaciones de baja. Use el botón superior para crear una."
            onSendSunat={voidedDocs.sendToSunat}
            onDownloadXml={voidedDocs.downloadXml}
            hasPdf={false}
          />
          <VoidedDocumentForm
            open={showVoidedForm}
            onOpenChange={(open) => { setShowVoidedForm(open); if (!open) setPreferredVoidDoc(null); }}
            onSuccess={() => { voidedDocs.refresh(); setPreferredVoidDoc(null); }}
            companyId={companyId ?? 1}
            branchId={branchId ?? 1}
            preferredVoidDoc={preferredVoidDoc}
          />
        </TabsContent>

        <TabsContent value="guias" className="mt-4">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setShowDispatchGuideForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva guía de remisión
            </Button>
          </div>
          <DocTableSunat
            loading={dispatchGuides.loading}
            onRefresh={dispatchGuides.refresh}
            columns={[
              { key: 'numero', label: 'Número' },
              { key: 'fecha', label: 'Fecha' },
              { key: 'destinatario', label: 'Destinatario' },
              { key: 'estado', label: 'Estado SUNAT' },
            ]}
            rows={dispatchRows}
            emptyMessage="No hay guías de remisión. Use el botón superior para crear una."
            onSendSunat={dispatchGuides.sendToSunat}
            onDownloadXml={dispatchGuides.downloadXml}
            onDownloadPdf={dispatchGuides.downloadPdf}
          />
          <DispatchGuideForm open={showDispatchGuideForm} onOpenChange={setShowDispatchGuideForm} onSuccess={dispatchGuides.refresh} companyId={companyId ?? 1} branchId={branchId ?? 1} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
