import { format } from "date-fns";

/**
 * Format date to DD/MM/YYYY format
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDateDDMMYYYY = (dateInput: string | Date | number): string => {
  try {
    if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      return dateInput;
    }
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Convert YYYY-MM-DD format to DD/MM/YYYY format
 * @param dateString - Date string in YYYY-MM-DD format or ISO string
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const convertYYYYMMDDtoDDMMYYYY = (dateString: string): string => {
  try {
    if (!dateString) return '';
    if (dateString.includes('/')) {
      return dateString;
    }
    return formatDateDDMMYYYY(new Date(dateString));
  } catch (error) {
    console.error('Error converting date format:', error);
    return dateString;
  }
};

/**
 * Get current date in DD/MM/YYYY format
 * @returns Current date in DD/MM/YYYY format
 */
export const getTodayDDMMYYYY = (): string => {
  return formatDateDDMMYYYY(new Date());
};

/**
 * Parse DD/MM/YYYY format to Date object
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Date object
 */
export const parseDDMMYYYY = (dateString: string): Date => {
  try {
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } catch (error) {
    console.error('Error parsing DD/MM/YYYY date:', error);
    return new Date();
  }
};