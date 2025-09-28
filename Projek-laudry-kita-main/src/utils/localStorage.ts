/**
 * LocalStorage utility functions for persistent data storage
 */

// Storage keys
export const STORAGE_KEYS = {
  ORDERS: 'laundry_orders',
  CUSTOMERS: 'laundry_customers',
  SERVICES: 'laundry_services',
  SETTINGS: 'laundry_settings',
  NOTIFICATIONS: 'laundry_notifications',
} as const;

/**
 * Generic function to save data to localStorage
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Generic function to load data from localStorage
 */
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all application data from localStorage
 */
export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage usage info
 */
export const getStorageInfo = () => {
  if (!isStorageAvailable()) {
    return { available: false, used: 0, total: 0 };
  }

  let used = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage.getItem(key)?.length || 0;
    }
  }

  return {
    available: true,
    used: used,
    total: 5 * 1024 * 1024, // 5MB typical limit
    percentage: (used / (5 * 1024 * 1024)) * 100
  };
};

/**
 * Customer data management functions
 */
export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
  const customers = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  const newId = Math.max(...customers.map(c => c.id), 0) + 1;
  const newCustomer: Customer = { ...customer, id: newId };
  
  const updatedCustomers = [...customers, newCustomer];
  saveToStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
  
  return newCustomer;
};

export const updateCustomer = (id: number, updates: Partial<Omit<Customer, 'id'>>): void => {
  const customers = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  const updatedCustomers = customers.map(customer => 
    customer.id === id ? { ...customer, ...updates } : customer
  );
  saveToStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
};

export const deleteCustomer = (id: number): void => {
  const customers = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  const updatedCustomers = customers.filter(customer => customer.id !== id);
  saveToStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
};

export const getCustomers = (): Customer[] => {
  return loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
};
