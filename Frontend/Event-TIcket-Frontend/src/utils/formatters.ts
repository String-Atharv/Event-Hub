import { format, isValid } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'PP'): string => {
  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      // Direct parsing for ISO-8601 strings
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error, date);
    return typeof date === 'string' ? date : 'Invalid date';
  }
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

