import { User } from "../types";
import { supabaseService } from "../services/supabaseService";
import { supabase } from "../lib/supabase";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: User) => void;
  register: (userData: Omit<User, "id"> & { password: string }) => Promise<{ success: boolean; email?: string }>;
  useSupabase: boolean;
  setUseSupabase: (use: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [useSupabase, setUseSupabase] = useState<boolean>(true); // Default to Supabase

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await supabaseService.getCurrentUser();
      if (currentUser) {
        let profile = await supabaseService.getProfile(currentUser.id);
        if (!profile) {
          profile = await supabaseService.createProfileFromUser(currentUser);
        }
        
        if (profile) {
          setUser({
            id: profile.user_id,
            fullName: profile.full_name,
            username: profile.username,
            email: profile.email,
            phone: profile.phone || undefined,
            bio: profile.bio || undefined,
            profilePic: profile.avatar_url || undefined,
          });
          setIsAuthenticated(true);
        }
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth state changed:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        let profile = await supabaseService.getProfile(session.user.id);
        if (!profile) {
          console.log("Profile not found after sign-in, creating one...");
          profile = await supabaseService.createProfileFromUser(session.user);
        }

        if (profile) {
          setUser({
            id: profile.user_id,
            fullName: profile.full_name,
            username: profile.username,
            email: profile.email,
            phone: profile.phone || undefined,
            bio: profile.bio || undefined,
            profilePic: profile.avatar_url || undefined,
          });
          setIsAuthenticated(true);
        } else {
          console.error("Failed to get or create a profile for the user.");
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { success, error, user: supabaseUser } = await supabaseService.signIn(email, password);
    
    if (success && supabaseUser) {
      // Manually set the user state immediately to avoid race conditions
      let profile = await supabaseService.getProfile(supabaseUser.id);
      if (!profile) {
        profile = await supabaseService.createProfileFromUser(supabaseUser);
      }
      
      if (profile) {
        setUser({
          id: profile.user_id,
          fullName: profile.full_name,
          username: profile.username,
          email: profile.email,
          phone: profile.phone || undefined,
          bio: profile.bio || undefined,
          profilePic: profile.avatar_url || undefined,
        });
        setIsAuthenticated(true);
        return true;
      }
    }
    
    // If login fails for any reason, ensure state is cleared
    console.error("Login failed:", error);
    setUser(null);
    setIsAuthenticated(false);
    return false;
  };

  const logout = async () => {
    await supabaseService.signOut();
    setUser(null);
    setIsAuthenticated(false);
    // Force clear local storage to ensure a clean state for the next login
    localStorage.clear();
  };

  const register = async (userData: Omit<User, "id"> & { password: string }): Promise<{ success: boolean; email?: string }> => {
    const { success, error } = await supabaseService.signUp(userData.email, userData.password, {
      fullName: userData.fullName,
      username: userData.username,
      phone: userData.phone,
    });

    if (success) {
      return { success: true, email: userData.email };
    }
    console.error("Registration failed:", error);
    return { success: false };
  };

  const updateUser = async (updatedUserData: User) => {
    setUser(updatedUserData);
    await supabaseService.updateProfile(updatedUserData.id, {
      full_name: updatedUserData.fullName,
      username: updatedUserData.username,
      phone: updatedUserData.phone,
      bio: updatedUserData.bio,
      avatar_url: updatedUserData.profilePic,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        updateUser,
        register,
        useSupabase,
        setUseSupabase, // Keep for toggle if needed, but default is now Supabase
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};