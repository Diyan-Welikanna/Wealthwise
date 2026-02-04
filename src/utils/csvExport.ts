import { format } from 'date-fns';

type Expense = {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  category: string;
};

export function exportToCSV(expenses: Expense[], filename = 'expenses') {
  if (expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  // CSV headers
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  
  // CSV rows
  const rows = expenses.map(expense => [
    format(new Date(expense.date), 'yyyy-MM-dd'),
    expense.category,
    expense.description || 'No description',
    expense.amount.toFixed(2)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Escape cells containing commas or quotes
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
