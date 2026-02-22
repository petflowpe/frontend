import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Car,
  Users,
  Package,
  Fuel,
  Activity,
  BarChart3,
  Eye,
  Plus,
  CheckCircle,
  Book,
  FileText,
  Percent,
  Target,
  Award,
  Zap,
  Timer,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Lightbulb,
  TrendingUpIcon,
  AlertTriangle,
  Info,
  PieChart,
  LineChart,
  Signal
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

// Plan Contable Básico
const CHART_OF_ACCOUNTS = {
  '10': { code: '10', name: 'Efectivo y Equivalentes', type: 'asset', nature: 'debit' },
  '12': { code: '12', name: 'Cuentas por Cobrar', type: 'asset', nature: 'debit' },
  '20': { code: '20', name: 'Inventarios', type: 'asset', nature: 'debit' },
  '33': { code: '33', name: 'Vehículos', type: 'asset', nature: 'debit' },
  '39': { code: '39', name: 'Depreciación Acumulada', type: 'asset', nature: 'credit' },
  '40': { code: '40', name: 'IGV por Pagar', type: 'liability', nature: 'credit' },
  '42': { code: '42', name: 'Cuentas por Pagar', type: 'liability', nature: 'credit' },
  '50': { code: '50', name: 'Capital', type: 'equity', nature: 'credit' },
  '59': { code: '59', name: 'Resultados Acumulados', type: 'equity', nature: 'credit' },
  '63': { code: '63', name: 'Gastos de Servicios', type: 'expense', nature: 'debit' },
  '64': { code: '64', name: 'Gastos por Tributos', type: 'expense', nature: 'debit' },
  '65': { code: '65', name: 'Otros Gastos de Gestión', type: 'expense', nature: 'debit' },
  '68': { code: '68', name: 'Depreciación', type: 'expense', nature: 'debit' },
  '69': { code: '69', name: 'Costo de Ventas', type: 'expense', nature: 'debit' },
  '70': { code: '70', name: 'Ventas', type: 'revenue', nature: 'credit' },
  '94': { code: '94', name: 'Gastos Administrativos', type: 'expense', nature: 'debit' },
  '95': { code: '95', name: 'Gastos de Venta', type: 'expense', nature: 'debit' }
};

interface IncomeStatement {
  vehicleId: string;
  vehicleName: string;
  period: string;
  
  // Ingresos
  serviceRevenue: number;
  productRevenue: number;
  totalRevenue: number;
  
  // Costos Directos
  costOfServices: number;
  costOfProducts: number;
  totalDirectCosts: number;
  
  // Utilidad Bruta
  grossProfit: number;
  grossMargin: number;
  
  // Gastos Operativos
  fuelExpense: number;
  tollExpense: number;
  maintenanceExpense: number;
  suppliesExpense: number;
  laborExpense: number;
  depreciationExpense: number;
  otherExpenses: number;
  totalOperatingExpenses: number;
  
  // Utilidad Operativa
  operatingProfit: number;
  operatingMargin: number;
  
  // EBITDA
  ebitda: number;
  ebitdaMargin: number;
  
  // Métricas Adicionales
  appointmentsCompleted: number;
  kmTraveled: number;
  hoursWorked: number;
  revenuePerAppointment: number;
  revenuePerKm: number;
  revenuePerHour: number;
  costPerKm: number;
  costPerHour: number;
}

interface FinancialKPIs {
  // Rentabilidad
  roi: number; // Return on Investment
  roa: number; // Return on Assets
  netProfitMargin: number;
  
  // Eficiencia
  assetTurnover: number;
  revenuePerVehicle: number;
  costPerService: number;
  
  // Liquidez
  cashFlow: number;
  cashConversionCycle: number;
  
  // Crecimiento
  revenueGrowth: number;
  clientGrowth: number;
  appointmentGrowth: number;
}

interface OccupancyProjection {
  currentOccupancy: number;
  projectedOccupancy: number;
  seasonalFactor: number;
  trendFactor: number;
  capacityUtilization: number;
  recommendedAction: 'expand' | 'optimize' | 'maintain';
}

export function FinancialManagement() {
  const [activeTab, setActiveTab] = useState('income-statement');

  // Datos simulados de sesiones de caja (conectado con CashRegister)
  const vehicleSessions = [
    {
      vehicleId: 'VH001',
      vehicleName: 'Groomer Pro Max',
      vehiclePlate: 'ABC-123',
      sessions: 20, // últimos 30 días
      totalRevenue: 32450,
      serviceRevenue: 27580,
      productRevenue: 4870,
      directCosts: 12650,
      fuelCost: 3200,
      tollCost: 450,
      maintenanceCost: 850,
      suppliesCost: 680,
      laborCost: 8500, // 2 groomers
      otherCosts: 420,
      appointmentsCompleted: 185,
      kmTraveled: 2850,
      hoursWorked: 160,
      vehicleValue: 85000 // Valor del vehículo
    },
    {
      vehicleId: 'VH002',
      vehicleName: 'Mobile Grooming Plus',
      vehiclePlate: 'XYZ-789',
      sessions: 18,
      totalRevenue: 24680,
      serviceRevenue: 21200,
      productRevenue: 3480,
      directCosts: 9850,
      fuelCost: 2650,
      tollCost: 380,
      maintenanceCost: 620,
      suppliesCost: 520,
      laborCost: 7200,
      otherCosts: 320,
      appointmentsCompleted: 142,
      kmTraveled: 2280,
      hoursWorked: 144,
      vehicleValue: 72000
    }
  ];

  // Datos históricos de clientes para proyecciones
  const clientData = {
    totalClients: 847,
    activeClients: 623,
    newClientsLastMonth: 42,
    avgAppointmentsPerClient: 2.3,
    clientGrowthRate: 0.068, // 6.8% mensual
    seasonalPatterns: {
      high: [11, 12, 1, 2], // Nov, Dic, Ene, Feb (verano)
      medium: [3, 4, 9, 10],
      low: [5, 6, 7, 8]
    }
  };

  // Calcular Estado de Resultados por Vehículo
  const calculateIncomeStatement = (vehicle: typeof vehicleSessions[0]): IncomeStatement => {
    const totalRevenue = vehicle.totalRevenue;
    const totalDirectCosts = vehicle.directCosts;
    const grossProfit = totalRevenue - totalDirectCosts;
    const grossMargin = (grossProfit / totalRevenue) * 100;

    const totalOperatingExpenses = 
      vehicle.fuelCost + 
      vehicle.tollCost + 
      vehicle.maintenanceCost + 
      vehicle.suppliesCost + 
      vehicle.laborCost + 
      vehicle.otherCosts;

    const depreciationExpense = (vehicle.vehicleValue * 0.20) / 12; // 20% anual
    const totalExpenses = totalOperatingExpenses + depreciationExpense;

    const operatingProfit = grossProfit - totalExpenses;
    const operatingMargin = (operatingProfit / totalRevenue) * 100;

    const ebitda = operatingProfit + depreciationExpense;
    const ebitdaMargin = (ebitda / totalRevenue) * 100;

    return {
      vehicleId: vehicle.vehicleId,
      vehicleName: vehicle.vehicleName,
      period: 'Últimos 30 días',
      
      serviceRevenue: vehicle.serviceRevenue,
      productRevenue: vehicle.productRevenue,
      totalRevenue: totalRevenue,
      
      costOfServices: totalDirectCosts * 0.7,
      costOfProducts: totalDirectCosts * 0.3,
      totalDirectCosts: totalDirectCosts,
      
      grossProfit: grossProfit,
      grossMargin: grossMargin,
      
      fuelExpense: vehicle.fuelCost,
      tollExpense: vehicle.tollCost,
      maintenanceExpense: vehicle.maintenanceCost,
      suppliesExpense: vehicle.suppliesCost,
      laborExpense: vehicle.laborCost,
      depreciationExpense: depreciationExpense,
      otherExpenses: vehicle.otherCosts,
      totalOperatingExpenses: totalExpenses,
      
      operatingProfit: operatingProfit,
      operatingMargin: operatingMargin,
      
      ebitda: ebitda,
      ebitdaMargin: ebitdaMargin,
      
      appointmentsCompleted: vehicle.appointmentsCompleted,
      kmTraveled: vehicle.kmTraveled,
      hoursWorked: vehicle.hoursWorked,
      revenuePerAppointment: totalRevenue / vehicle.appointmentsCompleted,
      revenuePerKm: totalRevenue / vehicle.kmTraveled,
      revenuePerHour: totalRevenue / vehicle.hoursWorked,
      costPerKm: totalExpenses / vehicle.kmTraveled,
      costPerHour: totalExpenses / vehicle.hoursWorked
    };
  };

  // Calcular KPIs Financieros Consolidados
  const calculateFinancialKPIs = (): FinancialKPIs => {
    const totalRevenue = vehicleSessions.reduce((sum, v) => sum + v.totalRevenue, 0);
    const totalCosts = vehicleSessions.reduce((sum, v) => 
      sum + v.directCosts + v.fuelCost + v.tollCost + v.maintenanceCost + 
      v.suppliesCost + v.laborCost + v.otherCosts, 0
    );
    const totalAssets = vehicleSessions.reduce((sum, v) => sum + v.vehicleValue, 0) + 25000; // + inventario
    const netProfit = totalRevenue - totalCosts;

    // Datos del mes anterior para comparar
    const lastMonthRevenue = totalRevenue * 0.92; // Simulado
    const lastMonthClients = clientData.totalClients - clientData.newClientsLastMonth;
    const lastMonthAppointments = vehicleSessions.reduce((sum, v) => sum + v.appointmentsCompleted, 0) * 0.95;

    return {
      roi: (netProfit / totalAssets) * 100,
      roa: (netProfit / totalAssets) * 100,
      netProfitMargin: (netProfit / totalRevenue) * 100,
      
      assetTurnover: totalRevenue / totalAssets,
      revenuePerVehicle: totalRevenue / vehicleSessions.length,
      costPerService: totalCosts / vehicleSessions.reduce((sum, v) => sum + v.appointmentsCompleted, 0),
      
      cashFlow: netProfit + (vehicleSessions.reduce((sum, v) => sum + (v.vehicleValue * 0.20) / 12, 0)),
      cashConversionCycle: 15, // días promedio
      
      revenueGrowth: ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
      clientGrowth: ((clientData.totalClients - lastMonthClients) / lastMonthClients) * 100,
      appointmentGrowth: ((vehicleSessions.reduce((sum, v) => sum + v.appointmentsCompleted, 0) - lastMonthAppointments) / lastMonthAppointments) * 100
    };
  };

  // Proyección de Ocupación y Recomendación de Expansión
  const calculateOccupancyProjection = (): OccupancyProjection & { 
    recommendation: string; 
    estimatedROI: number;
    breakEvenMonths: number;
    projectedRevenue: number;
  } => {
    const currentMonth = new Date().getMonth() + 1;
    const totalCapacity = vehicleSessions.length * 10 * 22; // vehículos * citas/día * días/mes
    const currentAppointments = vehicleSessions.reduce((sum, v) => sum + v.appointmentsCompleted, 0);
    const currentOccupancy = (currentAppointments / totalCapacity) * 100;

    // Factor estacional
    const isHighSeason = clientData.seasonalPatterns.high.includes(currentMonth);
    const isMediumSeason = clientData.seasonalPatterns.medium.includes(currentMonth);
    const seasonalFactor = isHighSeason ? 1.25 : isMediumSeason ? 1.0 : 0.85;

    // Tendencia de crecimiento
    const trendFactor = 1 + clientData.clientGrowthRate;

    // Proyección de ocupación en 3 meses
    const projectedOccupancy = currentOccupancy * seasonalFactor * Math.pow(trendFactor, 3);

    // Capacidad utilizada
    const capacityUtilization = currentOccupancy;

    // Lógica de recomendación
    let recommendedAction: 'expand' | 'optimize' | 'maintain';
    let recommendation = '';
    let estimatedROI = 0;
    let breakEvenMonths = 0;
    let projectedRevenue = 0;

    if (projectedOccupancy > 85) {
      recommendedAction = 'expand';
      
      // Cálculo de ROI para nuevo vehículo
      const avgRevenuePerVehicle = vehicleSessions.reduce((sum, v) => sum + v.totalRevenue, 0) / vehicleSessions.length;
      const avgCostsPerVehicle = vehicleSessions.reduce((sum, v) => 
        sum + v.directCosts + v.fuelCost + v.tollCost + v.maintenanceCost + 
        v.suppliesCost + v.laborCost + v.otherCosts, 0
      ) / vehicleSessions.length;
      
      const newVehicleInvestment = 75000; // Costo del vehículo + equipamiento
      const monthlyProfit = avgRevenuePerVehicle - avgCostsPerVehicle;
      
      estimatedROI = (monthlyProfit * 12 / newVehicleInvestment) * 100;
      breakEvenMonths = Math.ceil(newVehicleInvestment / monthlyProfit);
      projectedRevenue = avgRevenuePerVehicle * 0.8; // 80% en los primeros meses

      recommendation = `🚀 RECOMENDACIÓN: EXPANSIÓN INMEDIATA
      
Tu capacidad actual está al ${currentOccupancy.toFixed(1)}% y se proyecta al ${projectedOccupancy.toFixed(1)}% en 3 meses.

📊 ANÁLISIS DE NUEVO VEHÍCULO:
• Inversión requerida: S/ ${newVehicleInvestment.toLocaleString()}
• ROI proyectado: ${estimatedROI.toFixed(1)}% anual
• Punto de equilibrio: ${breakEvenMonths} meses
• Ingresos mensuales estimados: S/ ${projectedRevenue.toFixed(0)}
• Utilidad mensual estimada: S/ ${monthlyProfit.toFixed(0)}

💡 OPORTUNIDAD: Con ${clientData.newClientsLastMonth} nuevos clientes/mes y crecimiento del ${(clientData.clientGrowthRate * 100).toFixed(1)}%, 
un tercer vehículo se pagará solo en ${breakEvenMonths} meses y generará S/ ${(monthlyProfit * 12).toFixed(0)} anuales adicionales.

🎯 SIGUIENTE PASO: Asegurar financiamiento y comenzar búsqueda de tripulación.`;

    } else if (projectedOccupancy > 70) {
      recommendedAction = 'optimize';
      recommendation = `⚡ RECOMENDACIÓN: OPTIMIZAR OPERACIONES

Tu capacidad está al ${currentOccupancy.toFixed(1)}%, aún hay espacio antes de expandir.

💡 ACCIONES RECOMENDADAS:
• Optimizar rutas para atender más citas por día
• Implementar campañas de marketing para aumentar ocupación
• Ofrecer promociones en días/horarios de baja demanda
• Mejorar tasa de retención de clientes existentes

📈 META: Alcanzar 85% de ocupación sostenida antes de invertir en nuevo vehículo.`;

    } else {
      recommendedAction = 'maintain';
      recommendation = `✅ RECOMENDACIÓN: MANTENER OPERACIÓN ACTUAL

Tu capacidad está al ${currentOccupancy.toFixed(1)}%, hay margen para crecer con flota actual.

💡 ENFOQUE EN:
• Aumentar frecuencia de visitas de clientes actuales
• Expandir servicios adicionales (productos, planes)
• Mejorar eficiencia operativa
• Reducir costos variables

⏳ No es momento de expandir flota, enfócate en rentabilizar vehículos actuales.`;
    }

    return {
      currentOccupancy,
      projectedOccupancy,
      seasonalFactor,
      trendFactor,
      capacityUtilization,
      recommendedAction,
      recommendation,
      estimatedROI,
      breakEvenMonths,
      projectedRevenue
    };
  };

  const incomeStatements = vehicleSessions.map(calculateIncomeStatement);
  const kpis = calculateFinancialKPIs();
  const occupancyProjection = calculateOccupancyProjection();

  // Consolidado de todos los vehículos
  const consolidatedStatement: IncomeStatement = {
    vehicleId: 'CONSOLIDATED',
    vehicleName: 'Consolidado',
    period: 'Últimos 30 días',
    
    serviceRevenue: incomeStatements.reduce((sum, s) => sum + s.serviceRevenue, 0),
    productRevenue: incomeStatements.reduce((sum, s) => sum + s.productRevenue, 0),
    totalRevenue: incomeStatements.reduce((sum, s) => sum + s.totalRevenue, 0),
    
    costOfServices: incomeStatements.reduce((sum, s) => sum + s.costOfServices, 0),
    costOfProducts: incomeStatements.reduce((sum, s) => sum + s.costOfProducts, 0),
    totalDirectCosts: incomeStatements.reduce((sum, s) => sum + s.totalDirectCosts, 0),
    
    grossProfit: incomeStatements.reduce((sum, s) => sum + s.grossProfit, 0),
    grossMargin: 0, // Se calcula después
    
    fuelExpense: incomeStatements.reduce((sum, s) => sum + s.fuelExpense, 0),
    tollExpense: incomeStatements.reduce((sum, s) => sum + s.tollExpense, 0),
    maintenanceExpense: incomeStatements.reduce((sum, s) => sum + s.maintenanceExpense, 0),
    suppliesExpense: incomeStatements.reduce((sum, s) => sum + s.suppliesExpense, 0),
    laborExpense: incomeStatements.reduce((sum, s) => sum + s.laborExpense, 0),
    depreciationExpense: incomeStatements.reduce((sum, s) => sum + s.depreciationExpense, 0),
    otherExpenses: incomeStatements.reduce((sum, s) => sum + s.otherExpenses, 0),
    totalOperatingExpenses: incomeStatements.reduce((sum, s) => sum + s.totalOperatingExpenses, 0),
    
    operatingProfit: incomeStatements.reduce((sum, s) => sum + s.operatingProfit, 0),
    operatingMargin: 0,
    
    ebitda: incomeStatements.reduce((sum, s) => sum + s.ebitda, 0),
    ebitdaMargin: 0,
    
    appointmentsCompleted: incomeStatements.reduce((sum, s) => sum + s.appointmentsCompleted, 0),
    kmTraveled: incomeStatements.reduce((sum, s) => sum + s.kmTraveled, 0),
    hoursWorked: incomeStatements.reduce((sum, s) => sum + s.hoursWorked, 0),
    revenuePerAppointment: 0,
    revenuePerKm: 0,
    revenuePerHour: 0,
    costPerKm: 0,
    costPerHour: 0
  };

  // Recalcular márgenes consolidados
  consolidatedStatement.grossMargin = (consolidatedStatement.grossProfit / consolidatedStatement.totalRevenue) * 100;
  consolidatedStatement.operatingMargin = (consolidatedStatement.operatingProfit / consolidatedStatement.totalRevenue) * 100;
  consolidatedStatement.ebitdaMargin = (consolidatedStatement.ebitda / consolidatedStatement.totalRevenue) * 100;
  consolidatedStatement.revenuePerAppointment = consolidatedStatement.totalRevenue / consolidatedStatement.appointmentsCompleted;
  consolidatedStatement.revenuePerKm = consolidatedStatement.totalRevenue / consolidatedStatement.kmTraveled;
  consolidatedStatement.revenuePerHour = consolidatedStatement.totalRevenue / consolidatedStatement.hoursWorked;
  consolidatedStatement.costPerKm = consolidatedStatement.totalOperatingExpenses / consolidatedStatement.kmTraveled;
  consolidatedStatement.costPerHour = consolidatedStatement.totalOperatingExpenses / consolidatedStatement.hoursWorked;

  const renderIncomeStatement = (statement: IncomeStatement) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{statement.vehicleName}</h3>
          <p className="text-sm text-muted-foreground">{statement.period}</p>
        </div>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Ingresos */}
          <div>
            <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              INGRESOS
            </h4>
            <div className="pl-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">70 - Servicios de Grooming</span>
                <span className="font-medium">S/ {statement.serviceRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">70 - Venta de Productos</span>
                <span className="font-medium">S/ {statement.productRevenue.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-green-600">
                <span>TOTAL INGRESOS</span>
                <span>S/ {statement.totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Costos Directos */}
          <div>
            <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              COSTOS DIRECTOS
            </h4>
            <div className="pl-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">69 - Costo de Servicios</span>
                <span className="font-medium">S/ ({statement.costOfServices.toFixed(2)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">69 - Costo de Productos</span>
                <span className="font-medium">S/ ({statement.costOfProducts.toFixed(2)})</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-red-600">
                <span>TOTAL COSTOS DIRECTOS</span>
                <span>S/ ({statement.totalDirectCosts.toFixed(2)})</span>
              </div>
            </div>
          </div>

          <Card className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">UTILIDAD BRUTA</p>
                <p className="text-2xl font-bold text-emerald-600">S/ {statement.grossProfit.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Margen Bruto</p>
                <p className="text-2xl font-bold text-emerald-600">{statement.grossMargin.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Separator className="my-4" />

          {/* Gastos Operativos */}
          <div>
            <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              GASTOS OPERATIVOS
            </h4>
            <div className="pl-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">63 - Combustible</span>
                <span className="font-medium">S/ ({statement.fuelExpense.toFixed(2)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">63 - Peajes</span>
                <span className="font-medium">S/ ({statement.tollExpense.toFixed(2)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">65 - Mantenimiento</span>
                <span className="font-medium">S/ ({statement.maintenanceExpense.toFixed(2)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">63 - Suministros</span>
                <span className="font-medium">S/ ({statement.suppliesExpense.toFixed(2)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">62 - Mano de Obra Directa</span>
                <span className="font-medium">S/ ({statement.laborExpense.toFixed(2)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">68 - Depreciación Vehículo</span>
                <span className="font-medium">S/ ({statement.depreciationExpense.toFixed(2)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">65 - Otros Gastos</span>
                <span className="font-medium">S/ ({statement.otherExpenses.toFixed(2)})</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-orange-600">
                <span>TOTAL GASTOS OPERATIVOS</span>
                <span>S/ ({statement.totalOperatingExpenses.toFixed(2)})</span>
              </div>
            </div>
          </div>

          <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">UTILIDAD OPERATIVA</p>
                <p className="text-2xl font-bold text-blue-600">S/ {statement.operatingProfit.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Margen Operativo</p>
                <p className="text-2xl font-bold text-blue-600">{statement.operatingMargin.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">EBITDA</p>
                <p className="text-xs text-muted-foreground">(Utilidad antes de Intereses, Impuestos, Depreciación y Amortización)</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">S/ {statement.ebitda.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Margen EBITDA</p>
                <p className="text-2xl font-bold text-purple-600">{statement.ebitdaMargin.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          {/* Métricas de Eficiencia */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Ingreso por Cita</p>
              <p className="text-xl font-bold text-green-600">S/ {statement.revenuePerAppointment.toFixed(0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Ingreso por KM</p>
              <p className="text-xl font-bold text-blue-600">S/ {statement.revenuePerKm.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Ingreso por Hora</p>
              <p className="text-xl font-bold text-purple-600">S/ {statement.revenuePerHour.toFixed(0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Costo por KM</p>
              <p className="text-xl font-bold text-orange-600">S/ {statement.costPerKm.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Citas Completadas</p>
              <p className="text-xl font-bold">{ statement.appointmentsCompleted}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">KM Recorridos</p>
              <p className="text-xl font-bold">{statement.kmTraveled}</p>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
          📊 Gestión Financiera
        </h1>
        <p className="text-muted-foreground text-lg mt-1">
          Estados financieros, KPIs y análisis predictivo
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Percent className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-green-700 dark:text-green-300">ROI</p>
              <p className="text-xl font-bold text-green-800 dark:text-green-200">{kpis.roi.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-300">Margen Neto</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{kpis.netProfitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUpIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-700 dark:text-purple-300">Crec. Ingresos</p>
              <p className="text-xl font-bold text-purple-800 dark:text-purple-200">+{kpis.revenueGrowth.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-orange-700 dark:text-orange-300">Crec. Clientes</p>
              <p className="text-xl font-bold text-orange-800 dark:text-orange-200">+{kpis.clientGrowth.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950 dark:to-rose-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-pink-700 dark:text-pink-300">Flujo de Caja</p>
              <p className="text-xl font-bold text-pink-800 dark:text-pink-200">S/ {(kpis.cashFlow / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-950 dark:to-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-teal-700 dark:text-teal-300">ROA</p>
              <p className="text-xl font-bold text-teal-800 dark:text-teal-200">{kpis.roa.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerta de Recomendación de Expansión */}
      {occupancyProjection.recommendedAction === 'expand' && (
        <Alert className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-300 font-bold">
            ¡Oportunidad de Expansión Detectada!
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400 whitespace-pre-line">
            {occupancyProjection.recommendation}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="income-statement">
            📋 Estado de Resultados
          </TabsTrigger>
          <TabsTrigger value="kpis">
            📊 KPIs Financieros
          </TabsTrigger>
          <TabsTrigger value="projection">
            🔮 Proyecciones
          </TabsTrigger>
          <TabsTrigger value="accounting">
            📚 Integración Contable
          </TabsTrigger>
        </TabsList>

        {/* Estado de Resultados */}
        <TabsContent value="income-statement" className="space-y-6">
          {/* Consolidado */}
          <Card className="p-6 border-2 border-blue-200 dark:border-blue-800">
            {renderIncomeStatement(consolidatedStatement)}
          </Card>

          {/* Por Vehículo */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Estado de Resultados por Vehículo</h3>
            {incomeStatements.map((statement) => (
              <Card key={statement.vehicleId} className="p-6">
                {renderIncomeStatement(statement)}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* KPIs Financieros */}
        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Rentabilidad */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Rentabilidad
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">ROI (Return on Investment)</span>
                    <span className="font-bold text-green-600">{kpis.roi.toFixed(2)}%</span>
                  </div>
                  <Progress value={Math.min(kpis.roi, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Excelente ✅ Meta: &gt;15% | Actual: {kpis.roi.toFixed(1)}%
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">ROA (Return on Assets)</span>
                    <span className="font-bold text-blue-600">{kpis.roa.toFixed(2)}%</span>
                  </div>
                  <Progress value={Math.min(kpis.roa, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpis.roa > 12 ? 'Excelente ✅' : kpis.roa > 8 ? 'Bueno 👍' : 'Mejorable ⚠️'}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Margen de Utilidad Neta</span>
                    <span className="font-bold text-purple-600">{kpis.netProfitMargin.toFixed(2)}%</span>
                  </div>
                  <Progress value={kpis.netProfitMargin} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpis.netProfitMargin > 20 ? 'Excelente ✅' : kpis.netProfitMargin > 15 ? 'Bueno 👍' : 'Mejorable ⚠️'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Eficiencia */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Eficiencia Operativa
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Rotación de Activos</span>
                    <span className="font-bold text-orange-600">{kpis.assetTurnover.toFixed(2)}x</span>
                  </div>
                  <Progress value={Math.min(kpis.assetTurnover * 25, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Veces que los activos generan su valor en ingresos
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Ingreso por Vehículo</span>
                    <span className="font-bold text-blue-600">S/ {kpis.revenuePerVehicle.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Promedio mensual por unidad
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Costo por Servicio</span>
                    <span className="font-bold text-red-600">S/ {kpis.costPerService.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Costo operativo promedio por cita
                  </p>
                </div>
              </div>
            </Card>

            {/* Crecimiento */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600" />
                Crecimiento
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Crecimiento de Ingresos (MoM)</span>
                    <span className={`font-bold ${kpis.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.revenueGrowth > 0 ? '+' : ''}{kpis.revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(Math.abs(kpis.revenueGrowth) * 10, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mes sobre mes (Month over Month)
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Crecimiento de Clientes</span>
                    <span className="font-bold text-green-600">+{kpis.clientGrowth.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(kpis.clientGrowth * 10, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {clientData.newClientsLastMonth} nuevos clientes este mes
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Crecimiento de Citas</span>
                    <span className="font-bold text-blue-600">+{kpis.appointmentGrowth.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(kpis.appointmentGrowth * 10, 100)} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Liquidez */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Liquidez y Flujo de Caja
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Flujo de Caja Operativo</span>
                    <span className="font-bold text-green-600">S/ {kpis.cashFlow.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Efectivo generado por operaciones
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Ciclo de Conversión de Efectivo</span>
                    <span className="font-bold text-blue-600">{kpis.cashConversionCycle} días</span>
                  </div>
                  <Progress value={(30 - kpis.cashConversionCycle) * 3} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpis.cashConversionCycle < 20 ? 'Excelente ✅' : kpis.cashConversionCycle < 30 ? 'Bueno 👍' : 'Mejorable ⚠️'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Comparativa de Vehículos */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Comparativa de Rentabilidad por Vehículo</h3>
            <div className="space-y-4">
              {incomeStatements.map((statement, idx) => {
                const maxOperatingProfit = Math.max(...incomeStatements.map(s => s.operatingProfit));
                const percentage = (statement.operatingProfit / maxOperatingProfit) * 100;
                
                return (
                  <div key={statement.vehicleId}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{statement.vehicleName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {statement.appointmentsCompleted} citas • {statement.kmTraveled} km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">S/ {statement.operatingProfit.toFixed(0)}</p>
                        <p className="text-sm text-muted-foreground">Margen: {statement.operatingMargin.toFixed(1)}%</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Proyecciones */}
        <TabsContent value="projection" className="space-y-6">
          {/* Análisis de Ocupación */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Signal className="h-5 w-5 text-purple-600" />
              Análisis de Capacidad y Ocupación
            </h3>
            
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">Ocupación Actual</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{occupancyProjection.currentOccupancy.toFixed(1)}%</p>
                <Progress value={occupancyProjection.currentOccupancy} className="h-2 mt-2" />
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900">
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">Proyección 3 Meses</p>
                <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">{occupancyProjection.projectedOccupancy.toFixed(1)}%</p>
                <Progress value={Math.min(occupancyProjection.projectedOccupancy, 100)} className="h-2 mt-2" />
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">Factor de Crecimiento</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-200">{((occupancyProjection.trendFactor - 1) * 100).toFixed(1)}%</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Mensual</p>
              </Card>
            </div>

            <Alert className={
              occupancyProjection.recommendedAction === 'expand' 
                ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                : occupancyProjection.recommendedAction === 'optimize'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
            }>
              <Info className="h-4 w-4" />
              <AlertTitle>Análisis de Temporada</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  Factor estacional: <strong>{(occupancyProjection.seasonalFactor * 100).toFixed(0)}%</strong>
                </p>
                <p className="text-sm">
                  {occupancyProjection.seasonalFactor > 1.1 
                    ? '🔥 Estás en temporada ALTA. Aprovecha para maximizar ingresos.'
                    : occupancyProjection.seasonalFactor < 0.9
                    ? '❄️ Estás en temporada BAJA. Considera promociones para mantener ocupación.'
                    : '☀️ Temporada MEDIA. Operación normal.'}
                </p>
              </AlertDescription>
            </Alert>
          </Card>

          {/* ROI de Nuevo Vehículo */}
          {occupancyProjection.recommendedAction === 'expand' && (
            <Card className="p-6 border-2 border-green-500">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-green-600" />
                Análisis Financiero: Nuevo Vehículo
              </h3>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">ROI Anual</p>
                  <p className="text-2xl font-bold text-green-600">{occupancyProjection.estimatedROI.toFixed(1)}%</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Break-Even</p>
                  <p className="text-2xl font-bold text-blue-600">{occupancyProjection.breakEvenMonths} meses</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Ingresos/Mes</p>
                  <p className="text-2xl font-bold text-purple-600">S/ {(occupancyProjection.projectedRevenue / 1000).toFixed(0)}K</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Inversión</p>
                  <p className="text-2xl font-bold text-orange-600">S/ 75K</p>
                </Card>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Momento Óptimo para Expansión</p>
                    <p className="text-sm text-muted-foreground">
                      Tu ocupación proyectada ({occupancyProjection.projectedOccupancy.toFixed(0)}%) indica saturación de capacidad
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Alta Rentabilidad Proyectada</p>
                    <p className="text-sm text-muted-foreground">
                      ROI de {occupancyProjection.estimatedROI.toFixed(1)}% es superior al promedio del sector (15-20%)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Recuperación Rápida</p>
                    <p className="text-sm text-muted-foreground">
                      Inversión se recupera en {occupancyProjection.breakEvenMonths} meses (menor a 12 meses recomendado)
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Proyección de Ingresos */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Proyección de Ingresos (Próximos 6 Meses)
            </h3>
            
            <div className="grid grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((month) => {
                const baseRevenue = consolidatedStatement.totalRevenue;
                const growth = Math.pow(1 + clientData.clientGrowthRate, month);
                const seasonal = month <= 2 ? 1.15 : month >= 5 ? 0.9 : 1.0;
                const projected = baseRevenue * growth * seasonal;
                
                return (
                  <Card key={month} className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Mes +{month}</p>
                    <p className="text-lg font-bold text-blue-600">S/ {(projected / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-green-600">+{((growth * seasonal - 1) * 100).toFixed(0)}%</p>
                  </Card>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Integración Contable */}
        <TabsContent value="accounting" className="space-y-6">
          <Alert>
            <Book className="h-4 w-4" />
            <AlertTitle>Integración con Módulo de Contabilidad</AlertTitle>
            <AlertDescription>
              Todos los ingresos y gastos del Cierre de Caja generan automáticamente asientos contables
            </AlertDescription>
          </Alert>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Asientos Contables Generados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ejemplo de asientos que se generan automáticamente al cerrar caja de un vehículo:
            </p>

            <div className="space-y-4">
              {/* Asiento de Ingresos */}
              <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200">
                <h4 className="font-semibold mb-3">Asiento: Ingresos por Servicios</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-semibold">Cuenta</div>
                  <div className="font-semibold text-right">Debe</div>
                  <div className="font-semibold text-right">Haber</div>
                  
                  <div className="col-span-3"><Separator /></div>
                  
                  <div>10 - Efectivo y Equivalentes</div>
                  <div className="text-right font-mono">15,220.00</div>
                  <div className="text-right">-</div>
                  
                  <div>12 - Cuentas por Cobrar (Tarjeta)</div>
                  <div className="text-right font-mono">3,850.00</div>
                  <div className="text-right">-</div>
                  
                  <div>70 - Ventas - Servicios</div>
                  <div className="text-right">-</div>
                  <div className="text-right font-mono">16,200.00</div>
                  
                  <div>40 - IGV por Pagar (18%)</div>
                  <div className="text-right">-</div>
                  <div className="text-right font-mono">2,916.00</div>
                </div>
              </Card>

              {/* Asiento de Costos */}
              <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-red-200">
                <h4 className="font-semibold mb-3">Asiento: Costos de Ventas</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-semibold">Cuenta</div>
                  <div className="font-semibold text-right">Debe</div>
                  <div className="font-semibold text-right">Haber</div>
                  
                  <div className="col-span-3"><Separator /></div>
                  
                  <div>69 - Costo de Ventas</div>
                  <div className="text-right font-mono">12,650.00</div>
                  <div className="text-right">-</div>
                  
                  <div>20 - Inventarios</div>
                  <div className="text-right">-</div>
                  <div className="text-right font-mono">12,650.00</div>
                </div>
              </Card>

              {/* Asiento de Gastos Operativos */}
              <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200">
                <h4 className="font-semibold mb-3">Asiento: Gastos Operativos del Vehículo</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-semibold">Cuenta</div>
                  <div className="font-semibold text-right">Debe</div>
                  <div className="font-semibold text-right">Haber</div>
                  
                  <div className="col-span-3"><Separator /></div>
                  
                  <div>63 - Combustible</div>
                  <div className="text-right font-mono">3,200.00</div>
                  <div className="text-right">-</div>
                  
                  <div>63 - Peajes</div>
                  <div className="text-right font-mono">450.00</div>
                  <div className="text-right">-</div>
                  
                  <div>65 - Mantenimiento</div>
                  <div className="text-right font-mono">850.00</div>
                  <div className="text-right">-</div>
                  
                  <div>63 - Suministros</div>
                  <div className="text-right font-mono">680.00</div>
                  <div className="text-right">-</div>
                  
                  <div>62 - Sueldos y Salarios</div>
                  <div className="text-right font-mono">8,500.00</div>
                  <div className="text-right">-</div>
                  
                  <div>68 - Depreciación</div>
                  <div className="text-right font-mono">1,417.00</div>
                  <div className="text-right">-</div>
                  
                  <div>10 - Efectivo (Pagos)</div>
                  <div className="text-right">-</div>
                  <div className="text-right font-mono">13,680.00</div>
                  
                  <div>39 - Depreciación Acumulada</div>
                  <div className="text-right">-</div>
                  <div className="text-right font-mono">1,417.00</div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Mapeo de Cuentas */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Plan Contable Utilizado</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(CHART_OF_ACCOUNTS).map(([code, account]) => (
                <div key={code} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge variant={account.type === 'revenue' ? 'default' : 'secondary'}>
                    {code}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{account.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {account.nature === 'debit' ? 'D' : 'H'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
