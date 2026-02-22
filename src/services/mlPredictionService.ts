/**
 * Servicio de predicciones con Machine Learning
 * Implementa algoritmos básicos para predicción de demanda, detección de churn, y recomendaciones
 */

interface HistoricalData {
  date: string;
  appointments: number;
  revenue: number;
  clientId?: string;
}

interface ChurnPrediction {
  clientId: string;
  clientName: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastVisit: string;
  daysSinceLastVisit: number;
  totalVisits: number;
  averageSpend: number;
  recommendations: string[];
}

interface DemandForecast {
  date: string;
  predictedAppointments: number;
  confidence: number;
  zone?: string;
  dayOfWeek: string;
}

interface PriceRecommendation {
  serviceId: string;
  serviceName: string;
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number;
  reason: string;
  expectedImpact: string;
}

export class MLPredictionService {
  /**
   * Predice la demanda de citas para los próximos días
   */
  static predictDemand(historicalData: HistoricalData[], daysAhead: number = 7): DemandForecast[] {
    // Algoritmo: Media móvil ponderada con ajuste por día de la semana
    const forecasts: DemandForecast[] = [];
    
    // Calcular promedio por día de la semana
    const dayAverages = this.calculateDayOfWeekAverages(historicalData);
    
    // Calcular tendencia
    const trend = this.calculateTrend(historicalData);
    
    // Generar predicciones
    const today = new Date();
    for (let i = 1; i <= daysAhead; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      const dayOfWeek = forecastDate.toLocaleDateString('es-PE', { weekday: 'long' });
      const dayIndex = forecastDate.getDay();
      
      // Base: promedio del día de la semana
      let prediction = dayAverages[dayIndex] || 5;
      
      // Ajustar por tendencia
      prediction += trend * i;
      
      // Ajustar por estacionalidad (ejemplo: fines de semana -20%, inicio de mes +10%)
      if (dayIndex === 0 || dayIndex === 6) {
        prediction *= 0.8; // -20% en fines de semana
      }
      if (forecastDate.getDate() <= 5) {
        prediction *= 1.1; // +10% a inicio de mes
      }
      
      // Calcular confianza (decrece con días adelante)
      const confidence = Math.max(0.5, 1 - (i * 0.05));
      
      forecasts.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedAppointments: Math.round(prediction),
        confidence: parseFloat((confidence * 100).toFixed(1)),
        dayOfWeek
      });
    }
    
    return forecasts;
  }

  /**
   * Detecta clientes en riesgo de abandono (churn)
   */
  static detectChurnRisk(clients: any[]): ChurnPrediction[] {
    const predictions: ChurnPrediction[] = [];
    const today = new Date();
    
    for (const client of clients) {
      const lastVisit = new Date(client.lastVisit || today);
      const daysSinceLastVisit = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calcular probabilidad de churn
      let churnProbability = 0;
      
      // Factor 1: Días desde última visita (40% del peso)
      if (daysSinceLastVisit > 90) churnProbability += 0.4;
      else if (daysSinceLastVisit > 60) churnProbability += 0.25;
      else if (daysSinceLastVisit > 30) churnProbability += 0.1;
      
      // Factor 2: Frecuencia de visitas (30% del peso)
      const averageDaysBetweenVisits = client.totalVisits > 1 
        ? daysSinceLastVisit / client.totalVisits 
        : daysSinceLastVisit;
      
      if (averageDaysBetweenVisits > 45) churnProbability += 0.3;
      else if (averageDaysBetweenVisits > 30) churnProbability += 0.15;
      
      // Factor 3: Tendencia de gasto (20% del peso)
      const recentSpend = client.recentSpend || 0;
      const averageSpend = client.averageSpend || 0;
      
      if (recentSpend < averageSpend * 0.5) churnProbability += 0.2;
      else if (recentSpend < averageSpend * 0.75) churnProbability += 0.1;
      
      // Factor 4: Cancelaciones recientes (10% del peso)
      if (client.recentCancellations > 1) churnProbability += 0.1;
      
      // Determinar nivel de riesgo
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (churnProbability >= 0.6) riskLevel = 'high';
      else if (churnProbability >= 0.3) riskLevel = 'medium';
      
      // Generar recomendaciones
      const recommendations = this.generateRetentionRecommendations(
        daysSinceLastVisit,
        client.totalVisits,
        riskLevel
      );
      
      predictions.push({
        clientId: client.id,
        clientName: client.name,
        churnProbability: parseFloat((churnProbability * 100).toFixed(1)),
        riskLevel,
        lastVisit: client.lastVisit || today.toISOString(),
        daysSinceLastVisit,
        totalVisits: client.totalVisits || 0,
        averageSpend: client.averageSpend || 0,
        recommendations
      });
    }
    
    // Ordenar por probabilidad de churn (mayor a menor)
    return predictions.sort((a, b) => b.churnProbability - a.churnProbability);
  }

  /**
   * Recomienda ajustes de precios basados en demanda y competencia
   */
  static recommendPriceOptimization(services: any[]): PriceRecommendation[] {
    const recommendations: PriceRecommendation[] = [];
    
    for (const service of services) {
      const currentPrice = service.price || 0;
      const demand = service.monthlyBookings || 0;
      const capacity = service.monthlyCapacity || 100;
      const utilizationRate = demand / capacity;
      
      let recommendedPrice = currentPrice;
      let reason = '';
      let expectedImpact = '';
      
      // Algoritmo de pricing dinámico
      if (utilizationRate > 0.9) {
        // Alta demanda: incrementar precio 10-15%
        const increase = currentPrice * (0.1 + Math.random() * 0.05);
        recommendedPrice = currentPrice + increase;
        reason = 'Alta demanda (>90% de capacidad)';
        expectedImpact = 'Aumentar margen en 10-15% sin perder clientes';
      } else if (utilizationRate < 0.5) {
        // Baja demanda: reducir precio 5-10%
        const decrease = currentPrice * (0.05 + Math.random() * 0.05);
        recommendedPrice = currentPrice - decrease;
        reason = 'Baja demanda (<50% de capacidad)';
        expectedImpact = 'Aumentar reservas en 20-30%';
      } else if (utilizationRate >= 0.7 && utilizationRate <= 0.9) {
        // Demanda óptima: mantener precio
        recommendedPrice = currentPrice;
        reason = 'Demanda óptima (70-90% de capacidad)';
        expectedImpact = 'Mantener equilibrio actual';
      } else {
        // Demanda moderada: ajuste pequeño
        const adjustment = currentPrice * 0.03;
        recommendedPrice = utilizationRate > 0.6 
          ? currentPrice + adjustment 
          : currentPrice - adjustment;
        reason = utilizationRate > 0.6 
          ? 'Demanda creciente, oportunidad de optimizar' 
          : 'Demanda baja, ajuste preventivo';
        expectedImpact = utilizationRate > 0.6 
          ? 'Incrementar ingresos 3-5%' 
          : 'Aumentar reservas 10-15%';
      }
      
      const priceChange = ((recommendedPrice - currentPrice) / currentPrice) * 100;
      
      recommendations.push({
        serviceId: service.id,
        serviceName: service.name,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        recommendedPrice: parseFloat(recommendedPrice.toFixed(2)),
        priceChange: parseFloat(priceChange.toFixed(1)),
        reason,
        expectedImpact
      });
    }
    
    return recommendations;
  }

  /**
   * Predice el stock necesario de productos
   */
  static predictInventoryNeeds(products: any[], forecastDays: number = 30): any[] {
    return products.map(product => {
      const dailyUsage = product.monthlyUsage / 30 || 0;
      const predictedUsage = dailyUsage * forecastDays;
      const currentStock = product.stock || 0;
      const reorderPoint = product.reorderPoint || dailyUsage * 7;
      
      const needsReorder = currentStock < reorderPoint;
      const recommendedOrder = needsReorder 
        ? Math.ceil(predictedUsage * 1.2) // +20% de seguridad
        : 0;
      
      const stockoutRisk = currentStock / (dailyUsage * forecastDays);
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      
      if (stockoutRisk < 0.3) riskLevel = 'high';
      else if (stockoutRisk < 0.7) riskLevel = 'medium';
      
      return {
        productId: product.id,
        productName: product.name,
        currentStock,
        predictedUsage: Math.ceil(predictedUsage),
        dailyUsage: parseFloat(dailyUsage.toFixed(2)),
        recommendedOrder,
        stockoutRisk: parseFloat((stockoutRisk * 100).toFixed(1)),
        riskLevel,
        daysUntilStockout: currentStock / dailyUsage || 0
      };
    });
  }

  /**
   * Genera recomendaciones de marketing personalizadas
   */
  static generateMarketingRecommendations(client: any): string[] {
    const recommendations: string[] = [];
    const daysSinceLastVisit = client.daysSinceLastVisit || 0;
    const totalVisits = client.totalVisits || 0;
    const averageSpend = client.averageSpend || 0;
    
    // Basado en recencia
    if (daysSinceLastVisit > 60) {
      recommendations.push('Enviar cupón de descuento 20% para reactivación');
      recommendations.push('Recordar servicios favoritos y nuevas ofertas');
    } else if (daysSinceLastVisit > 30) {
      recommendations.push('Enviar recordatorio amigable con foto de su mascota');
    }
    
    // Basado en frecuencia
    if (totalVisits > 10) {
      recommendations.push('Ofrecer membresía VIP con beneficios exclusivos');
      recommendations.push('Solicitar referencia con incentivo');
    } else if (totalVisits > 5) {
      recommendations.push('Ofrecer paquete de servicios con descuento');
    }
    
    // Basado en valor
    if (averageSpend > 100) {
      recommendations.push('Programa de lealtad premium con recompensas');
      recommendations.push('Invitar a eventos exclusivos');
    }
    
    // Estacionales
    const month = new Date().getMonth();
    if (month === 11 || month === 0) {
      recommendations.push('Promoción de fin de año: corte navideño especial');
    }
    
    return recommendations;
  }

  // Métodos auxiliares privados

  private static calculateDayOfWeekAverages(data: HistoricalData[]): number[] {
    const dayTotals: number[] = Array(7).fill(0);
    const dayCounts: number[] = Array(7).fill(0);
    
    for (const entry of data) {
      const date = new Date(entry.date);
      const dayIndex = date.getDay();
      dayTotals[dayIndex] += entry.appointments;
      dayCounts[dayIndex]++;
    }
    
    return dayTotals.map((total, index) => 
      dayCounts[index] > 0 ? total / dayCounts[index] : 0
    );
  }

  private static calculateTrend(data: HistoricalData[]): number {
    if (data.length < 2) return 0;
    
    // Regresión lineal simple
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i].appointments;
      sumXY += i * data[i].appointments;
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private static generateRetentionRecommendations(
    daysSinceLastVisit: number,
    totalVisits: number,
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'high') {
      recommendations.push('URGENTE: Contactar personalmente con oferta especial');
      recommendations.push('Enviar cupón 30% de descuento válido por 7 días');
      recommendations.push('Ofrecer servicio gratuito adicional');
    } else if (riskLevel === 'medium') {
      recommendations.push('Enviar recordatorio con fotos de su mascota');
      recommendations.push('Ofrecer descuento 15% en próximo servicio');
      recommendations.push('Invitar a promoción de temporada');
    } else {
      recommendations.push('Mantener comunicación regular');
      recommendations.push('Enviar tips de cuidado de mascotas');
    }
    
    if (totalVisits > 5) {
      recommendations.push('Agradecer su lealtad con beneficio exclusivo');
    }
    
    return recommendations;
  }
}
