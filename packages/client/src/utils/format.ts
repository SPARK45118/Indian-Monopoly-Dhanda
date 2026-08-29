/**
 * Format Indian Rupee currency (e.g. ₹15,000)
 */
export function formatRupee(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/**
 * Format timestamp to time string (e.g. 10:45 AM)
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
