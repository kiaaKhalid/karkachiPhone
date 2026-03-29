"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Smartphone,
  Battery,
  Zap,
  Wrench,
  Cpu,
  Volume2,
  Clock,
  CheckCircle,
  Shield,
  Gauge,
  Microscope,
  Phone,
  MapPin,
  Calendar,
  Users,
  Award,
  HardDrive,
  Key,
  RotateCcw,
  Monitor,
  Laptop,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const services = [
  {
    id: "bypass",
    title: "Bypass & Déblocage",
    description: "Déblocage iCloud, FRP, réseau et autres verrous de sécurité",
    icon: Shield,
    price: "À partir de 80 MAD",
    duration: "2-4 heures",
    difficulty: "Expert",
    color: "accent",
    features: ["Déblocage iCloud", "Bypass FRP", "Déblocage réseau", "Suppression MDM"],
  },
  {
    id: "battery",
    title: "Changement Batterie",
    description: "Remplacement de batterie avec pièces originales et garantie",
    icon: Battery,
    price: "À partir de 45 MAD",
    duration: "30-60 min",
    difficulty: "Standard",
    color: "accent",
    features: ["Batteries originales", "Test de capacité", "Garantie 6 mois", "Recyclage ancien"],
  },
  {
    id: "charging",
    title: "Réparation Port de Charge",
    description: "Nettoyage, réparation ou remplacement du connecteur de charge",
    icon: Zap,
    price: "À partir de 35 MAD",
    duration: "45-90 min",
    difficulty: "Standard",
    color: "accent",
    features: ["Nettoyage connecteur", "Remplacement port", "Test de charge", "Vérification circuit"],
  },
  {
    id: "screen",
    title: "Réparation Écran",
    description: "Remplacement écran OLED/LCD avec tactile et garantie",
    icon: Smartphone,
    price: "À partir de 60 MAD",
    duration: "1-2 heures",
    difficulty: "Standard",
    color: "accent",
    features: ["Écrans OLED/LCD", "Tactile inclus", "Test complet", "Garantie 3 mois"],
  },
  {
    id: "microsoudure",
    title: "Micro-Soudure",
    description: "Réparation carte mère, BGA, reballing et composants",
    icon: Microscope,
    price: "À partir de 120 MAD",
    duration: "3-6 heures",
    difficulty: "Expert",
    color: "accent",
    features: ["Reballing BGA", "Réparation carte mère", "Diagnostic avancé", "Composants d'origine"],
  },
  {
    id: "audio",
    title: "Réparation Audio",
    description: "Réparation haut-parleurs, micros et problèmes audio",
    icon: Volume2,
    price: "À partir de 40 MAD",
    duration: "1-2 heures",
    difficulty: "Standard",
    color: "accent",
    features: ["Haut-parleur principal", "Micro principal", "Écouteur", "Test audio complet"],
  },
  {
    id: "flash",
    title: "Service Flash",
    description: "Flash firmware, installation ROM custom et récupération système",
    icon: Zap,
    price: "À partir de 50 MAD",
    duration: "1-3 heures",
    difficulty: "Expert",
    color: "accent",
    features: ["Flash firmware officiel", "ROM custom", "Récupération brick", "Downgrade/Upgrade"],
  },
  {
    id: "decodage",
    title: "Décodage",
    description: "Décodage réseau, SIM unlock et déblocage opérateur",
    icon: Key,
    price: "À partir de 30 MAD",
    duration: "30-60 min",
    difficulty: "Avancé",
    color: "accent",
    features: ["Décodage réseau", "SIM unlock", "Déblocage opérateur", "Code NCK/MCK"],
  },
  {
    id: "formatage-phone",
    title: "Formatage Téléphone",
    description: "Formatage complet, réinstallation système et optimisation",
    icon: RotateCcw,
    price: "À partir de 25 MAD",
    duration: "45-90 min",
    difficulty: "Standard",
    color: "accent",
    features: ["Hard reset", "Réinstallation OS", "Suppression virus", "Optimisation performance"],
  },
  {
    id: "formatage-pc",
    title: "Formatage PC/Laptop",
    description: "Formatage ordinateur, installation Windows/Linux et configuration",
    icon: Monitor,
    price: "À partir de 40 MAD",
    duration: "2-4 heures",
    difficulty: "Standard",
    color: "accent",
    features: ["Installation Windows/Linux", "Pilotes automatiques", "Logiciels essentiels", "Sauvegarde données"],
  },
]

const microServices = [
  {
    id: "cleaning",
    title: "Nettoyage Interne",
    description: "Nettoyage complet interne du téléphone",
    price: "25 MAD",
    duration: "30 min",
    icon: Wrench,
  },
  {
    id: "diagnostic",
    title: "Test Diagnostic",
    description: "Diagnostic complet des composants",
    price: "15 MAD",
    duration: "20 min",
    icon: Gauge,
  },
  {
    id: "software",
    title: "Mise à Jour Logicielle",
    description: "Installation dernière version iOS/Android",
    price: "20 MAD",
    duration: "45 min",
    icon: Cpu,
  },
  {
    id: "backup",
    title: "Sauvegarde Données",
    description: "Sauvegarde complète de vos données",
    price: "30 MAD",
    duration: "1 heure",
    icon: HardDrive,
  },
  {
    id: "virus-removal",
    title: "Suppression Virus",
    description: "Nettoyage malwares et virus",
    price: "35 MAD",
    duration: "1-2 heures",
    icon: Shield,
  },
  {
    id: "pc-diagnostic",
    title: "Diagnostic PC",
    description: "Test complet ordinateur/laptop",
    price: "20 MAD",
    duration: "30 min",
    icon: Laptop,
  },
]

const stats = [
  { label: "Réparations", value: "15,000+", icon: Wrench },
  { label: "Satisfaction", value: "98%", icon: Users },
  { label: "Expertise", value: "8+ Ans", icon: Award },
  { label: "Rapidité", value: "2h Moy.", icon: Clock },
]

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState("")
  const { toast } = useToast()

  const sendWhatsAppMessage = (service: any) => {
    const phoneNumber = "+212676423340"
    let message = `🔧 *Demande de Service*\n\n`
    message += `📱 *Service:* ${service.title}\n`
    message += `💰 *Prix:* ${service.price}\n`
    message += `⏱️ *Durée:* ${service.duration}\n`
    message += `📝 *Description:* ${service.description}\n\n`

    if (service.features) {
      message += `✅ *Inclus:*\n`
      service.features.forEach((feature: string) => {
        message += `• ${feature}\n`
      })
      message += `\n`
    }

    message += `Je souhaite obtenir plus d'informations sur ce service.`
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank")
    toast({ title: "WhatsApp", description: "Redirection vers WhatsApp..." })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero Section ── */}
      <section className="relative py-20 overflow-hidden bg-secondary/30">
        <div className="section-container relative z-10 text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1.5 border-accent/20 text-accent bg-accent/5 animate-fade-in">
            Expertise & Précision
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-slide-up">
            Nos Services de <span className="text-accent">Réparation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            Une équipe d'experts certifiés pour redonner vie à vos appareils. 
            Smartphones, PC et tablettes, nous traitons chaque panne avec précision.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto animate-fade-in-up">
            {stats.map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all">
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-3" />
                <div className="text-xl font-bold uppercase tracking-wider">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Services ── */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-12 space-y-3">
            <h2 className="section-heading">Expertise Technique</h2>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
            <p className="section-subheading max-w-xl mx-auto">
              Des interventions spécialisées sur les pannes les plus complexes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {services.map((service) => (
              <Card key={service.id} className="product-card group p-0">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest">
                    {service.difficulty}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                  </div>
                  
                  <div className="space-y-2 py-2">
                    {service.features.slice(0, 3).map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-foreground/80">
                        <CheckCircle className="w-3.5 h-3.5 text-accent" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <div className="space-y-0.5">
                      <div className="text-accent font-bold text-lg">{service.price}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.duration}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => sendWhatsAppMessage(service)}
                      className="bg-accent hover:bg-orange-600 text-white rounded-lg px-4"
                    >
                      Commander
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Express Services ── */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container">
          <div className="text-center mb-12 space-y-3">
            <h2 className="section-heading">Services Express</h2>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
            <p className="section-subheading">Réparations rapides en moins d'une heure.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {microServices.map((service) => (
              <div 
                key={service.id} 
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-accent/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                  <service.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{service.title}</div>
                  <div className="text-xs text-accent font-semibold">{service.price} — {service.duration}</div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => sendWhatsAppMessage(service)}
                  className="rounded-full text-accent hover:bg-accent/10"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Info Cards ── */}
      <section className="py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-8 rounded-3xl bg-secondary/20 border border-border/40 hover:bg-accent/[0.02] transition-colors">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl">Localisation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Marrakech, Maroc<br/>
                Quartier Industriel, Rue Al-Manar
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-3xl bg-secondary/20 border border-border/40 hover:bg-accent/[0.02] transition-colors">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl">Contact Direct</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                +212 676-423340<br/>
                Disponsible sur WhatsApp 24/7
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-3xl bg-secondary/20 border border-border/40 hover:bg-accent/[0.02] transition-colors">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl">Horaires</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Lundi - Samedi : 09h00 - 19h30<br/>
                Dimanche : 10h00 - 17h00
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
