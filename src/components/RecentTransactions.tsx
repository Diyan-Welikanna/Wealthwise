'use client';

import { format } from 'date-fns';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
};

interface RecentTransactionsProps {
  transactions: Transaction[];
  limit?: number;
}

export default function RecentTransactions({ transactions, limit = 5 }: RecentTransactionsProps) {
  const recentTransactions = transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  const getCategoryIcon = (category: string, type: string) => {
    const icons: { [key: string]: string } = {
      'Food & Dining': '🍔',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Utilities': '💡',
      'Rent': '🏠',
      'Salary': '💰',
      'Freelance': '💼',
      'Investment': '📈',
      'Other': type === 'income' ? '💵' : '💳',
    };
    return icons[category] || icons['Other'];
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Recent Transactions</h3>
        <span className="text-xs text-gray-500">{recentTransactions.length} items</span>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs mt-1">Start by adding your first income or expense</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getCategoryIcon(transaction.category, transaction.type)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{transaction.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {format(transaction.date, 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}$
                {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      )}

      {recentTransactions.length > 0 && (
        <button className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
          View All Transactions →
        </button>
      )}
    </div>
  );
}
