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
    color: "from-red-500 to-pink-600",
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
    color: "from-green-500 to-emerald-600",
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
    color: "from-blue-500 to-cyan-600",
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
    color: "from-purple-500 to-violet-600",
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
    color: "from-orange-500 to-red-600",
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
    color: "from-indigo-500 to-purple-600",
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
    color: "from-yellow-500 to-orange-600",
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
    color: "from-teal-500 to-blue-600",
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
    color: "from-cyan-500 to-teal-600",
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
    color: "from-slate-500 to-gray-600",
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
  { label: "Réparations effectuées", value: "15,000+", icon: Wrench },
  { label: "Clients satisfaits", value: "98%", icon: Users },
  { label: "Années d'expérience", value: "8+", icon: Award },
  { label: "Temps moyen", value: "2h", icon: Clock },
]

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    device: "",
    problem: "",
    urgency: "",
    message: "",
  })
  const { toast } = useToast()

  const sendWhatsAppMessage = (service: any, isMicroService = false) => {
    const phoneNumber = "+212676423340"

    let message = `🔧 *Demande de Service*\n\n`
    message += `📱 *Service:* ${service.title}\n`
    message += `💰 *Prix:* ${service.price}\n`
    message += `⏱️ *Durée:* ${service.duration}\n`
    message += `📝 *Description:* ${service.description}\n\n`

    if (!isMicroService && service.features) {
      message += `✅ *Inclus:*\n`
      service.features.forEach((feature: string) => {
        message += `• ${feature}\n`
      })
      message += `\n`
    }

    message += `Je souhaite obtenir plus d'informations sur ce service et prendre rendez-vous.`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")

    toast({
      title: "Redirection vers WhatsApp",
      description: "Vous allez être redirigé vers WhatsApp pour finaliser votre demande.",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "Demande envoyée avec succès!",
      description: "Nous vous contacterons dans les plus brefs délais pour confirmer votre rendez-vous.",
    })

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      device: "",
      problem: "",
      urgency: "",
      message: "",
    })
    setSelectedService("")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Standard":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Avancé":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Expert":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('/Placeholder.png?height=600&width=1200')] bg-cover bg-center opacity-10"></div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Wrench className="w-5 h-5" />
              <span className="font-medium">Services de Réparation Professionnels</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              Réparation Expert
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Services de réparation spécialisés pour smartphones, tablettes, PC et appareils électroniques. Expertise
              technique avancée et garantie qualité.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <stat.icon className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Services Experts */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Services Experts</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Nos techniciens spécialisés interviennent sur tous types de réparations complexes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card
                  key={service.id}
                  className="group overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer h-full flex flex-col"
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-2xl bg-gradient-to-r ${service.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <Badge className={getDifficultyColor(service.difficulty)}>{service.difficulty}</Badge>
                    </div>

                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{service.description}</p>

                    <div className="space-y-2 flex-1">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{service.price}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {service.duration}
                        </div>
                      </div>
                      <Button
                        className={`bg-gradient-to-r ${service.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
                        onClick={() => sendWhatsAppMessage(service)}
                      >
                        Demander
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Micro-Services Express */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Micro-Services Express</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Services rapides et abordables pour l'entretien de vos appareils
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {microServices.map((service) => {
              const IconComponent = service.icon
              return (
                <Card
                  key={service.id}
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full flex flex-col"
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardContent className="p-6 text-center flex-1 flex flex-col">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8" />
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">{service.description}</p>

                    <div className="space-y-2 mt-auto">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{service.price}</div>
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {service.duration}
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 mt-4"
                        onClick={() => sendWhatsAppMessage(service, true)}
                      >
                        Demander
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Contact Info */}
        <section className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Adresse</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Marrakech, Maroc<br />
                  (4 Magasins disponibles)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Téléphone</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  +212 676-423340
                  <br />
                  Gérant: M. Zakaria
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Horaires</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Lun-Sam: 9h-19h
                  <br />
                  Dimanche: 10h-17h
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
