/**
 * Date formatting utilities for the laundry application
 */

/**
 * Format date to DD/MM/YYYY format
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDateDDMMYYYY = (dateInput: string | Date | number): string => {
  try {
    const date = new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date to DD/MM/YYYY HH:mm format
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Formatted date string in DD/MM/YYYY HH:mm format
 */
export const formatDateTimeDDMMYYYY = (dateInput: string | Date | number): string => {
  try {
    const date = new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid Date';
  }
};

/**
 * Convert YYYY-MM-DD format to DD/MM/YYYY format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const convertYYYYMMDDtoDDMMYYYY = (dateString: string): string => {
  try {
    // Check if it's already in DD/MM/YYYY format
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Handle YYYY-MM-DD format
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    
    return formatDateDDMMYYYY(dateString);
  } catch (error) {
    console.error('Error converting date format:', error);
    return dateString;
  }
};

/**
 * Get current date in DD/MM/YYYY format
 * @returns Current date in DD/MM/YYYY format
 */
export const getCurrentDateDDMMYYYY = (): string => {
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
