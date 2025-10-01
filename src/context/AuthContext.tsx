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
  loading: boolean;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [useSupabase, setUseSupabase] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndSetUser = async (sessionUser: any) => {
      let profile = await supabaseService.getProfile(sessionUser.id);
      if (!profile) {
        // If profile doesn't exist, try creating it. This is a fallback.
        profile = await supabaseService.createProfileFromUser(sessionUser);
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
        // If profile still can't be fetched/created, something is wrong.
        // Log the user out to prevent being in a broken state.
        await supabase.auth.signOut();
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchAndSetUser(session.user);
      }
      setLoading(false);
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchAndSetUser(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { success } = await supabaseService.signIn(email, password);
    // onAuthStateChange will handle setting the user state
    return success;
  };

  const logout = async () => {
    await supabaseService.signOut();
    // onAuthStateChange will handle clearing the user state
    localStorage.clear(); // Force clear for good measure
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
    setUser(updatedUserData); // Optimistic update
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
        loading,
        login,
        logout,
        updateUser,
        register,
        useSupabase,
        setUseSupabase,
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