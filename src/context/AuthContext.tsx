import { User } from "../types";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

type UserWithPassword = User & { password?: string };

// Definisikan tipe untuk konteks
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  register: (userData: Omit<User, "id" | "createdAt"> & { password?: string }) => Promise<boolean>;
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
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [isAuthenticated, user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const storedUsers = localStorage.getItem("users");
    let users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    const userIndex = users.findIndex(u => u.username === username && u.password === password);

    if (userIndex > -1) {
      let foundUser = users[userIndex];
      
      // Migration for old users without createdAt
      if (!foundUser.createdAt) {
        const isDate = !isNaN(new Date(foundUser.id).getTime());
        foundUser.createdAt = isDate ? new Date(foundUser.id).toISOString() : new Date().toISOString();
        users[userIndex] = foundUser;
        localStorage.setItem("users", JSON.stringify(users));
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

  const register = async (userData: Omit<User, "id" | "createdAt"> & { password?: string }): Promise<boolean> => {
    const storedUsers = localStorage.getItem("users");
    const users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];

    if (users.some(u => u.username === userData.username || u.email === userData.email)) {
      return false; // User already exists
    }

    const newUser: UserWithPassword = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...userData,
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, updateUser, register }}
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