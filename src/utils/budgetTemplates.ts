export type BudgetTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  allocations: {
    [category: string]: number;
  };
  recommended: string;
};

export const budgetTemplates: BudgetTemplate[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Focus on savings and stability with minimal discretionary spending',
    icon: '🛡️',
    recommended: 'For those prioritizing emergency funds and debt reduction',
    allocations: {
      mortgage: 30,
      entertainment: 8,
      travel: 5,
      food: 15,
      health: 10,
      investment: 17,
      savings: 15,
    },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: '50/30/20 rule - balanced approach to needs, wants, and savings',
    icon: '⚖️',
    recommended: 'Popular choice for sustainable long-term financial health',
    allocations: {
      mortgage: 30,
      entertainment: 12,
      travel: 8,
      food: 18,
      health: 10,
      investment: 12,
      savings: 10,
    },
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Aggressive savings and investment for wealth building',
    icon: '📈',
    recommended: 'For high earners focused on maximizing wealth accumulation',
    allocations: {
      mortgage: 25,
      entertainment: 8,
      travel: 5,
      food: 12,
      health: 8,
      investment: 22,
      savings: 20,
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Start from scratch and create your own budget allocation',
    icon: '✏️',
    recommended: 'For those with specific financial goals and preferences',
    allocations: {
      mortgage: 0,
      entertainment: 0,
      travel: 0,
      food: 0,
      health: 0,
      investment: 0,
      savings: 0,
    },
  },
];

export function getTemplateById(id: string): BudgetTemplate | undefined {
  return budgetTemplates.find(template => template.id === id);
}

export function validateBudgetTotal(allocations: { [key: string]: number }): {
  valid: boolean;
  total: number;
  difference: number;
} {
  const total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  return {
    valid: Math.abs(total - 100) < 0.01,
    total,
    difference: 100 - total,
  };
}
