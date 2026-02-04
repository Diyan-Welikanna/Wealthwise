export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type RecurringExpense = {
  id: number;
  userId: number;
  amount: number;
  category: string;
  description: string | null;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate: Date | null;
  nextOccurrence: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function calculateNextOccurrence(
  currentDate: Date,
  frequency: RecurringFrequency
): Date {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
}

export function shouldGenerateExpense(
  nextOccurrence: Date,
  endDate: Date | null
): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const occurrence = new Date(nextOccurrence);
  occurrence.setHours(0, 0, 0, 0);
  
  // Check if occurrence date has passed
  if (occurrence > now) {
    return false;
  }
  
  // Check if end date has passed
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    if (occurrence > end) {
      return false;
    }
  }
  
  return true;
}

export function getFrequencyLabel(frequency: RecurringFrequency): string {
  const labels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };
  return labels[frequency];
}

export function getFrequencyIcon(frequency: RecurringFrequency): string {
  const icons = {
    daily: '📅',
    weekly: '🗓️',
    monthly: '📆',
    yearly: '🎉',
  };
  return icons[frequency];
}
