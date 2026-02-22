import { Client, BusinessSettings } from '../contexts/AppContext';

/**
 * Servicio para el programa de fidelización
 */

export const loyaltyService = {
  /**
   * Calcula puntos ganados por un monto
   */
  calculatePointsEarned: (amount: number, pointsPerCurrency: number): number => {
    return Math.floor(amount * pointsPerCurrency);
  },

  /**
   * Calcula el descuento aplicable según el tier
   */
  getTierDiscount: (
    tier: Client['loyaltyTier'],
    settings: BusinessSettings
  ): number => {
    return settings.loyaltyProgram.tiers[tier].discount;
  },

  /**
   * Determina el tier según puntos
   */
  determineTier: (
    points: number,
    settings: BusinessSettings
  ): Client['loyaltyTier'] => {
    const { tiers } = settings.loyaltyProgram;
    
    if (points >= tiers.platinum.minPoints) return 'platinum';
    if (points >= tiers.gold.minPoints) return 'gold';
    if (points >= tiers.silver.minPoints) return 'silver';
    return 'bronze';
  },

  /**
   * Calcula puntos necesarios para el siguiente nivel
   */
  getPointsToNextTier: (
    currentPoints: number,
    currentTier: Client['loyaltyTier'],
    settings: BusinessSettings
  ): { points: number; nextTier: string } | null => {
    const { tiers } = settings.loyaltyProgram;
    
    if (currentTier === 'bronze' && currentPoints < tiers.silver.minPoints) {
      return {
        points: tiers.silver.minPoints - currentPoints,
        nextTier: 'Silver',
      };
    }
    if (currentTier === 'silver' && currentPoints < tiers.gold.minPoints) {
      return {
        points: tiers.gold.minPoints - currentPoints,
        nextTier: 'Gold',
      };
    }
    if (currentTier === 'gold' && currentPoints < tiers.platinum.minPoints) {
      return {
        points: tiers.platinum.minPoints - currentPoints,
        nextTier: 'Platinum',
      };
    }
    
    return null; // Ya está en el nivel máximo
  },

  /**
   * Obtiene el icono del tier
   */
  getTierIcon: (tier: Client['loyaltyTier']): string => {
    switch (tier) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '⭐';
    }
  },

  /**
   * Obtiene el color del tier
   */
  getTierColor: (tier: Client['loyaltyTier']): string => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return '#gray';
    }
  },

  /**
   * Verifica si el cliente califica para un beneficio especial
   */
  qualifiesForBenefit: (
    client: Client,
    requiredTier: Client['loyaltyTier']
  ): boolean => {
    const tierOrder: Client['loyaltyTier'][] = ['bronze', 'silver', 'gold', 'platinum'];
    const clientTierIndex = tierOrder.indexOf(client.loyaltyTier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    
    return clientTierIndex >= requiredTierIndex;
  },

  /**
   * Genera cupón de cumpleaños automático
   */
  generateBirthdayCoupon: (client: Client): {
    code: string;
    value: number;
    type: 'percentage' | 'fixed';
  } => {
    const tierBonuses = {
      bronze: 10,
      silver: 15,
      gold: 20,
      platinum: 25,
    };

    return {
      code: `BIRTHDAY-${client.id}-${new Date().getFullYear()}`,
      value: tierBonuses[client.loyaltyTier],
      type: 'percentage',
    };
  },

  /**
   * Calcula valor del cliente (CLV - Customer Lifetime Value)
   */
  calculateCustomerLifetimeValue: (client: Client): number => {
    const monthsSinceJoin = (new Date().getTime() - new Date(client.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsSinceJoin === 0) return 0;
    
    const avgMonthlySpend = client.totalSpent / monthsSinceJoin;
    const estimatedLifetimeMonths = 36; // Asumimos 3 años de vida del cliente
    
    return avgMonthlySpend * estimatedLifetimeMonths;
  },

  /**
   * Identifica clientes en riesgo de abandono (churn)
   */
  isAtRiskOfChurn: (client: Client): boolean => {
    if (!client.lastVisit) return true;
    
    const daysSinceLastVisit = (new Date().getTime() - new Date(client.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
    
    // Criterios de riesgo
    const hasHighNoShows = client.noShowCount >= 2;
    const hasNotVisitedInLongTime = daysSinceLastVisit > 60;
    const hasHighCancellations = client.cancellationCount >= 3;
    
    return hasHighNoShows || hasNotVisitedInLongTime || hasHighCancellations;
  },

  /**
   * Genera recomendación de incentivo para cliente en riesgo
   */
  getChurnPreventionIncentive: (client: Client): {
    type: 'coupon' | 'points' | 'upgrade';
    value: number;
    message: string;
  } => {
    if (!client.lastVisit) {
      return {
        type: 'coupon',
        value: 20,
        message: '¡Te extrañamos! 20% de descuento en tu próxima visita',
      };
    }

    const daysSinceLastVisit = (new Date().getTime() - new Date(client.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastVisit > 90) {
      return {
        type: 'coupon',
        value: 30,
        message: '¡Han pasado 3 meses! 30% de descuento especial',
      };
    }

    if (client.noShowCount >= 2) {
      return {
        type: 'points',
        value: 200,
        message: 'Compensa tus no-shows con 200 puntos de regalo',
      };
    }

    return {
      type: 'coupon',
      value: 15,
      message: 'Vuelve pronto con 15% de descuento',
    };
  },

  /**
   * Segmenta clientes para campañas de marketing
   */
  segmentClients: (clients: Client[]): {
    vip: Client[];
    regular: Client[];
    occasional: Client[];
    atRisk: Client[];
    inactive: Client[];
  } => {
    const now = new Date();
    
    return {
      vip: clients.filter(c => 
        (c.loyaltyTier === 'gold' || c.loyaltyTier === 'platinum') &&
        c.appointmentCount >= 10
      ),
      regular: clients.filter(c => 
        c.appointmentCount >= 5 && c.appointmentCount < 10
      ),
      occasional: clients.filter(c => 
        c.appointmentCount >= 1 && c.appointmentCount < 5
      ),
      atRisk: clients.filter(c => loyaltyService.isAtRiskOfChurn(c)),
      inactive: clients.filter(c => {
        if (!c.lastVisit) return true;
        const daysSince = (now.getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 120;
      }),
    };
  },
};
