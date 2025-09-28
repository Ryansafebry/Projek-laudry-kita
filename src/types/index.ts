export interface Order {
  id: string;
  customerName: string;
  service: "Cuci Kering" | "Cuci Setrika" | "Setrika Saja";
  weight: number;
  price: number;
  status: "Diproses" | "Selesai" | "Diambil";
  entryDate: string;
  endDate?: string;
  pickupDate?: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePic?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}