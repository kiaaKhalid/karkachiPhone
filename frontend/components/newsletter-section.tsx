"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail, Gift, Bell, Star, ArrowRight, Check } from "lucide-react"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    // Simuler un appel API
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail("")
    }, 1500)
  }

  const benefits = [
    {
      icon: Gift,
      title: "Offres Exclusives",
      description: "Accédez à des réductions réservées aux abonnés et des offres spéciales",
    },
    {
      icon: Bell,
      title: "Nouveaux Arrivages",
      description: "Soyez le premier à découvrir les derniers produits et lancements",
    },
    {
      icon: Star,
      title: "Critiques d'Experts",
      description: "Recevez des recommandations de produits choisies par nos experts en technologie",
    },
  ]

  if (isSubscribed) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-100/30 via-yellow-50/40 to-amber-100/20 dark:from-amber-900/10 dark:via-yellow-900/20 dark:to-amber-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Bienvenue dans la famille ! 🎉</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Merci de vous être abonné ! Vérifiez votre boîte de réception pour une offre de bienvenue spéciale.
            </p>
            <Button
              onClick={() => setIsSubscribed(false)}
              variant="outline"
              className="border-[#01A0EA] text-[#01A0EA] hover:bg-[#01A0EA] hover:text-white shadow-sm hover:shadow-md"
            >
              S'abonner avec un autre email
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-100/30 via-yellow-50/40 to-amber-100/20 dark:from-amber-900/10 dark:via-yellow-900/20 dark:to-amber-900/10 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-yellow-200/20 to-amber-200/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-gradient-to-r from-[#01A0EA] to-[#03669A] text-white px-4 py-2 text-sm font-medium mb-4 shadow-sm">
              <Mail className="w-4 h-4 mr-1" />
              Restez Connecté
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              <span className="bg-gradient-to-r from-[#01A0EA] to-[#03669A] bg-clip-text text-transparent">
                Ne Manquez Aucune Offre
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rejoignez plus de 100 000 passionnés de technologie et obtenez un accès exclusif aux meilleures offres, aux derniers produits et aux conseils d'experts directement dans votre boîte de réception.
            </p>
          </div>

          {/* Avantages */}
          <div className="flex overflow-x-auto gap-6 sm:gap-8 mb-12 md:grid md:grid-cols-3 md:overflow-visible">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group flex-shrink-0 w-64 md:w-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#01A0EA] to-[#03669A] rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Formulaire d'inscription à la newsletter */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-border">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Entrez votre adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 px-4 text-base border-border focus:border-[#01A0EA] focus:ring-[#01A0EA] shadow-sm"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 px-8 bg-gradient-to-r from-[#01A0EA] to-[#03669A] hover:from-[#01A0EA]/90 hover:to-[#03669A]/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Abonnement en cours...
                      </div>
                    ) : (
                      <>
                        Abonnez-vous maintenant
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  En vous abonnant, vous acceptez notre{" "}
                  <a href="/privacy" className="text-[#01A0EA] hover:underline">
                    Politique de Confidentialité
                  </a>{" "}
                  et nos{" "}
                  <a href="/terms" className="text-[#01A0EA] hover:underline">
                    Conditions d'Utilisation
                  </a>
                  . Vous pouvez vous désabonner à tout moment.
                </p>
              </form>

              {/* Témoignages sociaux */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-gradient-to-r from-[#01A0EA] to-[#03669A] rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-medium"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <span>Rejoignez 100 000+ abonnés</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>4.9/5 avis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
