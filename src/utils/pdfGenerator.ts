import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExpenseData {
  id: number
  amount: number
  category: string
  description: string
  date: string
}

interface IncomeData {
  id: number
  source: string
  amount: number
  date: string
}

interface BudgetData {
  category: string
  budgeted: number
  spent: number
}

interface InvestmentData {
  type: string
  amount: number
  currentValue: number
  roi: number
}

export interface ReportData {
  period: string
  startDate: string
  endDate: string
  user: {
    name: string
    email: string
  }
  summary: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    savingsRate: number
  }
  income: IncomeData[]
  expenses: ExpenseData[]
  budgets: BudgetData[]
  investments?: InvestmentData[]
}

/**
 * Generate Monthly/Yearly Financial Report PDF
 */
export function generateFinancialReport(data: ReportData): jsPDF {
  const doc = new jsPDF()
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.setTextColor(124, 58, 237) // Purple
  doc.text('WealthWise Financial Report', 105, yPosition, { align: 'center' })
  
  yPosition += 10
  doc.setFontSize(14)
  doc.setTextColor(100, 100, 100)
  doc.text(data.period, 105, yPosition, { align: 'center' })
  
  yPosition += 8
  doc.setFontSize(10)
  doc.text(`${data.startDate} to ${data.endDate}`, 105, yPosition, { align: 'center' })
  
  yPosition += 15

  // User Info
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`Generated for: ${data.user.name}`, 20, yPosition)
  yPosition += 6
  doc.text(`Email: ${data.user.email}`, 20, yPosition)
  yPosition += 6
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, yPosition)
  yPosition += 15

  // Summary Section
  doc.setFontSize(14)
  doc.setTextColor(124, 58, 237)
  doc.text('Financial Summary', 20, yPosition)
  yPosition += 10

  const summaryData = [
    ['Total Income', `₹${data.summary.totalIncome.toLocaleString()}`],
    ['Total Expenses', `₹${data.summary.totalExpenses.toLocaleString()}`],
    ['Net Savings', `₹${data.summary.netSavings.toLocaleString()}`],
    ['Savings Rate', `${data.summary.savingsRate.toFixed(1)}%`],
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [124, 58, 237] },
    margin: { left: 20, right: 20 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // Income Breakdown
  if (data.income.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(124, 58, 237)
    doc.text('Income Breakdown', 20, yPosition)
    yPosition += 10

    const incomeData = data.income.map((income) => [
      new Date(income.date).toLocaleDateString('en-IN'),
      income.source,
      `₹${income.amount.toLocaleString()}`,
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Source', 'Amount']],
      body: incomeData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Expense Breakdown
  if (data.expenses.length > 0 && yPosition < 250) {
    doc.setFontSize(14)
    doc.setTextColor(124, 58, 237)
    doc.text('Expense Breakdown', 20, yPosition)
    yPosition += 10

    const expenseData = data.expenses.map((expense) => [
      new Date(expense.date).toLocaleDateString('en-IN'),
      expense.category,
      expense.description.substring(0, 30),
      `₹${expense.amount.toLocaleString()}`,
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: expenseData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Budget vs Actual (New Page if needed)
  if (data.budgets.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(124, 58, 237)
    doc.text('Budget vs Actual', 20, yPosition)
    yPosition += 10

    const budgetData = data.budgets.map((budget) => {
      const variance = budget.budgeted - budget.spent
      const percentUsed = ((budget.spent / budget.budgeted) * 100).toFixed(1)
      return [
        budget.category,
        `₹${budget.budgeted.toLocaleString()}`,
        `₹${budget.spent.toLocaleString()}`,
        `₹${variance.toLocaleString()}`,
        `${percentUsed}%`,
      ]
    })

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Budgeted', 'Spent', 'Variance', '% Used']],
      body: budgetData,
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Investment Performance (if available)
  if (data.investments && data.investments.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(124, 58, 237)
    doc.text('Investment Performance', 20, yPosition)
    yPosition += 10

    const investmentData = data.investments.map((inv) => [
      inv.type,
      `₹${inv.amount.toLocaleString()}`,
      `₹${inv.currentValue.toLocaleString()}`,
      `${inv.roi > 0 ? '+' : ''}${inv.roi.toFixed(2)}%`,
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Type', 'Invested', 'Current Value', 'ROI']],
      body: investmentData,
      theme: 'striped',
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: 20, right: 20 },
    })
  }

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    )
    doc.text(
      'Generated by WealthWise - Your Financial Companion',
      105,
      285,
      { align: 'center' }
    )
  }

  return doc
}

/**
 * Helper: Download PDF
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}

/**
 * Helper: Preview PDF in new tab
 */
export function previewPDF(doc: jsPDF) {
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
