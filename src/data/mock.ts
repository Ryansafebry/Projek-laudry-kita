import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/localStorage';

// Default data for first-time users
const defaultCustomers = [
  { id: 1, name: "Budi Santoso", phone: "081234567890", address: "Jl. Merdeka No. 10, Jakarta" },
  { id: 2, name: "Citra Lestari", phone: "087654321098", address: "Jl. Pahlawan No. 5, Surabaya" },
  { id: 3, name: "Dewi Anggraini", phone: "085566778899", address: "Jl. Sudirman No. 12, Bandung" },
];

const defaultServices = [
  { id: 1, name: "Cuci Kering Lipat", pricePerKg: 7000 },
  { id: 2, name: "Cuci Setrika", pricePerKg: 9000 },
  { id: 3, name: "Setrika Saja", pricePerKg: 5000 },
  { id: 4, name: "Bed Cover", pricePerKg: 15000 },
];

// Load from localStorage or use defaults
export const customers = (() => {
  const saved = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);
  if (saved.length === 0) {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, defaultCustomers);
    return defaultCustomers;
  }
  return saved;
})();

export const services = (() => {
  const saved = loadFromStorage(STORAGE_KEYS.SERVICES, []);
  if (saved.length === 0) {
    saveToStorage(STORAGE_KEYS.SERVICES, defaultServices);
    return defaultServices;
  }
  return saved;
})();

export const orders = [];