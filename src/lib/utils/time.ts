/**
 * Format a date as a relative time string (e.g., "just now", "5m ago", "2h ago")
 * 
 * @param date - The date to format, or undefined
 * @returns A human-readable relative time string
 */
export function formatRelativeTime(date: Date | undefined): string {
  if (!date) return 'just now';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than 10 seconds
  if (diffInSeconds < 10) return 'just now';
  
  // Less than 60 seconds
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  
  // Less than 60 minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  // Less than 24 hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  // 24 hours or more
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}
