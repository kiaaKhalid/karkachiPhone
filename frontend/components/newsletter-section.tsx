"use client"

import { Mail } from "lucide-react"

export default function NewsletterSection() {
  return (
    <section className="bg-navy-500 text-white">
      <div className="section-container py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Restez Informé des Dernières Offres
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            Inscrivez-vous pour recevoir les promotions exclusives et les nouveaux arrivages
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Votre adresse email..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/15
                         text-sm text-white placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-orange-500/50
                         transition-all"
            />
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors shrink-0">
              S&apos;abonner
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
