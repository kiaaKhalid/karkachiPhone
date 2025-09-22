"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  YoutubeIcon,
  MessageCircle,
  Users,
  Heart,
  Share2,
  ExternalLink,
  TrendingUp,
} from "lucide-react"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

const socialPlatforms = [
  {
    name: "Instagram",
    handle: "@techstore",
    followers: "245K",
    icon: InstagramIcon,
    color: "from-pink-500 to-purple-500",
    bgColor: "bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20",
    description: "Inspiration technologique quotidienne & vidéos de déballage",
    engagement: "12.5K",
    link: "https://instagram.com/techstore",
  },
  {
    name: "YouTube",
    handle: "@TechStoreOfficial",
    followers: "189K",
    icon: YoutubeIcon,
    color: "from-red-500 to-red-600",
    bgColor: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
    description: "Critiques approfondies & tutoriels technologiques",
    engagement: "8.9K",
    link: "https://youtube.com/@techstore",
  },
  {
    name: "Twitter",
    handle: "@techstore",
    followers: "156K",
    icon: TwitterIcon,
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
    description: "Dernières nouvelles technologiques & mises à jour rapides",
    engagement: "5.2K",
    link: "https://twitter.com/techstore",
  },
  {
    name: "Facebook",
    handle: "TechStore",
    followers: "98K",
    icon: FacebookIcon,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    description: "Discussions communautaires & support",
    engagement: "3.8K",
    link: "https://facebook.com/techstore",
  },
]

const recentPosts = [
  {
    platform: "Instagram",
    content: "Déballage du nouvel iPhone 15 Pro Max ! La finition en titane est absolument magnifique ✨",
    likes: 2847,
    comments: 156,
    time: "Il y a 2h",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQh3KQfAY45SJVl3-T3ZT0UjIyGV4W9MqCSH_687h8qrl6yxByyi-pIjdyeDQBpLmrcFE&usqp=CAU",
    link: "https://www.instagram.com/reel/CzpPa-RvTnV/"
  },
  {
    platform: "YouTube",
    content: "NOUVELLE VIDÉO : MacBook Pro M3 vs M2 - Est-ce que la mise à jour vaut le coup ? Comparaison complète à l'intérieur !",
    likes: 1923,
    comments: 89,
    time: "Il y a 5h",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3ki49jJ2QBFjw2eid1kMdp7HiZJTSQmZoDw&s",
    link: "https://www.youtube.com/watch?v=l3mBLetnQpk&pp=ygUUTWFjQm9vayBQcm8gTTMgdnMgTTLSBwkJsgkBhyohjO8%3D"
  },
  {
    platform: "Twitter",
    content: "🚨 Alerte VENTE FLASH : 30 % de réduction sur tous les appareils Samsung Galaxy pendant les prochaines 24 heures ! Ne ratez pas cette offre 🔥",
    likes: 892,
    comments: 45,
    time: "Il y a 1 jour",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQMVFprlD1eyPW7ND-iNCxqlmcKcQeeMG5Gg&s",
    link: "https://x.com/SamsungMaroc/status/1497297670855172096"
  },
]

export default function SocialMediaSection() {
  const [followedPlatforms, setFollowedPlatforms] = useState<string[]>([])

  const handleFollow = (platform: string) => {
    setFollowedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
  }

  return (
    <section className="bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Connectez-vous avec nous</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Suivez-nous sur les réseaux sociaux pour les dernières mises à jour, promotions et actualités technologiques !
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            href="#"
            className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
            prefetch={false}
          >
            <Facebook className="h-8 w-8" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link
            href="#"
            className="text-gray-700 hover:text-blue-400 dark:text-gray-300 dark:hover:text-blue-300 transition-colors"
            prefetch={false}
          >
            <Twitter className="h-8 w-8" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="#"
            className="text-gray-700 hover:text-pink-500 dark:text-gray-300 dark:hover:text-pink-400 transition-colors"
            prefetch={false}
          >
            <Instagram className="h-8 w-8" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link
            href="#"
            className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors"
            prefetch={false}
          >
            <Youtube className="h-8 w-8" />
            <span className="sr-only">YouTube</span>
          </Link>
        </div>

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 mt-12">
          <Badge className="bg-gradient-to-r from-[#01A0EA] to-[#03669A] text-white px-4 py-2 text-sm font-medium mb-4 shadow-sm">
            <Users className="w-4 h-4 mr-1" />
            Rejoignez notre communauté
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-[#01A0EA] to-[#03669A] bg-clip-text text-transparent">
              Suivez-nous
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Restez connecté avec nous sur toutes les plateformes pour les dernières mises à jour, du contenu exclusif et des informations technologiques
          </p>
        </div>

        {/* Social Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 sm:mb-16">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">688K+</div>
            <div className="text-muted-foreground">Followers Totals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">30.4K</div>
            <div className="text-muted-foreground">Engagement Mensuel</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">4.8★</div>
            <div className="text-muted-foreground">Évaluation de la communauté</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">24/7</div>
            <div className="text-muted-foreground">Support disponible</div>
          </div>
        </div>

        {/* Social Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {socialPlatforms.map((platform) => (
            <Card
              key={platform.name}
              className={`group hover:shadow-xl transition-all duration-300 border-border ${platform.bgColor} backdrop-blur-sm`}
            >
              <CardContent className="p-6 text-center">
                {/* Platform Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${platform.color} rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <platform.icon className="w-8 h-8 text-white" />
                </div>

                {/* Platform Info */}
                <h3 className="text-xl font-bold text-foreground mb-1">{platform.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{platform.handle}</p>
                <p className="text-xs text-muted-foreground mb-4">{platform.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{platform.followers}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{platform.engagement}</div>
                    <div className="text-xs text-muted-foreground">Moyenne de Likes</div>
                  </div>
                </div>

                {/* Follow Button */}
                <Button
                  size="sm"
                  className={`w-full mb-3 ${
                    followedPlatforms.includes(platform.name)
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : `bg-gradient-to-r ${platform.color} hover:opacity-90 text-white`
                  } shadow-md hover:shadow-lg transition-all duration-300`}
                  onClick={() => handleFollow(platform.name)}
                >
                  {followedPlatforms.includes(platform.name) ? (
                    <>
                      <Users className="w-4 h-4 mr-1" />
                      Abonné
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-1" />
                      Suivre
                    </>
                  )}
                </Button>

                {/* Visit Profile Link */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs border-border hover:border-[#01A0EA] hover:text-[#01A0EA] shadow-sm hover:shadow-md bg-transparent"
                  asChild
                >
                  <Link href={platform.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Visiter le profil
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">Publications récentes</h3>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 shadow-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              Tendance
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((post, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-border bg-background/80 backdrop-blur-sm"
              >
                <CardContent className="p-4">
                  {post.image && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={post.image || "/Placeholder.png"}
                        alt="Contenu de la publication"
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <Badge className="text-xs px-2 py-1 bg-muted text-muted-foreground">{post.platform}</Badge>
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                  </div>

                  <p className="text-sm text-foreground mb-4 line-clamp-3">{post.content}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 px-2 hover:text-[#01A0EA]">
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Link to the post */}
                  <Link href={post.link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full text-xs border-border hover:border-[#01A0EA] hover:text-[#01A0EA] shadow-sm hover:shadow-md bg-transparent">
                      Voir la publication
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#01A0EA]/5 to-[#03669A]/5 rounded-2xl p-8 sm:p-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Rejoignez notre communauté technologique dès aujourd'hui !</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Obtenez un accès exclusif aux astuces technologiques, aux lancements de produits et connectez-vous avec d'autres passionnés de technologie
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#01A0EA] to-[#03669A] hover:from-[#01A0EA]/90 hover:to-[#03669A]/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="w-5 h-5 mr-2" />
              Rejoindre la communauté
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#01A0EA] text-[#01A0EA] hover:bg-[#01A0EA] hover:text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md bg-transparent"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contacter le support
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
