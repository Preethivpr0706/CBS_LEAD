// utils/dateUtils.ts
export const formatMySQLDate = (mysqlDateTime: string | null | undefined): string => {
  if (!mysqlDateTime) return '';
  
  // Convert MySQL datetime to local date
  const date = new Date(mysqlDateTime.replace(' ', 'T'));
  return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
};

export const formatMySQLDateTime = (mysqlDateTime: string | null | undefined): string => {
  if (!mysqlDateTime) return '';
  
  // Convert MySQL datetime to local datetime with proper timezone
  const date = new Date(mysqlDateTime.replace(' ', 'T'));
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const isSameDay = (mysqlDateTime: string | null | undefined): boolean => {
  if (!mysqlDateTime) return false;
  
  const today = new Date().toLocaleDateString('en-CA');
  const compareDate = new Date(mysqlDateTime.replace(' ', 'T'))
    .toLocaleDateString('en-CA');
    
  return today === compareDate;
};
