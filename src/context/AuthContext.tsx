import { User } from "../types";
import { emailService } from "../services/emailService";
import authService, { RegisterData, LoginData } from "../services/authService";
import { supabaseService } from "../services/supabaseService";
import { supabase } from "../lib/supabase";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

type UserWithPassword = User & { password?: string; isEmailVerified?: boolean };

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: User) => void;
  register: (userData: Omit<User, "id"> & { password?: string }) => Promise<{ success: boolean; email?: string }>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  bypassEmailVerification: (email: string) => Promise<boolean>;
  clearAllUsers: () => void;
  getAllUsers: () => UserWithPassword[];
  // Supabase methods
  useSupabase: boolean;
  setUseSupabase: (use: boolean) => void;
  supabaseLogin: (email: string, password: string) => Promise<boolean>;
  supabaseRegister: (userData: Omit<User, "id"> & { password: string }) => Promise<{ success: boolean; email?: string }>;
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
  
  const [useSupabase, setUseSupabase] = useState<boolean>(() => {
    return localStorage.getItem("useSupabase") === "true";
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
    if (useSupabase) {
      return await supabaseLogin(username, password);
    }

    console.log('🔍 AuthContext: Memulai login via backend...', username);
    
    try {
      // Gunakan backend API untuk login
      const loginData: LoginData = {
        identifier: username, // bisa username atau email
        password: password
      };

      const result = await authService.login(loginData);
      
      if (result.success && result.user) {
        console.log('✅ AuthContext: Login berhasil via backend!');
        setIsAuthenticated(true);
        setUser(result.user);
        return true;
      } else {
        console.log('❌ AuthContext: Login gagal:', result.message);
        
        // Jika email belum diverifikasi, masih return false
        if (result.needsVerification) {
          console.log('📧 AuthContext: Email belum diverifikasi');
        }
        
        return false;
      }
    } catch (error) {
      console.error('💥 AuthContext: Error saat login via backend:', error);
      
      // Cek jenis error
      if (error.name === 'AbortError') {
        console.log('⏰ AuthContext: Request timeout, menggunakan fallback...');
      } else if (error.message.includes('fetch')) {
        console.log('🌐 AuthContext: Network error, menggunakan fallback...');
      } else {
        console.log('🔄 AuthContext: Backend error, menggunakan fallback...');
      }
      
      // Fallback ke localStorage jika backend tidak tersedia
      console.log('🔄 AuthContext: Fallback ke localStorage...');
      return await loginWithLocalStorage(username, password);
    }
  };

  // Fallback function untuk login dengan localStorage
  const loginWithLocalStorage = async (username: string, password: string): Promise<boolean> => {
    const storedUsers = localStorage.getItem("users");
    const users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      if (!foundUser.isEmailVerified) {
        return false;
      }
      
      const { password: _, ...userToStore } = foundUser;
      setIsAuthenticated(true);
      setUser(userToStore);
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (useSupabase) {
      await supabaseService.signOut();
    }
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", "false");
  };

  const updateUser = (updatedUserData: User) => {
    setUser(updatedUserData);
    if (!useSupabase) {
      const storedUsers = localStorage.getItem("users");
      let users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];
      const userIndex = users.findIndex(u => u.id === updatedUserData.id);
      if (userIndex > -1) {
        const oldPassword = users[userIndex].password;
        users[userIndex] = { ...updatedUserData, password: oldPassword };
        localStorage.setItem("users", JSON.stringify(users));
      }
    } else {
      // Update Supabase profile
      supabaseService.updateProfile(updatedUserData.id, {
        full_name: updatedUserData.fullName,
        username: updatedUserData.username,
        phone: updatedUserData.phone,
        bio: updatedUserData.bio
      });
    }
  };

  const register = async (userData: Omit<User, "id"> & { password?: string }): Promise<{ success: boolean; email?: string }> => {
    if (useSupabase) {
      return await supabaseRegister({ ...userData, password: userData.password || '' });
    }

    console.log('🔍 AuthContext: Memulai registrasi user via backend...', userData.email);
    
    try {
      // Gunakan backend API untuk registrasi
      const registerData: RegisterData = {
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        password: userData.password || '',
        phone: userData.phone
      };

      const result = await authService.register(registerData);
      
      if (result.success) {
        console.log('✅ AuthContext: Registrasi berhasil via backend!');
        return { 
          success: true, 
          email: result.email || userData.email 
        };
      } else {
        console.log('❌ AuthContext: Registrasi gagal:', result.message);
        return { success: false };
      }
    } catch (error: any) {
      console.error('💥 AuthContext: Error saat registrasi via backend:', error);
      
      // Cek jenis error
      if (error?.name === 'AbortError') {
        console.log('⏰ AuthContext: Request timeout, menggunakan fallback...');
      } else if (error?.message?.includes('fetch')) {
        console.log('🌐 AuthContext: Network error, menggunakan fallback...');
      } else if (error?.message?.includes('CORS')) {
        console.log('🌐 AuthContext: CORS error, menggunakan fallback...');
      } else {
        console.log('🔄 AuthContext: Backend error, menggunakan fallback...');
      }
      
      // Fallback ke localStorage jika backend tidak tersedia
      console.log('🔄 AuthContext: Fallback ke localStorage...');
      return await registerWithLocalStorage(userData);
    }
  };

  // Fallback function untuk registrasi dengan localStorage
  const registerWithLocalStorage = async (userData: Omit<User, "id"> & { password?: string }): Promise<{ success: boolean; email?: string }> => {
    const storedUsers = localStorage.getItem("users");
    const users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];

    // Cek duplikasi
    const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      return { success: false };
    }

    const newUser: UserWithPassword = {
      id: new Date().toISOString(),
      ...userData,
      isEmailVerified: false,
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Kirim email verifikasi
    try {
      const emailResult = await emailService.sendVerificationEmail(userData.email);
      return emailResult.success ? 
        { success: true, email: userData.email } : 
        { success: false };
    } catch (emailError) {
      return { success: false };
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    // Verifikasi via Supabase tidak memerlukan kode manual, tapi kita biarkan untuk fallback
    if (useSupabase) {
      // Supabase verification happens via magic link, this function is for manual code entry
      // We can assume if this is called, it's a fallback or non-Supabase flow
    }

    console.log('🔍 AuthContext: Memverifikasi email via backend:', email);
    
    try {
      // Gunakan backend API untuk verifikasi
      const result = await authService.verifyEmail(email, code);
      
      if (result.success) {
        console.log('✅ AuthContext: Verifikasi email berhasil via backend!');
        return true;
      } else {
        console.log('❌ AuthContext: Verifikasi email gagal:', result.message);
        return false;
      }
    } catch (error) {
      console.error('💥 AuthContext: Error saat verifikasi email via backend:', error);
      
      // Fallback ke emailService dan localStorage
      console.log('🔄 AuthContext: Fallback ke emailService...');
      return await verifyEmailWithLocalStorage(email, code);
    }
  };

  // Fallback function untuk verifikasi email dengan localStorage
  const verifyEmailWithLocalStorage = async (email: string, code: string): Promise<boolean> => {
    const isValid = await emailService.verifyCode(email, code);
    
    if (isValid) {
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

  const bypassEmailVerification = async (email: string): Promise<boolean> => {
    // Fungsi bypass untuk development - langsung verifikasi email tanpa kode
    const storedUsers = localStorage.getItem("users");
    const users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex > -1) {
      users[userIndex].isEmailVerified = true;
      localStorage.setItem("users", JSON.stringify(users));
      console.log(`✅ Email ${email} berhasil diverifikasi (bypass mode)`);
      return true;
    }
    
    return false;
  };

  // Debug function untuk membersihkan localStorage
  const clearAllUsers = () => {
    localStorage.removeItem("users");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    console.log('🧹 AuthContext: Semua data users telah dihapus dari localStorage');
  };

  // Debug function untuk melihat semua users
  const getAllUsers = () => {
    const storedUsers = localStorage.getItem("users");
    const users: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : [];
    console.log('👥 AuthContext: Semua users:', users);
    return users;
  };

  // Supabase methods
  const supabaseLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('🔍 AuthContext: Supabase login untuk:', email);
    
    try {
      const result = await supabaseService.signIn(email, password);
      
      if (result.success && result.user) {
        let profile = await supabaseService.getProfile(result.user.id);

        // Jika profil tidak ada, buat secara otomatis
        if (!profile) {
          console.warn("Profil tidak ditemukan untuk pengguna terverifikasi. Membuat profil sekarang...");
          profile = await supabaseService.createProfileFromUser(result.user);
        }
        
        if (profile) {
          const userData: User = {
            id: result.user.id,
            fullName: profile.full_name,
            username: profile.username,
            email: profile.email,
            phone: profile.phone || undefined
          };
          
          setIsAuthenticated(true);
          setUser(userData);
          console.log('✅ AuthContext: Supabase login berhasil!');
          return true;
        } else {
          console.error("Gagal mendapatkan atau membuat profil untuk pengguna.");
        }
      }
      
      console.log('❌ AuthContext: Supabase login gagal:', result.error);
      return false;
    } catch (error) {
      console.error('💥 AuthContext: Error saat Supabase login:', error);
      return false;
    }
  };

  const supabaseRegister = async (userData: Omit<User, "id"> & { password: string }): Promise<{ success: boolean; email?: string }> => {
    console.log('🔍 AuthContext: Supabase register untuk:', userData.email);
    
    try {
      const result = await supabaseService.signUp(userData.email, userData.password, {
        fullName: userData.fullName,
        username: userData.username,
        phone: userData.phone
      });
      
      if (result.success) {
        console.log('✅ AuthContext: Supabase register berhasil!');
        return { success: true, email: userData.email };
      }
      
      console.log('❌ AuthContext: Supabase register gagal:', result.error);
      return { success: false };
    } catch (error) {
      console.error('💥 AuthContext: Error saat Supabase register:', error);
      return { success: false };
    }
  };

  // Listen to Supabase auth changes
  useEffect(() => {
    if (useSupabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Supabase auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          let profile = await supabaseService.getProfile(session.user.id);
          if (!profile) {
            profile = await supabaseService.createProfileFromUser(session.user);
          }

          if (profile) {
            const userData: User = {
              id: session.user.id,
              fullName: profile.full_name,
              username: profile.username,
              email: profile.email,
              phone: profile.phone || undefined
            };
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [useSupabase]);

  // Save useSupabase preference
  useEffect(() => {
    localStorage.setItem("useSupabase", useSupabase.toString());
  }, [useSupabase]);
  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        updateUser, 
        register, 
        verifyEmail, 
        resendVerificationEmail, 
        bypassEmailVerification,
        clearAllUsers,
        getAllUsers,
        // Supabase methods
        useSupabase,
        setUseSupabase,
        supabaseLogin,
        supabaseRegister
      }}
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