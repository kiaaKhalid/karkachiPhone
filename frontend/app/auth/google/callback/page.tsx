"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { encryptData } from "@/lib/security";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setUser } = useAuth();
  // Changé en string | null pour stocker la cible de redirection
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);

  const success = searchParams.get("success");
  const token = searchParams.get("token");
  const userStr = searchParams.get("user");
  // Correction pour le premier TS error : check explicite pour éviter la comparaison implicite
  const hasError = searchParams.get("error") !== null && searchParams.get("error") !== undefined;

  // Effet pour forcer la redirection une fois isRedirecting activé
  useEffect(() => {
    if (isRedirecting) {
      console.log("🔄 Force redirect triggered to:", isRedirecting);
      // Utilise window.location pour une redirection hard (plus fiable que router.replace dans ce contexte)
      window.location.href = window.location.origin + isRedirecting;
    }
  }, [isRedirecting]);

  useEffect(() => {
    const handleCallback = async () => {
      console.log("🔵 Google callback params:", { 
        success, 
        hasToken: !!token, 
        hasUserStr: !!userStr, 
        error: searchParams.get("error") 
      });

      if (hasError) {
        const errorMsg = searchParams.get("error") || "Erreur inconnue";
        console.error("❌ Google auth error:", errorMsg);
        toast({
          title: "Erreur de connexion Google",
          description: "Une erreur s'est produite lors de la connexion avec Google.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = window.location.origin + '/auth/login';
        }, 2000);
        return;
      }

      if (success === "true" && token && userStr) {
        try {
          let userData: any = null;

          // Parse userStr (URL decoded JSON)
          try {
            const decodedUserStr = decodeURIComponent(userStr);
            console.log("📝 Decoded user string:", decodedUserStr);
            userData = JSON.parse(decodedUserStr);
            console.log("✅ Parsed user data:", userData);
          } catch (e) {
            console.error("❌ Erreur parsing userStr:", userStr, e);
            toast({
              title: "Erreur",
              description: "Impossible de lire les données utilisateur.",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = window.location.origin + '/auth/login';
            }, 2000);
            return;
          }

          // Normalize role - handle SUPER_ADMIN correctly
          const rawRole = userData.role || "user";
          console.log("🎭 Raw role:", rawRole);
          
          // Convert role to lowercase and handle different formats
          const roleString = String(rawRole).toLowerCase().trim();
          console.log("🔄 Normalized role string:", roleString);

          // Handle all possible role formats
          let finalRole: "user" | "admin" | "super_admin";
          if (roleString === "super_admin" || roleString === "super admin") {
            finalRole = "super_admin";
          } else if (roleString === "admin") {
            finalRole = "admin";
          } else {
            finalRole = "user";
          }

          console.log("🎯 Final role:", finalRole);

          const authUser = {
            id: userData.id,
            name: userData.name || userData.email?.split("@")[0] || "Utilisateur",
            email: userData.email,
            role: finalRole,
            avatar: userData.avatarUrl || userData.avatar || "https://i.ibb.co/C3R4f9gT/user.png?height=40&width=40",
            phone: userData.phone || "",
            address: userData.address || "",
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          console.log("👤 Auth user to store:", authUser);

          // Stockage dans localStorage
          localStorage.setItem("auth_token", token);
          try {
            const encryptedUser = await encryptData(JSON.stringify(authUser));
            localStorage.setItem("auth_user", encryptedUser);
            console.log("💾 User data stored successfully");
          } catch (encryptError) {
            console.error("❌ Encryption error, storing without encryption:", encryptError);
            // Fallback: store without encryption
            localStorage.setItem("auth_user", JSON.stringify(authUser));
          }

          // Mise à jour du contexte auth
          await setUser(authUser);
          console.log("✅ Auth context updated");

          toast({
            title: "Connexion Google réussie !",
            description: `Bienvenue, ${authUser.name} !`,
          });

          // Determine redirect URL based on role
          const targetUrl = ["admin", "super_admin"].includes(authUser.role)
            ? "/admin"
            : "/";

          console.log("🔄 Redirecting to:", targetUrl);
          
          // Active l'état de redirection (le useEffect ci-dessus gérera la redirection hard)
          setIsRedirecting(targetUrl);

        } catch (err) {
          console.error("❌ Erreur callback Google:", err);
          toast({
            title: "Erreur de connexion",
            description: "Impossible de traiter la réponse Google. Veuillez réessayer.",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = window.location.origin + '/auth/login';
          }, 2000);
        }
      } else {
        // Fallback si paramètres manquants
        console.warn("⚠️ Missing parameters in callback:", { success, token, userStr });
        toast({
          title: "Paramètres manquants",
          description: "Les informations de connexion sont incomplètes.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = window.location.origin + '/auth/login';
        }, 2000);
      }
    };

    handleCallback();
  }, [success, token, userStr, hasError, toast, setUser]);

  // Si redirection en cours, affiche un message plus clair
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirection en cours...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Cette page se ferme automatiquement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Connexion en cours
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Traitement de votre connexion Google...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Cette page se fermera automatiquement
        </p>
      </div>
    </div>
  );
}