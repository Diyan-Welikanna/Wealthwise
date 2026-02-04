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
      entertainment: 5,
      travel: 3,
      food: 15,
      health: 8,
      utilities: 10,
      transportation: 8,
      shopping: 5,
      education: 5,
      investment: 8,
      savings: 3,
    },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: '50/30/20 rule - balanced approach to needs, wants, and savings',
    icon: '⚖️',
    recommended: 'Popular choice for sustainable long-term financial health',
    allocations: {
      mortgage: 28,
      entertainment: 8,
      travel: 7,
      food: 15,
      health: 7,
      utilities: 10,
      transportation: 7,
      shopping: 8,
      education: 3,
      investment: 5,
      savings: 2,
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
      entertainment: 6,
      travel: 5,
      food: 12,
      health: 7,
      utilities: 8,
      transportation: 6,
      shopping: 5,
      education: 4,
      investment: 15,
      savings: 7,
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
      utilities: 0,
      transportation: 0,
      shopping: 0,
      education: 0,
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
