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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérification de la session existante et expiration du token
    const checkSession = async () => {
      try {
        const encryptedUser = localStorage.getItem("auth_user");
        const authToken = localStorage.getItem("auth_token");

        if (encryptedUser && authToken) {
          const userData = await decryptData(encryptedUser);
          const tokenExpiration = getTokenExpiration(authToken); // Obtenir la date d'expiration du token

          if (userData && tokenExpiration > Date.now() / 1000) {  // Si le token n'est pas expiré
            setUser(JSON.parse(userData));
          } else {
            // Token expiré, supprimer la session et rediriger vers la page de connexion
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
  }, []);

  const getTokenExpiration = (token: string): number => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Décoder le payload du JWT
      return payload.exp || 0;  // Retourner l'expiration du token
    } catch (e) {
      return 0;  // Token invalide
    }
  };

  const checkRateLimit = (email: string): boolean => {
    const now = Date.now();
    const attempts = loginAttempts[email];

    if (!attempts) {
      loginAttempts[email] = { count: 1, lastAttempt: now };
      return true;
    }

    // Réinitialiser le compteur si 15 minutes se sont écoulées
    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
      loginAttempts[email] = { count: 1, lastAttempt: now };
      return true;
    }

    // Vérifier si on est sous la limite de tentatives (5 tentatives par 15 minutes)
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

      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return { success: false, error: "Identifiants invalides" };
      }

      const data = await response.json();

      const userRole = data.role ? data.role.toLowerCase() : null;
      if (!["user", "admin", "super_admin"].includes(userRole)) {
        return { success: false, error: `Rôle non autorisé : ${userRole || "manquant"}` };
      }

      delete loginAttempts[email];

      const authUser: User = {
        id: data.id.toString(),
        name: data.name || email.split("@")[0],
        email: data.email,
        role: userRole as "user" | "admin" | "super_admin",
        avatar: data.imageUrl || "https://i.ibb.co/C3R4f9gT/user.png?height=40&width=40",
        phone: data.phone || "",
        address: data.address || "",
        createdAt: data.createdAt || new Date().toISOString(),
        lastLogin: data.lastLogin || new Date().toISOString(),
      };

      const encryptedUser = await encryptData(JSON.stringify(authUser));
      localStorage.setItem("auth_user", encryptedUser);
      localStorage.setItem("auth_token", data.token);

      setUser(authUser);

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
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);

    try {
      const encryptedUser = await encryptData(JSON.stringify(updatedUser));
      localStorage.setItem("auth_user", encryptedUser);
    } catch (error) {
      console.error("Échec de la mise à jour des données utilisateur :", error);
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
