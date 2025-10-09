"use client";

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { encryptData, decryptData } from "@/lib/security";

// Interface User
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setUser: (user: User | null) => Promise<void>;
  recheckSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserInternal] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const hasCheckedRef = useRef(false);

  const getTokenExpiration = (token: string): number => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp || 0;
    } catch (e) {
      return 0;
    }
  };

  const checkRateLimit = (email: string): boolean => {
    const now = Date.now();
    const attempts = loginAttempts[email];

    if (!attempts) {
      loginAttempts[email] = { count: 1, lastAttempt: now };
      return true;
    }

    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
      loginAttempts[email] = { count: 1, lastAttempt: now };
      return true;
    }

    if (attempts.count >= 5) {
      return false;
    }

    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  };

  useEffect(() => {
    const checkSession = async () => {
      if (hasCheckedRef.current) {
        setIsLoading(false);
        return;
      }
      hasCheckedRef.current = true;

      console.log("🔍 Checking session...");
      try {
        const encryptedUser = localStorage.getItem("auth_user");
        const authToken = localStorage.getItem("auth_token");

        console.log("📦 Stored data:", { hasUser: !!encryptedUser, hasToken: !!authToken });

        if (encryptedUser && authToken) {
          let userData: string;
          try {
            userData = await decryptData(encryptedUser);
          } catch (decryptErr) {
            console.error("❌ Erreur décryptage:", decryptErr);
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
            setIsLoading(false);
            return;
          }
          
          console.log("✅ Decrypted userData:", userData);
          const tokenExpiration = getTokenExpiration(authToken);

          console.log("⏰ Token exp:", new Date(tokenExpiration * 1000), "Now:", new Date());

          if (userData && tokenExpiration > Date.now() / 1000) {
            const parsedUser = JSON.parse(userData);
            console.log("👤 Parsed user:", parsedUser);
            setUserInternal(parsedUser);
          } else {
            console.log("🚫 Session invalid/expired");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
          }
        }
      } catch (error) {
        console.error("❌ Erreur de vérification de la session :", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      if (!checkRateLimit(email)) {
        return { success: false, error: "Trop de tentatives de connexion. Essayez à nouveau dans 15 minutes." };
      }

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        return { success: false, error: "Identifiants invalides" };
      }

      const data = await response.json();

      // Normalize role - handle all formats including SUPER_ADMIN
      const rawRole = data.user.role || "user";
      const roleString = String(rawRole).toLowerCase().trim();
      
      let finalRole: "user" | "admin" | "super_admin";
      if (roleString === "super_admin" || roleString === "super admin") {
        finalRole = "super_admin";
      } else if (roleString === "admin") {
        finalRole = "admin";
      } else {
        finalRole = "user";
      }

      console.log("🎭 Role normalized:", { raw: rawRole, final: finalRole });

      delete loginAttempts[email];

      const authUser: User = {
        id: data.user.id,
        name: data.user.name || email.split("@")[0],
        email: data.user.email,
        role: finalRole,
        avatar: data.user.avatar || "https://i.ibb.co/C3R4f9gT/user.png?height=40&width=40",
        phone: data.user.phone || "",
        address: data.user.address || "",
        createdAt: data.user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const encryptedUser = await encryptData(JSON.stringify(authUser));
      localStorage.setItem("auth_user", encryptedUser);
      localStorage.setItem("auth_token", data.accessToken);

      setUserInternal(authUser);

      return { success: true, user: authUser };
    } catch (error) {
      console.error("❌ Erreur de connexion :", error);
      return { success: false, error: "Une erreur imprévue est survenue. Veuillez réessayer." };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return true;
    } catch (error) {
      console.error("❌ Erreur d'inscription :", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion backend:", error);
    } finally {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      setUserInternal(null);
      hasCheckedRef.current = false;
      router.push("/auth/login");
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUserInternal(updatedUser);

    try {
      const encryptedUser = await encryptData(JSON.stringify(updatedUser));
      localStorage.setItem("auth_user", encryptedUser);
    } catch (error) {
      console.error("❌ Échec de la mise à jour des données utilisateur :", error);
    }
  };

  const setUser = async (newUser: User | null) => {
    console.log("🔄 Setting user in context:", newUser);
    setUserInternal(newUser);
    if (newUser) {
      try {
        const encryptedUser = await encryptData(JSON.stringify(newUser));
        localStorage.setItem("auth_user", encryptedUser);
        console.log("✅ User stored in localStorage");
      } catch (err) {
        console.error("❌ Erreur chiffrement user:", err);
        localStorage.setItem("auth_user", JSON.stringify(newUser));
      }
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
  };

  const recheckSession = async () => {
    if (!isLoading && hasCheckedRef.current) {
      console.log("🔁 Session déjà vérifiée, skip");
      return;
    }
    setIsLoading(true);
    try {
      const encryptedUser = localStorage.getItem("auth_user");
      const authToken = localStorage.getItem("auth_token");
      
      if (encryptedUser && authToken) {
        let userData: string;
        try {
          userData = await decryptData(encryptedUser);
        } catch (decryptErr) {
          console.error("❌ Erreur décryptage recheck:", decryptErr);
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_token");
          setIsLoading(false);
          return;
        }
        
        const tokenExpiration = getTokenExpiration(authToken);
        if (userData && tokenExpiration > Date.now() / 1000) {
          const parsedUser = JSON.parse(userData);
          setUserInternal(parsedUser);
          console.log("✅ Re-check success: user set");
          hasCheckedRef.current = true;
          setIsLoading(false);
          return;
        }
      }
      
      // Try to refresh session
      if (authToken) {
        const response = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.accessToken) {
            localStorage.setItem("auth_token", data.accessToken);
            
            // Normalize role for refreshed user
            const rawRole = data.user.role || "user";
            const roleString = String(rawRole).toLowerCase().trim();
            
            let finalRole: "user" | "admin" | "super_admin";
            if (roleString === "super_admin" || roleString === "super admin") {
              finalRole = "super_admin";
            } else if (roleString === "admin") {
              finalRole = "admin";
            } else {
              finalRole = "user";
            }
            
            const normalizedUser = {
              ...data.user,
              role: finalRole
            };
            
            const encryptedUser = await encryptData(JSON.stringify(normalizedUser));
            localStorage.setItem("auth_user", encryptedUser);
            setUserInternal(normalizedUser);
            hasCheckedRef.current = true;
            setIsLoading(false);
            return;
          }
        }
      }
      
      throw new Error("Invalid session on re-check");
    } catch (error) {
      console.error("❌ Re-check failed:", error);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    setUser,
    recheckSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}