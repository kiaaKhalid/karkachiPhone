import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, Truck, Shield, Award, ChevronRight, Check, Zap, Gift, Clock } from "lucide-react"
import Link from "next/link"
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button"

interface PromotionPageProps {
  params: {
    id: string
  }
}

const promotionalOffers = [
  {
    id: "1",
    title: "APPLE WATCH SERIES 9",
    subtitle: "Pack Complet Premium",
    description: "L'avenir au poignet avec des fonctionnalités révolutionnaires",
    badge: "NOUVEAU",
    badgeColor: "bg-red-500",
    originalPrice: 1199,
    salePrice: 899,
    discount: 25,
    savings: 300,
    image: "/images/apple-watch-series-9.png",
    gallery: [
      "/images/apple-watch-series-9.png",
      "/Placeholder.png?height=600&width=600&text=Watch+Front",
      "/Placeholder.png?height=600&width=600&text=Watch+Side",
      "/Placeholder.png?height=600&width=600&text=Watch+Back",
    ],
    includedItems: [
      {
        name: "Apple Watch Series 9 GPS + Cellular 45mm",
        description: "Boîtier en aluminium avec bracelet sport",
        image: "/images/apple-watch-series-9.png",
        value: 529,
      },
      {
        name: "Bracelet Sport Premium",
        description: "Bracelet sport supplémentaire en silicone",
        image: "/Placeholder.png?height=200&width=200&text=Bracelet",
        value: 59,
      },
      {
        name: "Chargeur sans fil MagSafe",
        description: "Chargeur rapide sans fil compatible",
        image: "/Placeholder.png?height=200&width=200&text=Charger",
        value: 39,
      },
      {
        name: "Étui de protection premium",
        description: "Protection complète avec verre trempé",
        image: "/Placeholder.png?height=200&width=200&text=Case",
        value: 29,
      },
    ],
    features: [
      "Écran Retina Always-On le plus lumineux",
      "Puce S9 avec Neural Engine 4 cœurs",
      "GPS de précision à double fréquence",
      "Résistance à l'eau jusqu'à 50 mètres",
      "Détection de chute et d'accident",
      "Suivi avancé de la condition physique",
      "Autonomie jusqu'à 18 heures",
      "Recharge rapide (0-80% en 45 min)",
    ],
    specifications: {
      Écran: "45mm Retina LTPO OLED Always-On",
      Processeur: "Puce Apple S9 SiP",
      Stockage: "64 GB",
      Connectivité: "GPS + Cellular, Wi-Fi, Bluetooth 5.3",
      Capteurs: "ECG, Oxygène sanguin, Température",
      Résistance: "WR50 (50 mètres)",
      Matériaux: "Aluminium recyclé, Verre Ion-X",
      Compatibilité: "iPhone Xs ou ultérieur avec iOS 17",
    },
    reviews: {
      average: 4.9,
      count: 2847,
      breakdown: {
        5: 89,
        4: 8,
        3: 2,
        2: 1,
        1: 0,
      },
    },
    limitedTime: true,
    expiresAt: "2024-02-15T23:59:59Z",
    stock: 47,
    totalValue: 656,
  },
  {
    id: "2",
    title: "IPHONE 15 PRO MAX",
    subtitle: "Pack Titanium Premium",
    description: "Titanium. Si fort. Si léger. Technologie révolutionnaire.",
    badge: "POPULAIRE",
    badgeColor: "bg-blue-500",
    originalPrice: 1599,
    salePrice: 1299,
    discount: 19,
    savings: 300,
    image: "/images/iphone-15-pro-max.png",
    gallery: [
      "/images/iphone-15-pro-max.png",
      "/Placeholder.png?height=600&width=600&text=iPhone+Front",
      "/Placeholder.png?height=600&width=600&text=iPhone+Side",
      "/Placeholder.png?height=600&width=600&text=iPhone+Back",
    ],
    includedItems: [
      {
        name: "iPhone 15 Pro Max 256GB Titanium",
        description: "Smartphone avec puce A17 Pro et caméra 48MP",
        image: "/images/iphone-15-pro-max.png",
        value: 1449,
      },
      {
        name: "Coque MagSafe en cuir",
        description: "Protection premium avec support MagSafe",
        image: "/Placeholder.png?height=200&width=200&text=Case",
        value: 69,
      },
      {
        name: "Chargeur MagSafe 15W",
        description: "Chargeur sans fil magnétique rapide",
        image: "/Placeholder.png?height=200&width=200&text=Charger",
        value: 49,
      },
      {
        name: "Câble USB-C vers Lightning",
        description: "Câble de charge et synchronisation 1m",
        image: "/Placeholder.png?height=200&width=200&text=Cable",
        value: 32,
      },
    ],
    features: [
      "Écran Super Retina XDR 6,7 pouces",
      "Puce A17 Pro avec GPU 6 cœurs",
      "Système de caméra Pro 48MP",
      "Zoom optique 5x avec téléobjectif",
      "Boîtier en titane de qualité aérospatiale",
      "Bouton Action personnalisable",
      "USB-C avec USB 3 pour transferts rapides",
      "Autonomie jusqu'à 29 heures de vidéo",
    ],
    specifications: {
      Écran: "6,7 pouces Super Retina XDR OLED",
      Processeur: "Puce A17 Pro",
      Stockage: "256 GB",
      Caméra: "48MP Principal, 12MP Ultra Grand Angle, 12MP Téléobjectif",
      Connectivité: "5G, Wi-Fi 6E, Bluetooth 5.3",
      Résistance: "IP68 (6 mètres jusqu'à 30 minutes)",
      Matériaux: "Titane de qualité aérospatiale",
      Système: "iOS 17",
    },
    reviews: {
      average: 4.8,
      count: 3542,
      breakdown: {
        5: 85,
        4: 12,
        3: 2,
        2: 1,
        1: 0,
      },
    },
    limitedTime: true,
    expiresAt: "2024-02-20T23:59:59Z",
    stock: 23,
    totalValue: 1599,
  },
  {
    id: "3",
    title: "SAMSUNG GALAXY S24 ULTRA",
    subtitle: "Pack Galaxy AI Premium",
    description: "Galaxy AI is here. Intelligence artificielle intégrée.",
    badge: "IA INTÉGRÉE",
    badgeColor: "bg-green-500",
    originalPrice: 1499,
    salePrice: 1199,
    discount: 20,
    savings: 300,
    image: "/images/samsung-galaxy-s24-ultra.png",
    gallery: [
      "/images/samsung-galaxy-s24-ultra.png",
      "/Placeholder.png?height=600&width=600&text=Galaxy+Front",
      "/Placeholder.png?height=600&width=600&text=Galaxy+Side",
      "/Placeholder.png?height=600&width=600&text=Galaxy+Back",
    ],
    includedItems: [
      {
        name: "Galaxy S24 Ultra 512GB Titanium",
        description: "Smartphone avec Galaxy AI et S Pen intégré",
        image: "/images/samsung-galaxy-s24-ultra.png",
        value: 1349,
      },
      {
        name: "Galaxy Buds2 Pro",
        description: "Écouteurs sans fil avec réduction de bruit",
        image: "/images/samsung-galaxy-buds-pro.png",
        value: 229,
      },
      {
        name: "Chargeur sans fil 15W",
        description: "Station de charge rapide sans fil",
        image: "/Placeholder.png?height=200&width=200&text=Wireless+Charger",
        value: 59,
      },
      {
        name: "Étui S Pen premium",
        description: "Protection avec emplacement S Pen",
        image: "/Placeholder.png?height=200&width=200&text=S+Pen+Case",
        value: 49,
      },
    ],
    features: [
      "Écran Dynamic AMOLED 2X 6,8 pouces",
      "Processeur Snapdragon 8 Gen 3",
      "Galaxy AI intégrée pour productivité",
      "Caméra 200MP avec zoom 100x",
      "S Pen intégré avec fonctions AI",
      "Boîtier en titane premium",
      "Batterie 5000mAh avec charge 45W",
      "Résistance IP68 certifiée",
    ],
    specifications: {
      Écran: "6,8 pouces Dynamic AMOLED 2X",
      Processeur: "Snapdragon 8 Gen 3 for Galaxy",
      Stockage: "512 GB",
      Caméra: "200MP Principal, 50MP Périscope, 12MP Ultra Grand Angle",
      Connectivité: "5G, Wi-Fi 7, Bluetooth 5.3",
      Batterie: "5000mAh avec charge rapide 45W",
      Matériaux: "Titane avec Gorilla Glass Armor",
      Système: "Android 14 avec One UI 6.1",
    },
    reviews: {
      average: 4.7,
      count: 2156,
      breakdown: {
        5: 78,
        4: 18,
        3: 3,
        2: 1,
        1: 0,
      },
    },
    limitedTime: true,
    expiresAt: "2024-02-25T23:59:59Z",
    stock: 31,
    totalValue: 1686,
  },
]

export default async function PromotionPage({ params }: PromotionPageProps) {
  const promotion = promotionalOffers.find((p) => p.id === params.id)

  if (!promotion) {
    notFound()
  }

  const timeLeft = new Date(promotion.expiresAt).getTime() - new Date().getTime()
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 sm:pt-28">
      <div className="container mx-auto px-4 py-8 lg:py-16 lg:pt-1">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/promotions" className="hover:text-gray-900">
            Promotions
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{promotion.title}</span>
        </nav>

        {/* Limited Time Banner */}
        {promotion.limitedTime && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 animate-pulse" />
                <div>
                  <h3 className="text-xl font-bold">Offre Limitée!</h3>
                  <p className="text-red-100">Plus que {daysLeft} jours pour profiter de cette promotion</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black">-{promotion.discount}%</div>
                <div className="text-sm">Économisez €{promotion.savings}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Left Column - Product Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 shadow-lg">
              <img
                src={promotion.image || "/Placeholder.png"}
                alt={promotion.title}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {promotion.gallery.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-xl p-2 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <img
                    src={image || "/Placeholder.png"}
                    alt={`${promotion.title} ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Badge className={`${promotion.badgeColor} text-white px-4 py-2 rounded-full font-bold`}>
                  {promotion.badge}
                </Badge>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(promotion.reviews.average) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-lg font-semibold text-gray-900 ml-2">{promotion.reviews.average}/5</span>
                  <span className="text-gray-600">({promotion.reviews.count.toLocaleString()} avis)</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">{promotion.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{promotion.subtitle}</p>
              <p className="text-lg text-gray-700 leading-relaxed">{promotion.description}</p>
            </div>

            {/* Pricing */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl font-black text-gray-900">€{promotion.salePrice}</div>
                    <div className="text-lg text-gray-500 line-through">€{promotion.originalPrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">-{promotion.discount}%</div>
                    <div className="text-sm text-green-600 bg-green-200 px-3 py-1 rounded-full font-bold">
                      Économisez €{promotion.savings}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Valeur totale du pack:</span>
                    <span className="font-bold text-gray-900">€{promotion.totalValue}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Votre prix:</span>
                    <span className="font-bold text-green-600">€{promotion.salePrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Status */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-700 font-medium">Stock limité: {promotion.stock} unités restantes</span>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Dépêchez-vous!
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Gift className="mr-3 h-6 w-6" />
                ACHETER MAINTENANT - €{promotion.salePrice}
                <Zap className="ml-3 h-6 w-6" />
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white py-4 rounded-xl font-bold bg-transparent"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Favoris
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-4 rounded-xl font-bold bg-transparent"
                >
                  Partager
                </Button>
              </div>
            </div>

            {/* Shipping & Services */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Livraison gratuite</p>
                    <p className="text-sm text-gray-600">Expédition sous 24h</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Garantie 2 ans</p>
                    <p className="text-sm text-gray-600">Retour 30 jours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pack Contents */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Gift className="mr-3 h-6 w-6 text-green-600" />
              Contenu du Pack Premium
            </CardTitle>
            <CardDescription className="text-lg">
              Tout ce dont vous avez besoin pour une expérience complète
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotion.includedItems.map((item, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-xl p-4 shadow-sm">
                    <img
                      src={item.image || "/Placeholder.png"}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Valeur: €{item.value}
                  </Badge>
                </div>
              ))}
            </div>
            <Separator className="my-6" />
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">Valeur totale si acheté séparément:</p>
              <p className="text-3xl font-black text-gray-900">€{promotion.totalValue}</p>
              <p className="text-xl text-green-600 font-bold">
                Votre économie: €{promotion.totalValue - promotion.salePrice}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features & Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Award className="mr-3 h-5 w-5 text-blue-600" />
                Caractéristiques Principales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {promotion.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Spécifications Techniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(promotion.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start border-b border-gray-100 pb-2">
                    <span className="font-medium text-gray-600 flex-shrink-0 w-1/3">{key}:</span>
                    <span className="text-gray-900 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Summary */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Star className="mr-3 h-5 w-5 text-yellow-500" />
              Avis Clients ({promotion.reviews.count.toLocaleString()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-5xl font-black text-gray-900 mb-2">{promotion.reviews.average}</div>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(promotion.reviews.average) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">Basé sur {promotion.reviews.count.toLocaleString()} avis</p>
              </div>
              <div className="space-y-2">
                {Object.entries(promotion.reviews.breakdown)
                  .reverse()
                  .map(([stars, percentage]) => (
                    <div key={stars} className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-8">{stars}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12 border-2 border-green-200">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Prêt à profiter de cette offre?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ne manquez pas cette opportunité unique d'obtenir le pack complet Apple Watch Series 9 avec tous les
            accessoires essentiels à un prix exceptionnel.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Gift className="mr-3 h-6 w-6" />
            COMMANDER MAINTENANT - €{promotion.salePrice}
            <Zap className="ml-3 h-6 w-6" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">✓ Livraison gratuite ✓ Garantie 2 ans ✓ Retour 30 jours</p>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton />
    </div>
  )
}

export async function generateMetadata({ params }: PromotionPageProps) {
  const promotion = promotionalOffers.find((p) => p.id === params.id)

  if (!promotion) {
    return {
      title: "Promotion Not Found",
    }
  }

  return {
    title: `${promotion.title} - Promotion Exclusive`,
    description: `${promotion.description} - Économisez €${promotion.savings} sur ce pack complet!`,
  }
}
