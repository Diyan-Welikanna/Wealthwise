'use client';

import { useState } from 'react';
import { format } from 'date-fns';

export type FilterState = {
  category: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
};

interface ExpenseFiltersProps {
  categories: string[];
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function ExpenseFilters({ categories, onFilterChange, onReset }: ExpenseFiltersProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    dateFrom: '',
    dateTo: today,
    amountMin: '',
    amountMax: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      category: '',
      dateFrom: '',
      dateTo: today,
      amountMin: '',
      amountMax: '',
    };
    setFilters(resetFilters);
    onReset();
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== today).length;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {isExpanded ? '▲ Hide' : '▼ Show'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-3 border-t">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Amount ($)</label>
              <input
                type="number"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Amount ($)</label>
              <input
                type="number"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                placeholder="No limit"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
