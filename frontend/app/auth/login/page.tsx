"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Chrome, Facebook, Apple } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDeliveryAuth } from "@/hooks/use-delivery-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login: userLogin, isAuthenticated: isUserAuthenticated, user: regularUser } = useAuth();
  const { login: deliveryLogin, isAuthenticated: isDeliveryAuthenticated, user: deliveryPartner } = useDeliveryAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isUserAuthenticated && regularUser) {
      const targetUrl = ["admin", "super_admin"].includes(regularUser.role) ? "/admin" : redirectTo;
      router.replace(targetUrl);
    } else if (isDeliveryAuthenticated && deliveryPartner) {
      router.replace("/delivery/dashboard");
    }
  }, [isUserAuthenticated, regularUser, isDeliveryAuthenticated, deliveryPartner, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userResult = await userLogin(email, password);

      if (userResult.success && userResult.user) {
        toast({
          title: "Connexion réussie !",
          description: `Bienvenue, ${userResult.user.name} !`,
        });
        const targetUrl = ["admin", "super_admin"].includes(userResult.user.role) ? "/admin" : redirectTo;
        router.replace(targetUrl);
        return;
      }

      const deliveryResult = await deliveryLogin(email, password);

      if (deliveryResult) {
        toast({
          title: "Connexion livreur réussie !",
          description: "Bienvenue, partenaire de livraison !",
        });
        router.replace("/delivery/dashboard");
        return;
      }

      setError(userResult.error || "Email ou mot de passe incorrect");
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: "Bientôt disponible",
      description: `La connexion via ${provider} sera bientôt disponible !`,
    });
  };

  if (isUserAuthenticated || isDeliveryAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bienvenue
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Connectez-vous pour continuer
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("Google")}
                className="col-span-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                <Chrome className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("Facebook")}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white transition-colors"
                disabled={isLoading}
              >
                <Facebook className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("Apple")}
              className="w-full bg-black hover:bg-gray-800 border-black text-white dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 transition-colors"
              disabled={isLoading}
            >
              <Apple className="h-4 w-4 mr-2" />
              Continuer avec Apple
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-600 dark:text-gray-400">
              Vous n'avez pas de compte ?{" "}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Inscrivez-vous
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
