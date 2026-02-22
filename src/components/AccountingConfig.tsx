import { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Save, Search } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { ACCOUNTING_ACCOUNTS_PERU, DEFAULT_ACCOUNTING_MAPPINGS, VOUCHER_TYPES_SUNAT, IGV_RATES_PERU } from '../config/accounting-peru';

export function AccountingConfig() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [accountMappings, setAccountMappings] = useState(DEFAULT_ACCOUNTING_MAPPINGS);

  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'Activo',
    parent: ''
  });

  // Convertir ACCOUNTING_ACCOUNTS_PERU a array para renderizado
  const accountsArray = Object.values(ACCOUNTING_ACCOUNTS_PERU);

  const filteredAccounts = accountsArray.filter((account: any) => 
    account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNewAccount = () => {
    // Aquí iría la lógica para guardar la cuenta
    console.log('Guardando nueva cuenta:', newAccount);
    setShowNewAccount(false);
    setNewAccount({ code: '', name: '', type: 'Activo', parent: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Plan Contable General Empresarial (PCGE)</h2>
          <p className="text-sm text-muted-foreground">Configuración de cuentas contables según normativa peruana</p>
        </div>
        <Dialog open={showNewAccount} onOpenChange={setShowNewAccount}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Cuenta Contable</DialogTitle>
              <DialogDescription>
                Crea una nueva cuenta según el Plan Contable General Empresarial.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account-code">Código *</Label>
                <Input
                  id="account-code"
                  value={newAccount.code}
                  onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                  placeholder="Ej: 1011"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-type">Tipo *</Label>
                <select
                  id="account-type"
                  className="w-full p-2 border rounded-md"
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                >
                  <option value="Activo">Activo</option>
                  <option value="Pasivo">Pasivo</option>
                  <option value="Patrimonio">Patrimonio</option>
                  <option value="Ingreso">Ingreso</option>
                  <option value="Gasto">Gasto</option>
                  <option value="Gasto Función">Gasto por Función</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="account-name">Nombre *</Label>
                <Input
                  id="account-name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="Ej: Caja MN"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="account-parent">Cuenta Padre (opcional)</Label>
                <Input
                  id="account-parent"
                  value={newAccount.parent}
                  onChange={(e) => setNewAccount({ ...newAccount, parent: e.target.value })}
                  placeholder="Ej: 101"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewAccount(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNewAccount}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mapeo de Cuentas por Operación */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5" />
          <h3 className="text-lg">Mapeo de Cuentas por Operación</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Define qué cuentas contables se usan automáticamente para cada tipo de operación
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* INGRESOS */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm border-b pb-2">Ingresos</h4>
            <div className="space-y-2">
              <Label htmlFor="services-account" className="text-sm">Servicios</Label>
              <select
                id="services-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.services}
                onChange={(e) => setAccountMappings({ ...accountMappings, services: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Ingreso')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-sales-account" className="text-sm">Venta de Productos</Label>
              <select
                id="product-sales-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.productSales}
                onChange={(e) => setAccountMappings({ ...accountMappings, productSales: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Ingreso')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-income-account" className="text-sm">Otros Ingresos</Label>
              <select
                id="other-income-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.otherIncome}
                onChange={(e) => setAccountMappings({ ...accountMappings, otherIncome: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Ingreso')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* GASTOS */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm border-b pb-2">Gastos Operativos</h4>
            <div className="space-y-2">
              <Label htmlFor="salaries-account" className="text-sm">Sueldos y Salarios</Label>
              <select
                id="salaries-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.salaries}
                onChange={(e) => setAccountMappings({ ...accountMappings, salaries: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Gasto')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance-account" className="text-sm">Mantenimiento</Label>
              <select
                id="maintenance-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.maintenance}
                onChange={(e) => setAccountMappings({ ...accountMappings, maintenance: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Gasto')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advertising-account" className="text-sm">Publicidad</Label>
              <select
                id="advertising-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.advertising}
                onChange={(e) => setAccountMappings({ ...accountMappings, advertising: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Gasto')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* ACTIVOS Y PASIVOS */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm border-b pb-2">Activos y Pasivos</h4>
            <div className="space-y-2">
              <Label htmlFor="cash-account" className="text-sm">Caja</Label>
              <select
                id="cash-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.cash}
                onChange={(e) => setAccountMappings({ ...accountMappings, cash: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Activo')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-account" className="text-sm">Banco</Label>
              <select
                id="bank-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.bank}
                onChange={(e) => setAccountMappings({ ...accountMappings, bank: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Activo')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="igv-account" className="text-sm">IGV</Label>
              <select
                id="igv-account"
                className="w-full p-2 border rounded-md text-sm"
                value={accountMappings.igv}
                onChange={(e) => setAccountMappings({ ...accountMappings, igv: e.target.value })}
              >
                {filteredAccounts
                  .filter((a: any) => a.type === 'Pasivo')
                  .map((account: any) => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </Card>

      {/* Lista de Cuentas del Plan Contable */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Plan Contable Completo</h3>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cuenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Código</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Cuenta Padre</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account: any, index: number) => (
                <tr 
                  key={account.code} 
                  className={`border-t hover:bg-muted/50 cursor-pointer ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  onClick={() => setSelectedAccount(account.code)}
                >
                  <td className="p-3 font-mono">{account.code}</td>
                  <td className="p-3">{account.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.type === 'Activo' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30' :
                      account.type === 'Pasivo' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30' :
                      account.type === 'Patrimonio' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30' :
                      account.type === 'Ingreso' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30' :
                      account.type === 'Gasto' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30' :
                      'bg-gray-500/20 text-gray-700 dark:text-gray-400 border border-gray-500/30'
                    }`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground font-mono">{account.parent || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Total: {filteredAccounts.length} cuentas contables
        </p>
      </Card>

      {/* Configuración de SUNAT */}
      <Card className="p-6">
        <h3 className="text-lg mb-4">Configuración SUNAT</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-sm border-b pb-2">Tasas de IGV</h4>
            {IGV_RATES_PERU.map((rate) => (
              <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{rate.label}</p>
                  <p className="text-sm text-muted-foreground">{rate.value}%</p>
                </div>
                {rate.active && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30 rounded text-xs">
                    Activo
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm border-b pb-2">Tipos de Comprobante</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {VOUCHER_TYPES_SUNAT.map((voucher) => (
                <div key={voucher.code} className="flex items-center gap-2 p-2 border rounded">
                  <span className="font-mono text-sm font-medium w-8">{voucher.code}</span>
                  <span className="text-sm">{voucher.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}