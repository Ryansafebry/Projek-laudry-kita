import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  users: User[];
}

interface RegisterData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Load users and current user from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('laundry_users');
    const savedUser = localStorage.getItem('laundry_current_user');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Default admin user
      const defaultUsers = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@laundrykita.com',
          fullName: 'Administrator',
          phone: '+62 812-3456-7890'
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('laundry_users', JSON.stringify(defaultUsers));
    }
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists (for demo, we'll accept any registered username)
    const foundUser = users.find(u => u.username === username);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('laundry_current_user', JSON.stringify(foundUser));
      return true;
    }
    
    // For demo purposes, also accept default admin credentials
    if (username === 'admin' && password === 'admin123') {
      const adminUser = users.find(u => u.username === 'admin') || users[0];
      setUser(adminUser);
      localStorage.setItem('laundry_current_user', JSON.stringify(adminUser));
      return true;
    }
    
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if username or email already exists
    const existingUser = users.find(u => 
      u.username === userData.username || u.email === userData.email
    );
    
    if (existingUser) {
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: String(Date.now()),
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('laundry_users', JSON.stringify(updatedUsers));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('laundry_current_user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      users
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
