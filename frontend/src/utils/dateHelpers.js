import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    return format(date, 'PPP'); // e.g., "April 29th, 2021"
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    return format(date, 'PPp'); // e.g., "April 29th, 2021 at 9:30 AM"
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateForInput = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      return '';
    }
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

export const getTodayForInput = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const isValidDate = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date);
  } catch (error) {
    return false;
  }
};