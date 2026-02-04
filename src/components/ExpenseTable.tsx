'use client';

import { useState } from 'react';
import { format } from 'date-fns';

type Expense = {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  category: string;
};

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
  const [sortField, setSortField] = useState<keyof Expense>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort expenses with proper null handling
  const sortedExpenses = [...expenses].sort((a, b) => {
    const aVal: string | number = a[sortField] ?? '';
    const bVal: string | number = b[sortField] ?? '';

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: keyof Expense }) => {
    if (sortField !== field) {
      return <span className="text-gray-300">↕</span>;
    }
    return <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-4xl mb-3">📭</div>
        <p className="text-gray-600 font-medium">No expenses found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add new expenses</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Date <SortIcon field="date" />
              </th>
              <th
                onClick={() => handleSort('description')}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Description <SortIcon field="description" />
              </th>
              <th
                onClick={() => handleSort('category')}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Category <SortIcon field="category" />
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Amount <SortIcon field="amount" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {expense.description || 'No description'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                  ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(expense.id)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
