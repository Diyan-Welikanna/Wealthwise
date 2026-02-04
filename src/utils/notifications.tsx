import toast from 'react-hot-toast';

// Success notifications
export const notifySuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  });
};

// Error notifications
export const notifyError = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  });
};

// Info notifications
export const notifyInfo = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontWeight: '500',
    },
  });
};

// Warning notifications
export const notifyWarning = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      fontWeight: '500',
    },
  });
};

// Budget alert notifications
export const notifyBudgetAlert = (category: string, percentage: number) => {
  const severity = percentage >= 100 ? 'critical' : percentage >= 90 ? 'danger' : 'warning';
  
  const messages = {
    warning: `${category}: ${percentage}% of budget used`,
    danger: `${category}: Budget limit approaching (${percentage}%)`,
    critical: `${category}: Over budget by ${percentage - 100}%!`,
  };

  const styles = {
    warning: { background: '#f59e0b', icon: '⚠️' },
    danger: { background: '#f97316', icon: '🔶' },
    critical: { background: '#ef4444', icon: '🚨' },
  };

  toast(messages[severity], {
    duration: 5000,
    position: 'top-right',
    icon: styles[severity].icon,
    style: {
      background: styles[severity].background,
      color: '#fff',
      fontWeight: '600',
    },
  });
};

// Loading toast
export const notifyLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#6366f1',
      color: '#fff',
      fontWeight: '500',
    },
  });
};

// Dismiss specific toast
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// Promise-based notifications
export const notifyPromise = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      position: 'top-right',
      style: {
        fontWeight: '500',
      },
      success: {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      },
      error: {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      },
    }
  );
};

// Custom notification with action button
export const notifyWithAction = (
  message: string,
  actionLabel: string,
  onAction: () => void
) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              onAction();
              toast.dismiss(t.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-purple-600 hover:text-purple-500 focus:outline-none"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-right',
    }
  );
};
