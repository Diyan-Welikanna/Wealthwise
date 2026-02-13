'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type RecurringFrequency, getFrequencyLabel, getFrequencyIcon } from '@/utils/recurringExpenses';

interface RecurringExpenseFormProps {
  categories: string[];
  onSubmit: (data: RecurringExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

export type RecurringExpenseFormData = {
  amount: string;
  category: string;
  description: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string;
  hasEndDate: boolean;
};

export default function RecurringExpenseForm({ categories, onSubmit, onCancel }: RecurringExpenseFormProps) {
  const [formData, setFormData] = useState<RecurringExpenseFormData>({
    amount: '',
    category: categories[0] || '',
    description: '',
    frequency: 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    hasEndDate: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const frequencies: RecurringFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="e.g., Netflix subscription"
        />
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Frequency *
        </label>
        <div className="grid grid-cols-4 gap-2">
          {frequencies.map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setFormData({ ...formData, frequency: freq })}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                formData.frequency === freq
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">{getFrequencyIcon(freq)}</div>
              {getFrequencyLabel(freq)}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              id="hasEndDate"
              checked={formData.hasEndDate}
              onChange={(e) => setFormData({ ...formData, hasEndDate: e.target.checked, endDate: '' })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="hasEndDate" className="text-sm font-medium text-gray-700">
              Set End Date
            </label>
          </div>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            disabled={!formData.hasEndDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
        >
          {submitting ? 'Creating...' : 'Create Recurring Expense'}
        </button>
      </div>
    </form>
  );
}

