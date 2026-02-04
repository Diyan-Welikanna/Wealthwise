'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import RecurringExpenseForm, { type RecurringExpenseFormData } from '@/components/RecurringExpenseForm';
import RecurringExpenseList from '@/components/RecurringExpenseList';
import { notifySuccess, notifyError, notifyInfo } from '@/utils/notifications';

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

export default function RecurringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [categoriesRes, recurringRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/recurring'),
      ]);

      const categoriesData = await categoriesRes.json();
      const recurringData = await recurringRes.json();

      if (categoriesData.success) {
        setCategories(categoriesData.categories.map((c: any) => c.name));
      }

      if (recurringData.success) {
        setRecurring(recurringData.recurring);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreate = async (formData: RecurringExpenseFormData) => {
    setLoading(true);

    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || null,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.hasEndDate ? formData.endDate : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        notifySuccess('Recurring expense created successfully!');
        setShowForm(false);
        fetchData();
      } else {
        notifyError(data.error || 'Failed to create recurring expense');
      }
    } catch (error) {
      notifyError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch(`/api/recurring/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      });

      if (res.ok) {
        notifySuccess(isActive ? 'Recurring expense resumed' : 'Recurring expense paused');
        fetchData();
      }
    } catch (error) {
      notifyError('Error toggling recurring expense');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recurring expense?')) {
      return;
    }

    try {
      const res = await fetch(`/api/recurring?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        notifySuccess('Recurring expense deleted successfully');
        fetchData();
      }
    } catch (error) {
      notifyError('Error deleting recurring expense');
    }
  };

  const handleGenerateNow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recurring/generate', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        if (data.generated > 0) {
          notifySuccess(`Generated ${data.generated} expense(s)`);
        } else {
          notifyInfo('No expenses due for generation');
        }
        fetchData();
      } else {
        notifyError(data.error || 'Failed to generate expenses');
      }
    } catch (error) {
      notifyError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const activeCount = recurring.filter((r) => r.is_active).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />

      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Recurring Expenses</h1>
              <p className="text-gray-600 mt-1">Automate your regular expenses</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateNow}
                disabled={loading || activeCount === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <span>⚡</span>
                {loading ? 'Generating...' : 'Generate Now'}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                {showForm ? 'Cancel' : 'Add Recurring'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Recurring</h3>
              <p className="text-4xl font-bold">{recurring.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Active</h3>
              <p className="text-4xl font-bold">{activeCount}</p>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Monthly Total</h3>
              <p className="text-4xl font-bold">
                $
                {recurring
                  .filter((r) => r.is_active && r.frequency === 'monthly')
                  .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0)
                  .toFixed(2)}
              </p>
            </Card>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('success') || message.includes('Generated')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create Recurring Expense</h2>
              <RecurringExpenseForm
                categories={categories}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </Card>
          )}

          {/* List */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Recurring Expenses</h2>
            <RecurringExpenseList
              expenses={recurring}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
