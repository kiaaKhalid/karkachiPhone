// hooks/use-auth.tsx
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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
  logout: () => void;
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

  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session...");
      try {
        const encryptedUser = localStorage.getItem("auth_user");
        const authToken = localStorage.getItem("auth_token");

        console.log("Stored data:", { hasUser: !!encryptedUser, hasToken: !!authToken });

        if (encryptedUser && authToken) {
          const userData = await decryptData(encryptedUser);
          console.log("Decrypted userData:", userData);
          const tokenExpiration = getTokenExpiration(authToken);

          console.log("Token exp:", tokenExpiration, "Now:", Date.now() / 1000);

          if (userData && tokenExpiration > Date.now() / 1000) {
            const parsedUser = JSON.parse(userData);
            console.log("Parsed user:", parsedUser);
            setUserInternal(parsedUser);
          } else {
            console.log("Session invalid/expired");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
            localStorage.clear();
            router.push("/auth/login");
          }
        }
      } catch (error) {
        console.error("Erreur de vérification de la session :", error);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      if (!checkRateLimit(email)) {
        return { success: false, error: "Trop de tentatives de connexion. Essayez à nouveau dans 15 minutes." };
      }

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return { success: false, error: "Identifiants invalides" };
      }

      const data = await response.json();

      const userRole = data.user.role ? data.user.role.toLowerCase() : null;
      if (!["user", "admin", "super_admin"].includes(userRole)) {
        return { success: false, error: `Rôle non autorisé : ${userRole || "manquant"}` };
      }

      delete loginAttempts[email];

      const authUser: User = {
        id: data.user.id,
        name: data.user.name || email.split("@")[0],
        email: data.user.email,
        role: userRole as "user" | "admin" | "super_admin",
        avatar: data.user.avatar || "https://i.ibb.co/C3R4f9gT/user.png?height=40&width=40",
        phone: "",
        address: "",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const encryptedUser = await encryptData(JSON.stringify(authUser));
      localStorage.setItem("auth_user", encryptedUser);
      localStorage.setItem("auth_token", data.accessToken);

      setUserInternal(authUser);

      return { success: true, user: authUser };
    } catch (error) {
      console.error("Erreur de connexion :", error);
      return { success: false, error: "Une erreur imprévue est survenue. Veuillez réessayer." };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return true;
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    localStorage.clear();
    router.push("/auth/login");
    setUserInternal(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUserInternal(updatedUser);

    try {
      const encryptedUser = await encryptData(JSON.stringify(updatedUser));
      localStorage.setItem("auth_user", encryptedUser);
    } catch (error) {
      console.error("Échec de la mise à jour des données utilisateur :", error);
    }
  };

  const setUser = async (newUser: User | null) => {
    setUserInternal(newUser);
    if (newUser) {
      const encryptedUser = await encryptData(JSON.stringify(newUser));
      localStorage.setItem("auth_user", encryptedUser);
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
  };

  const recheckSession = async () => {
    setIsLoading(true);
    try {
      const encryptedUser = localStorage.getItem("auth_user");
      const authToken = localStorage.getItem("auth_token");
      if (encryptedUser && authToken) {
        const userData = await decryptData(encryptedUser);
        const tokenExpiration = getTokenExpiration(authToken);
        if (userData && tokenExpiration > Date.now() / 1000) {
          setUserInternal(JSON.parse(userData));
          console.log("Re-check success: user set");
          return;
        }
      }
      throw new Error("Invalid session on re-check");
    } catch (error) {
      console.error("Re-check failed:", error);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
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