"use client"

import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the data to an API
    alert("Merci pour votre message ! Nous vous contacterons bientôt.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-background pt-4 font-inter text-foreground">
      <div className="section-container py-8 md:py-16">
        {/* Header Section */}
        <section className="text-center mb-16 max-w-4xl mx-auto px-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-6">
            Contactez-nous
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
            Nous sommes à votre <span className="text-accent">Écoute</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Vous avez une question sur un produit ou besoin d&apos;assistance technique ? 
            Notre équipe d&apos;experts est là pour vous aider du lundi au samedi.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24 px-4">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-8 rounded-[2rem] bg-secondary/30 border border-border/40 hover:border-accent/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Téléphone</h3>
              <p className="text-muted-foreground mb-1">+212 676-423340</p>
              <p className="text-xs text-accent font-bold uppercase tracking-widest">Disponible 9h - 19h</p>
            </div>

            <div className="p-8 rounded-[2rem] bg-secondary/30 border border-border/40 hover:border-accent/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-muted-foreground">contact@karkachiphone.com</p>
            </div>

            <div className="p-8 rounded-[2rem] bg-secondary/30 border border-border/40 hover:border-accent/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Adresse</h3>
              <p className="text-muted-foreground leading-relaxed">
                Avenue Mohamed V,<br />
                Marrakech, 40000, Maroc
              </p>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-accent/5 border border-accent/20 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <Clock className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-bold">Horaires</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span className="font-bold text-foreground">09:00 - 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-bold text-foreground">10:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="text-accent font-bold">Fermé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-8 md:p-12 rounded-[3rem] bg-secondary/20 border border-border/40 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
               
               <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Nom Complet</label>
                     <input 
                       type="text" 
                       required
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       placeholder="Votre nom"
                       className="w-full px-6 py-4 rounded-2xl bg-background border border-border/60 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                     />
                   </div>
                   <div className="space-y-3">
                     <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                     <input 
                       type="email" 
                       required
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       placeholder="votre@email.com"
                       className="w-full px-6 py-4 rounded-2xl bg-background border border-border/60 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                     />
                   </div>
                 </div>

                 <div className="space-y-3">
                   <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Sujet</label>
                   <input 
                     type="text" 
                     required
                     value={formData.subject}
                     onChange={(e) => setFormData({...formData, subject: e.target.value})}
                     placeholder="Comment pouvons-nous vous aider ?"
                     className="w-full px-6 py-4 rounded-2xl bg-background border border-border/60 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                   />
                 </div>

                 <div className="space-y-3">
                   <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                   <textarea 
                     rows={5}
                     required
                     value={formData.message}
                     onChange={(e) => setFormData({...formData, message: e.target.value})}
                     placeholder="Écrivez votre message ici..."
                     className="w-full px-6 py-4 rounded-2xl bg-background border border-border/60 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none resize-none"
                   />
                 </div>

                 <button 
                   type="submit"
                   className="w-full py-5 bg-accent text-white font-black rounded-2xl hover:bg-accent/90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-lg shadow-accent/20"
                 >
                   Envoyer le Message
                   <Send className="w-5 h-5" />
                 </button>
               </form>
            </div>
          </div>
        </div>

        {/* Live Chat Support Option */}
        <section className="text-center py-20 rounded-[3rem] bg-secondary/40 border border-border/40 relative overflow-hidden px-4">
          <div className="relative z-10">
            <MessageSquare className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">Besoin d&apos;une réponse immédiate ?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-10">
              Nos conseillers sont disponibles par WhatsApp pour un support en temps réel.
            </p>
            <a 
              href="https://wa.me/212676423340"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#25D366] text-white font-black rounded-full hover:scale-105 transition-all shadow-xl"
            >
              Discuter sur WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
