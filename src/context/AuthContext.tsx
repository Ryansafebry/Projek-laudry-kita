import { User } from "../types";
import { emailService } from "../services/emailService";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

type UserWithPassword = User & { password?: string; isEmailVerified?: boolean };

// Definisikan tipe untuk konteks
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  register: (userData: Omit<User, "id"> & { password?: string }) => Promise<{ success: boolean; email?: string }>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
}

// Buat konteks dengan nilai default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Buat provider komponen
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers || JSON.parse(storedUsers).length === 0) {
      const dummyUser: UserWithPassword = {
        id: new Date().toISOString(),
        fullName: "Admin Laundry",
        username: "admin",
        email: "admin@laundrykita.com",
        password: "password",
        phone: "081234567890",
        isEmailVerified: true, // Admin sudah terverifikasi
      };
      localStorage.setItem("users", JSON.stringify([dummyUser]));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [isAuthenticated, user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const storedUsers = localStorage.getItem("users");
    const users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      // Cek apakah email sudah diverifikasi
      if (!foundUser.isEmailVerified) {
        return false; // Email belum diverifikasi
      }
      
      const { password: _, ...userToStore } = foundUser;
      setIsAuthenticated(true);
      setUser(userToStore);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", "false");
  };

  const updateUser = (updatedUserData: User) => {
    setUser(updatedUserData);
    const storedUsers = localStorage.getItem("users");
    let users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];
    const userIndex = users.findIndex(u => u.id === updatedUserData.id);
    if (userIndex > -1) {
      const oldPassword = users[userIndex].password;
      users[userIndex] = { ...updatedUserData, password: oldPassword };
      localStorage.setItem("users", JSON.stringify(users));
    }
  };

  const register = async (userData: Omit<User, "id"> & { password?: string }): Promise<{ success: boolean; email?: string }> => {
    const storedUsers = localStorage.getItem("users");
    const users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];

    if (users.some(u => u.username === userData.username || u.email === userData.email)) {
      return { success: false }; // User already exists
    }

    const newUser: UserWithPassword = {
      id: new Date().toISOString(),
      ...userData,
      isEmailVerified: false, // Email belum diverifikasi
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Kirim email verifikasi
    const emailResult = await emailService.sendVerificationEmail(userData.email);
    if (emailResult.success) {
      return { success: true, email: userData.email };
    } else {
      return { success: false };
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    const isValid = emailService.verifyCode(email, code);
    
    if (isValid) {
      // Update status verifikasi user di localStorage
      const storedUsers = localStorage.getItem("users");
      const users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];
      const userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex > -1) {
        users[userIndex].isEmailVerified = true;
        localStorage.setItem("users", JSON.stringify(users));
        return true;
      }
    }
    
    return false;
  };

  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    const result = await emailService.sendVerificationEmail(email);
    return result.success;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, updateUser, register, verifyEmail, resendVerificationEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Buat custom hook untuk menggunakan konteks
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};