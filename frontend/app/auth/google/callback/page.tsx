// app/auth/google/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { encryptData } from "@/lib/security";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setUser, recheckSession, user: regularUser, isAuthenticated: isUserAuthenticated } = useAuth();

  const success = searchParams.get("success");
  const token = searchParams.get("token");
  const userStr = searchParams.get("user");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur de connexion Google",
        description: "Une erreur s'est produite lors de la connexion avec Google.",
        variant: "destructive",
      });
      router.replace("/auth/login");
      return;
    }

    if (success === "true" && token && userStr) {
      const handleSuccess = async () => {
        try {
          let userData: any = null;

          // 🔹 Tentative de décodage du paramètre `user`
          try {
            userData = JSON.parse(decodeURIComponent(userStr));
          } catch (e) {
            console.error("❌ Erreur parsing userStr:", userStr, e);
            toast({
              title: "Erreur",
              description: "Impossible de lire les données utilisateur.",
              variant: "destructive",
            });
            router.replace("/auth/login");
            return;
          }

          // 🔹 Normalisation du rôle
          const rawRole = userData.role || "user";
          const userRole = rawRole.toString().toLowerCase().replace("-", "_");

          const finalRole: "user" | "admin" | "super_admin" =
            ["user", "admin", "super_admin"].includes(userRole)
              ? (userRole as "user" | "admin" | "super_admin")
              : "user";

          const authUser = {
            id: userData.id,
            name: userData.name || "",
            email: userData.email,
            role: finalRole,
            avatar:
              userData.avatarUrl ||
              userData.avatar ||
              "https://i.ibb.co/C3R4f9gT/user.png?height=40&width=40",
            phone: userData.phone || "",
            address: "",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          // 🔹 Stockage sécurisé
          localStorage.setItem("auth_token", token);
          const encryptedUser = await encryptData(JSON.stringify(authUser));
          localStorage.setItem("auth_user", encryptedUser);

          await setUser(authUser);
          await recheckSession();

          toast({
            title: "Connexion Google réussie !",
            description: `Bienvenue, ${authUser.name} !`,
          });

          const targetUrl = ["admin", "super_admin"].includes(authUser.role)
            ? "/admin"
            : "/";
          router.replace(targetUrl);
        } catch (err) {
          console.error("Erreur callback Google:", err);
          toast({
            title: "Erreur de connexion",
            description: "Impossible de traiter la réponse Google.",
            variant: "destructive",
          });
          router.replace("/auth/login");
        }
      };

      handleSuccess();
    } else {
      // 🔹 Si pas de `userStr`, on tente un refresh
      const handleFallback = async () => {
        try {
          const response = await fetch(`${apiUrl}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (!response.ok) throw new Error("Failed to refresh");

          const data = await response.json();

          if (data.accessToken && data.user) {
            const rawRole = data.user.role || "user";
            const userRole = rawRole.toString().toLowerCase().replace("-", "_");

            const finalRole: "user" | "admin" | "super_admin" =
              ["user", "admin", "super_admin"].includes(userRole)
                ? (userRole as "user" | "admin" | "super_admin")
                : "user";

            const authUser = {
              id: data.user.id,
              name: data.user.name || "",
              email: data.user.email,
              role: finalRole,
              avatar:
                data.user.avatarUrl ||
                data.user.avatar ||
                "https://i.ibb.co/C3R4f9gT/user.png?height=40&width=40",
              phone: data.user.phone || "",
              address: "",
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };

            localStorage.setItem("auth_token", data.accessToken);
            const encryptedUser = await encryptData(JSON.stringify(authUser));
            localStorage.setItem("auth_user", encryptedUser);

            await setUser(authUser);
            await recheckSession();

            toast({
              title: "Connexion réussie !",
              description: `Bienvenue, ${authUser.name} !`,
            });

            const targetUrl = ["admin", "super_admin"].includes(authUser.role)
              ? "/admin"
              : "/";
            router.replace(targetUrl);
          } else {
            router.replace("/auth/login");
          }
        } catch (err) {
          console.error("Fallback refresh failed:", err);
          router.replace("/auth/login");
        }
      };

      handleFallback();
    }
  }, [success, token, userStr, error, router, toast, setUser, recheckSession]);

  if (isUserAuthenticated && regularUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Connexion en cours...
        </p>
      </div>
    </div>
  );
}
