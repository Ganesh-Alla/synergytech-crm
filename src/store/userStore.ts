// lib/stores/userStore.ts
import { toast } from "sonner";
import { create } from "zustand";
import type { User } from "@/components/admin/users/schema";
import { createClient } from "@/lib/supabase/client";

// export interface UserProfile {
//   id: string;
//  full_name: string;
//  email: string;
//  permission: "admin" | "read" | "write" | "full_access" | "super_admin";
//  status: "active" | "suspended";
// }

interface UserState {
  user: User | null;
  userLoading: boolean;
  userError: string | null;
  signinLoading: boolean;
  initialized: boolean;

  // Actions
  signInWithEmail: (email: string, password: string, role: "executive" | "admin") => Promise<void>;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  signOutAsync: (scope?: "local" | "global" | "others") => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  userLoading: true, // Start as true to prevent flash
  userError: null,
  signinLoading: false,
  initialized: false,

  signInWithEmail: async (email: string, password: string, role: "executive" | "admin") => {
    set({ signinLoading: true });
    const supabase = createClient();
    let userAuthenticated = false;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user?.id) throw new Error("User ID not found after authentication");
      userAuthenticated = true;
      
      // Fetch profile without role filtering first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      
      if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`);
      if (!profileData) throw new Error("Profile not found for authenticated user");
      
      // Validate role matches
      const isValidRole = role === "admin" 
        ?["admin", "super_admin"].includes(profileData.permission)
        : ["read", "write", "full"].includes(profileData.permission);
      console.log("isValidRole", isValidRole, role, profileData.permission)
      if (!isValidRole) {
        // Sign out if role doesn't match
        await supabase.auth.signOut();
        throw new Error(`Access denied. This account does not have ${role} permissions.`);
      }
      

      set({
        user: {
          id: data.user.id,
          full_name: profileData.full_name,
          email: data.user.email ?? "",
          permission: profileData.permission ?? "read",
          status: profileData.status ?? "active",
        },
        userLoading: false,
        userError: null,
        initialized: true,
      });
      
    } catch (error) {
      // Only sign out if user was successfully authenticated
      if (userAuthenticated) {
        await supabase.auth.signOut();
      }
      throw error;
    } finally {
      set({ signinLoading: false });
    }
  },


  fetchUser: async () => {
    // If already initialized, ensure loading is false
    if (get().initialized) {
      if (get().userLoading) {
        set({ userLoading: false });
      }
      return;
    }
    
    set({ userLoading: true, userError: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      // No user or error = not authenticated (valid state)
      if (error || !data.user?.id) {
        set({ user: null, userLoading: false, userError: null, initialized: true });
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        throw new Error(profileError?.message || "Profile not found");
      }

      set({
        user: {
          id: data.user.id,
          full_name: profileData.full_name,
          email: data.user.email ?? "",
          permission: profileData.permission ?? "read",
          status: profileData.status ?? "active",
        },
        userLoading: false,
        userError: null,
        initialized: true,
      });
    } catch (error) {
      set({
        user: null,
        userError: error instanceof Error ? error.message : "Authentication error",
        userLoading: false,
        initialized: true,
      });
    }
  },

  async signOutAsync(scope = "local") {
    const message = {
      success: {
        local: "Successfully logged out.",
        global: "Successfully logged out all device",
        others: "Successfully logged out other device",
      },
      error: {
        local: "Something went wrong! Failed to log out",
        global: "Something went wrong! Failed to log out all device",
        others: "Something went wrong! Failed to log out other device",
      },
    };

    const toastId = toast.loading("Logging out...");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope });
      if (error) throw new Error(error.message);
      toast.success(message.success[scope], { id: toastId });
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, { id: toastId });
      } else {
        toast.error(message.error[scope], { id: toastId });
      }
    }
  },

  clearUser: () => {
    set({ user: null, userError: null, userLoading: false, initialized: true });
  },
}));

// Setup auth state change listener
export const initUserStore = () => {
  const supabase = createClient();

  // Listen for auth state changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event: string) => {
    if (event === "SIGNED_IN" || event === "USER_UPDATED") {
      useUserStore.getState().fetchUser();
    } else if (event === "SIGNED_OUT") {
      useUserStore.getState().clearUser();
    }
  });

  // Fetch user on initial load
  useUserStore.getState().fetchUser();

  // Return the subscription for cleanup in strict mode
  return () => {
    subscription.unsubscribe();
  };
};
