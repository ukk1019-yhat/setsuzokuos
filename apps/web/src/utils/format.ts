/**
 * Indian Rupee (INR) currency formatting with standard Indian digit grouping (₹1,86,400).
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format relative age in days (e.g. "4 days overdue", "2 days ago", "Today").
 */
export function formatRelativeDays(dateStrOrObj: string | Date, isDueMetric = false): string {
  if (!dateStrOrObj) return '—';
  const target = new Date(dateStrOrObj);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (isDueMetric) {
    if (diffDays < 0) {
      return `${Math.abs(diffDays)}d overdue`;
    }
    if (diffDays === 0) {
      return 'Due today';
    }
    return `Due in ${diffDays}d`;
  }

  // Elapsed / past
  const pastDays = Math.round((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (pastDays <= 0) return 'Today';
  if (pastDays === 1) return 'Yesterday';
  return `${pastDays}d ago`;
}

