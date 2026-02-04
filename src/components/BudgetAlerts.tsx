'use client';

type BudgetAlert = {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  percentage: number;
  severity: 'warning' | 'danger' | 'critical';
};

interface BudgetAlertsProps {
  alerts: BudgetAlert[];
}

export default function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🔶';
      case 'critical':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'Approaching Limit';
      case 'danger':
        return 'Over Budget';
      case 'critical':
        return 'Critical Overspend';
      default:
        return 'Alert';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Budget Alerts</h3>
        {alerts.length > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm text-gray-600 font-medium">All budgets on track!</p>
          <p className="text-xs text-gray-400 mt-1">You're staying within your limits</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-xl">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{alert.category}</span>
                    <span className="text-xs font-medium">{alert.percentage}%</span>
                  </div>
                  <p className="text-xs mb-2">{getSeverityLabel(alert.severity)}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>
                      Spent: <span className="font-semibold">${alert.spent.toLocaleString()}</span>
                    </span>
                    <span className="text-gray-500">of ${alert.budgeted.toLocaleString()}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-white bg-opacity-50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-red-600'
                          : alert.severity === 'danger'
                          ? 'bg-orange-600'
                          : 'bg-yellow-600'
                      }`}
                      style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            💡 <span className="font-medium">Tip:</span> Review your spending in these categories or
            adjust your budget limits.
          </p>
        </div>
      )}
    </div>
  );
}
