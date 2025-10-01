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

  useEffect(() => {
    setLoading(true);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await updateUserState(session?.user ?? null);
        // The 'INITIAL_SESSION' event is crucial. It fires once when the listener is set up.
        // After it has fired, we know the initial auth state is determined, and we can stop loading.
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const { success } = await supabaseService.signIn(email, password);
    // onAuthStateChange will handle setting the user state and setLoading(false) after SIGNED_IN
    if (!success) {
      setLoading(false); // Ensure loading stops on failed login attempt
    }
    return success;
  };

  const logout = async () => {
    await supabaseService.signOut();
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