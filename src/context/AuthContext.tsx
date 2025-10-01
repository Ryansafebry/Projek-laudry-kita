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
import { User as SupabaseUser } from '@supabase/supabase-js';

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

  // Central function to update the entire auth state from a Supabase user object
  const updateUserState = async (sessionUser: SupabaseUser | null) => {
    if (!sessionUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    let profile = await supabaseService.getProfile(sessionUser.id);
    if (!profile) {
      console.warn(`Profile not found for user ${sessionUser.id}. Attempting to create a fallback profile.`);
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
      console.error(`CRITICAL: Failed to get or create a profile for authenticated user ${sessionUser.id}.`);
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // This useEffect now handles session restoration on page load and background auth changes (e.g., in another tab)
  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login function is now explicit and synchronous from the caller's perspective
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      console.error("Login failed:", error?.message);
      return false;
    }

    // Manually trigger the state update immediately instead of waiting for the listener.
    // This ensures that when the promise resolves, the app's state is already updated.
    await updateUserState(data.user);
    return true;
  };

  // Logout function is also explicit
  const logout = async () => {
    await supabase.auth.signOut();
    // Manually clear state immediately
    setUser(null);
    setIsAuthenticated(false);
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
    setUser(updatedUserData); // Optimistic UI update
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