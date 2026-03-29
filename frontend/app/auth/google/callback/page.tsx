"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type User } from "@/hooks/use-auth"; // ✅ on importe le type User
import { encryptData } from "@/lib/security";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const success = searchParams.get("success");
  const token = searchParams.get("token");
  const userStr = searchParams.get("user");
  const hasError = searchParams.get("error") !== null && searchParams.get("error") !== undefined;

  useEffect(() => {
    const handleCallback = async () => {
      if (hasError) {
        toast({
          title: "Erreur de connexion Google",
          description: "Une erreur s'est produite lors de la connexion.",
          variant: "destructive",
        });
        window.location.href = "/auth/login";
        return;
      }

      if (success === "true" && token && userStr) {
        try {
          const decodedUserStr = decodeURIComponent(userStr);
          const userData = JSON.parse(decodedUserStr);

          const roleString = String(userData.role || "user").toLowerCase().trim();
          const finalRole =
            roleString === "super_admin" || roleString === "super admin"
              ? "super_admin"
              : roleString === "admin"
              ? "admin"
              : "user";

          // ✅ On typpe ici
          const authUser: User = {
            id: userData.id,
            name: userData.name || userData.email?.split("@")[0] || "Utilisateur",
            email: userData.email,
            role: finalRole as "user" | "admin" | "super_admin", // ✅ Assertion ici
            avatar:
              userData.avatarUrl ||
              userData.avatar ||
              "https://i.ibb.co/C3R4f9gT/user.png?height=40&width=40",
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          // Stockage local
          localStorage.setItem("auth_token", token);
          const encryptedUser = await encryptData(JSON.stringify(authUser));
          localStorage.setItem("auth_user", encryptedUser);

          await setUser(authUser);

          // Redirection immédiate
          const targetUrl =
            authUser.role === "admin" || authUser.role === "super_admin"
              ? "/admin"
              : "/";
          window.location.href = targetUrl;
        } catch (err) {
          console.error("Erreur callback Google:", err);
          toast({
            title: "Erreur de connexion",
            description: "Impossible de traiter la réponse Google.",
            variant: "destructive",
          });
          window.location.href = "/auth/login";
        }
      } else {
        toast({
          title: "Paramètres manquants",
          description: "Les informations de connexion sont incomplètes.",
          variant: "destructive",
        });
        window.location.href = "/auth/login";
      }
    };

    handleCallback();
  }, [success, token, userStr, hasError, toast, setUser]);

  return null; // aucune page de chargement
}
