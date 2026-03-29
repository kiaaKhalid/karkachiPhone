"use client"

import { Facebook, Instagram, Twitter, Youtube, ExternalLink } from "lucide-react"

const socials = [
  { name: "Facebook", icon: Facebook, href: "#", color: "bg-blue-600 hover:bg-blue-700", followers: "12K" },
  { name: "Instagram", icon: Instagram, href: "#", color: "bg-gradient-to-br from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600", followers: "8K" },
  { name: "Twitter", icon: Twitter, href: "#", color: "bg-sky-500 hover:bg-sky-600", followers: "3K" },
  { name: "YouTube", icon: Youtube, href: "#", color: "bg-red-600 hover:bg-red-700", followers: "5K" },
]

export default function SocialMediaSection() {
  return (
    <section className="bg-secondary/30">
      <div className="section-container py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className="section-heading">Rejoignez Notre Communauté</h2>
          <p className="section-subheading mt-1">Suivez-nous sur les réseaux sociaux</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {socials.map(({ name, icon: Icon, href, color, followers }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${color} text-white rounded-2xl p-5 flex flex-col items-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1 group`}
            >
              <Icon className="w-7 h-7" />
              <div className="text-center">
                <p className="text-lg font-bold">{followers}</p>
                <p className="text-xs text-white/70">{name}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
