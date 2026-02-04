'use client';

import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

type DateRange = {
  startDate: Date;
  endDate: Date;
};

type Preset = {
  label: string;
  range: DateRange;
};

interface DateRangeFilterProps {
  onRangeChange: (range: DateRange) => void;
  defaultPreset?: string;
}

export default function DateRangeFilter({ onRangeChange, defaultPreset = 'thisMonth' }: DateRangeFilterProps) {
  const now = new Date();
  
  const presets: Preset[] = [
    {
      label: 'This Month',
      range: {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      },
    },
    {
      label: 'Last Month',
      range: {
        startDate: startOfMonth(subMonths(now, 1)),
        endDate: endOfMonth(subMonths(now, 1)),
      },
    },
    {
      label: 'Last 3 Months',
      range: {
        startDate: startOfMonth(subMonths(now, 2)),
        endDate: endOfMonth(now),
      },
    },
    {
      label: 'Last 6 Months',
      range: {
        startDate: startOfMonth(subMonths(now, 5)),
        endDate: endOfMonth(now),
      },
    },
    {
      label: 'This Year',
      range: {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
      },
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState(defaultPreset);
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: startOfMonth(now),
    endDate: endOfMonth(now),
  });
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (preset: Preset, index: number) => {
    setSelectedPreset(preset.label);
    setIsCustom(false);
    onRangeChange(preset.range);
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    const newDate = new Date(value);
    const newRange = {
      ...customRange,
      [type === 'start' ? 'startDate' : 'endDate']: newDate,
    };
    setCustomRange(newRange);
    setIsCustom(true);
    setSelectedPreset('custom');
    onRangeChange(newRange);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Date Range</h3>
      
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset, index) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset, index)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedPreset === preset.label && !isCustom
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      <div className="border-t pt-3">
        <p className="text-xs text-gray-600 mb-2">Custom Range</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={format(customRange.startDate, 'yyyy-MM-dd')}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={format(customRange.endDate, 'yyyy-MM-dd')}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
