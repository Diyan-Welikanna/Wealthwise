'use client';

import { format } from 'date-fns';
import { getFrequencyLabel, getFrequencyIcon } from '@/utils/recurringExpenses';

type RecurringExpense = {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  next_occurrence: string;
  is_active: boolean;
};

interface RecurringExpenseListProps {
  expenses: RecurringExpense[];
  onToggle: (id: number, isActive: boolean) => void;
  onDelete: (id: number) => void;
}

export default function RecurringExpenseList({ expenses, onToggle, onDelete }: RecurringExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-5xl mb-3">🔄</div>
        <p className="text-gray-600 font-medium">No recurring expenses yet</p>
        <p className="text-sm text-gray-400 mt-1">Create your first recurring expense to automate tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className={`bg-white rounded-lg shadow p-4 border-l-4 transition-all ${
            expense.is_active ? 'border-purple-600' : 'border-gray-300 opacity-60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getFrequencyIcon(expense.frequency)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {expense.description || 'Recurring Expense'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                      {expense.category}
                    </span>
                    <span>•</span>
                    <span>{getFrequencyLabel(expense.frequency)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    ${parseFloat(expense.amount.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Next Due</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(expense.next_occurrence), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Started</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(expense.start_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Ends</p>
                  <p className="font-semibold text-gray-900">
                    {expense.end_date ? format(new Date(expense.end_date), 'MMM dd, yyyy') : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {/* Toggle Active */}
              <button
                onClick={() => onToggle(expense.id, !expense.is_active)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  expense.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={expense.is_active ? 'Pause' : 'Resume'}
              >
                {expense.is_active ? '⏸ Pause' : '▶ Resume'}
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete(expense.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

