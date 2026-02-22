/**
 * Servicio de historial de optimizaciones
 * Guarda y analiza métricas de mejora de rutas por mes
 */

export interface OptimizationRecord {
  id: string;
  date: string; // ISO format
  vehicleId: string;
  vehicleName: string;
  appointmentsCount: number;
  originalDistance: number;
  optimizedDistance: number;
  distanceSaved: number;
  timeSaved: number; // minutos
  fuelSaved: number; // litros
  efficiency: number; // porcentaje de mejora
  costSaved: number; // PEN
  co2Saved: number; // kg
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalOptimizations: number;
  totalDistanceSaved: number;
  totalTimeSaved: number;
  totalFuelSaved: number;
  totalCostSaved: number;
  totalCO2Saved: number;
  averageEfficiency: number;
  bestOptimization: OptimizationRecord | null;
}

export interface YearlyStats {
  year: string; // YYYY
  monthlyBreakdown: MonthlyStats[];
  totalOptimizations: number;
  totalDistanceSaved: number;
  totalTimeSaved: number;
  totalFuelSaved: number;
  totalCostSaved: number;
  totalCO2Saved: number;
  averageEfficiency: number;
}

class OptimizationHistoryService {
  private storageKey = 'smartpet_optimization_history';
  private fuelPricePerLiter = 15.5; // PEN por litro (precio promedio en Perú)
  private co2PerLiter = 2.31; // kg de CO2 por litro de combustible

  /**
   * Guarda una nueva optimización en el historial
   */
  saveOptimization(record: Omit<OptimizationRecord, 'id' | 'date' | 'costSaved' | 'co2Saved'>): OptimizationRecord {
    const optimization: OptimizationRecord = {
      id: `OPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      ...record,
      costSaved: record.fuelSaved * this.fuelPricePerLiter,
      co2Saved: record.fuelSaved * this.co2PerLiter
    };

    const history = this.getHistory();
    history.push(optimization);
    this.saveHistory(history);

    return optimization;
  }

  /**
   * Obtiene todo el historial de optimizaciones
   */
  getHistory(): OptimizationRecord[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error cargando historial:', error);
      return [];
    }
  }

  /**
   * Guarda el historial completo
   */
  private saveHistory(history: OptimizationRecord[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error guardando historial:', error);
    }
  }

  /**
   * Obtiene optimizaciones de un mes específico
   */
  getMonthOptimizations(year: number, month: number): OptimizationRecord[] {
    const history = this.getHistory();
    return history.filter(record => {
      const date = new Date(record.date);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });
  }

  /**
   * Calcula estadísticas mensuales
   */
  getMonthlyStats(year: number, month: number): MonthlyStats {
    const optimizations = this.getMonthOptimizations(year, month);
    
    if (optimizations.length === 0) {
      return {
        month: `${year}-${String(month).padStart(2, '0')}`,
        totalOptimizations: 0,
        totalDistanceSaved: 0,
        totalTimeSaved: 0,
        totalFuelSaved: 0,
        totalCostSaved: 0,
        totalCO2Saved: 0,
        averageEfficiency: 0,
        bestOptimization: null
      };
    }

    const totalDistanceSaved = optimizations.reduce((sum, opt) => sum + opt.distanceSaved, 0);
    const totalTimeSaved = optimizations.reduce((sum, opt) => sum + opt.timeSaved, 0);
    const totalFuelSaved = optimizations.reduce((sum, opt) => sum + opt.fuelSaved, 0);
    const totalCostSaved = optimizations.reduce((sum, opt) => sum + opt.costSaved, 0);
    const totalCO2Saved = optimizations.reduce((sum, opt) => sum + opt.co2Saved, 0);
    const averageEfficiency = optimizations.reduce((sum, opt) => sum + opt.efficiency, 0) / optimizations.length;
    
    const bestOptimization = optimizations.reduce((best, opt) => 
      opt.efficiency > (best?.efficiency || 0) ? opt : best
    , optimizations[0]);

    return {
      month: `${year}-${String(month).padStart(2, '0')}`,
      totalOptimizations: optimizations.length,
      totalDistanceSaved: Math.round(totalDistanceSaved * 10) / 10,
      totalTimeSaved: Math.round(totalTimeSaved),
      totalFuelSaved: Math.round(totalFuelSaved * 10) / 10,
      totalCostSaved: Math.round(totalCostSaved * 100) / 100,
      totalCO2Saved: Math.round(totalCO2Saved * 10) / 10,
      averageEfficiency: Math.round(averageEfficiency * 10) / 10,
      bestOptimization
    };
  }

  /**
   * Calcula estadísticas anuales
   */
  getYearlyStats(year: number): YearlyStats {
    const monthlyBreakdown: MonthlyStats[] = [];
    
    for (let month = 1; month <= 12; month++) {
      monthlyBreakdown.push(this.getMonthlyStats(year, month));
    }

    const totalOptimizations = monthlyBreakdown.reduce((sum, m) => sum + m.totalOptimizations, 0);
    const totalDistanceSaved = monthlyBreakdown.reduce((sum, m) => sum + m.totalDistanceSaved, 0);
    const totalTimeSaved = monthlyBreakdown.reduce((sum, m) => sum + m.totalTimeSaved, 0);
    const totalFuelSaved = monthlyBreakdown.reduce((sum, m) => sum + m.totalFuelSaved, 0);
    const totalCostSaved = monthlyBreakdown.reduce((sum, m) => sum + m.totalCostSaved, 0);
    const totalCO2Saved = monthlyBreakdown.reduce((sum, m) => sum + m.totalCO2Saved, 0);
    
    const monthsWithData = monthlyBreakdown.filter(m => m.totalOptimizations > 0);
    const averageEfficiency = monthsWithData.length > 0
      ? monthsWithData.reduce((sum, m) => sum + m.averageEfficiency, 0) / monthsWithData.length
      : 0;

    return {
      year: year.toString(),
      monthlyBreakdown,
      totalOptimizations,
      totalDistanceSaved: Math.round(totalDistanceSaved * 10) / 10,
      totalTimeSaved: Math.round(totalTimeSaved),
      totalFuelSaved: Math.round(totalFuelSaved * 10) / 10,
      totalCostSaved: Math.round(totalCostSaved * 100) / 100,
      totalCO2Saved: Math.round(totalCO2Saved * 10) / 10,
      averageEfficiency: Math.round(averageEfficiency * 10) / 10
    };
  }

  /**
   * Obtiene las últimas N optimizaciones
   */
  getRecentOptimizations(limit: number = 10): OptimizationRecord[] {
    const history = this.getHistory();
    return history
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  /**
   * Obtiene optimizaciones por vehículo
   */
  getVehicleOptimizations(vehicleId: string): OptimizationRecord[] {
    const history = this.getHistory();
    return history.filter(record => record.vehicleId === vehicleId);
  }

  /**
   * Calcula estadísticas de un vehículo específico
   */
  getVehicleStats(vehicleId: string): {
    totalOptimizations: number;
    totalDistanceSaved: number;
    totalCostSaved: number;
    averageEfficiency: number;
  } {
    const optimizations = this.getVehicleOptimizations(vehicleId);
    
    if (optimizations.length === 0) {
      return {
        totalOptimizations: 0,
        totalDistanceSaved: 0,
        totalCostSaved: 0,
        averageEfficiency: 0
      };
    }

    return {
      totalOptimizations: optimizations.length,
      totalDistanceSaved: optimizations.reduce((sum, opt) => sum + opt.distanceSaved, 0),
      totalCostSaved: optimizations.reduce((sum, opt) => sum + opt.costSaved, 0),
      averageEfficiency: optimizations.reduce((sum, opt) => sum + opt.efficiency, 0) / optimizations.length
    };
  }

  /**
   * Elimina optimización por ID
   */
  deleteOptimization(id: string): boolean {
    const history = this.getHistory();
    const filtered = history.filter(record => record.id !== id);
    
    if (filtered.length < history.length) {
      this.saveHistory(filtered);
      return true;
    }
    
    return false;
  }

  /**
   * Limpia todo el historial
   */
  clearHistory(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Exporta el historial a JSON
   */
  exportToJSON(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Exporta el historial a CSV
   */
  exportToCSV(): string {
    const history = this.getHistory();
    
    if (history.length === 0) {
      return '';
    }

    const headers = [
      'ID',
      'Fecha',
      'Vehículo',
      'Citas',
      'Distancia Original (km)',
      'Distancia Optimizada (km)',
      'Distancia Ahorrada (km)',
      'Tiempo Ahorrado (min)',
      'Combustible Ahorrado (L)',
      'Costo Ahorrado (PEN)',
      'CO2 Ahorrado (kg)',
      'Eficiencia (%)'
    ].join(',');

    const rows = history.map(record => [
      record.id,
      new Date(record.date).toLocaleDateString('es-PE'),
      record.vehicleName,
      record.appointmentsCount,
      record.originalDistance,
      record.optimizedDistance,
      record.distanceSaved,
      record.timeSaved,
      record.fuelSaved,
      record.costSaved,
      record.co2Saved,
      record.efficiency
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  /**
   * Descarga el historial como CSV
   */
  downloadCSV(filename: string = 'optimizaciones.csv'): void {
    const csv = this.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Obtiene comparativa de periodos
   */
  getComparison(
    period1: { year: number; month: number },
    period2: { year: number; month: number }
  ): {
    period1Stats: MonthlyStats;
    period2Stats: MonthlyStats;
    improvementPercent: number;
  } {
    const period1Stats = this.getMonthlyStats(period1.year, period1.month);
    const period2Stats = this.getMonthlyStats(period2.year, period2.month);
    
    const improvementPercent = period1Stats.averageEfficiency > 0
      ? ((period2Stats.averageEfficiency - period1Stats.averageEfficiency) / period1Stats.averageEfficiency) * 100
      : 0;

    return {
      period1Stats,
      period2Stats,
      improvementPercent: Math.round(improvementPercent * 10) / 10
    };
  }
}

// Exportar instancia única del servicio
export const optimizationHistoryService = new OptimizationHistoryService();
