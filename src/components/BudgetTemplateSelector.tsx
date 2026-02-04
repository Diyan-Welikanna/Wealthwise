'use client';

import { useState } from 'react';
import { budgetTemplates, type BudgetTemplate } from '@/utils/budgetTemplates';

interface BudgetTemplateSelectorProps {
  onSelectTemplate: (template: BudgetTemplate) => void;
  currentTemplate?: string;
}

export default function BudgetTemplateSelector({ 
  onSelectTemplate,
  currentTemplate 
}: BudgetTemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState(currentTemplate || '');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const handleSelect = (template: BudgetTemplate) => {
    setSelectedId(template.id);
    onSelectTemplate(template);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Choose a Budget Template</h3>
        <span className="text-xs text-gray-500">Click to apply</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {budgetTemplates.map((template) => {
          const isSelected = selectedId === template.id;
          const isPreview = showPreview === template.id;
          
          return (
            <div key={template.id} className="relative">
              <button
                onClick={() => handleSelect(template)}
                onMouseEnter={() => setShowPreview(template.id)}
                onMouseLeave={() => setShowPreview(null)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-3xl">{template.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{template.name}</h4>
                    {isSelected && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-purple-600 font-medium">
                    💡 {template.recommended}
                  </p>
                </div>
              </button>

              {/* Preview Tooltip */}
              {isPreview && template.id !== 'custom' && (
                <div className="absolute z-10 top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-xs">
                  <p className="font-semibold text-gray-700 mb-2">Allocation Preview:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {Object.entries(template.allocations)
                      .filter(([_, val]) => val > 0)
                      .sort(([_, a], [__, b]) => b - a)
                      .map(([category, percentage]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-gray-600 capitalize">{category}:</span>
                          <span className="font-semibold text-gray-900">{percentage}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
