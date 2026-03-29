"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react"

const footerLinks = {
  shop: [
    { label: "Smartphones", href: "/categories" },
    { label: "Accessoires", href: "/categories" },
    { label: "Tablettes", href: "/categories" },
    { label: "Laptops", href: "/categories" },
    { label: "Deals", href: "/deals" },
  ],
  support: [
    { label: "FAQ", href: "/about" },
    { label: "Livraison", href: "/services" },
    { label: "Retours", href: "/services" },
    { label: "Garantie", href: "/services" },
    { label: "Contact", href: "/about" },
  ],
  company: [
    { label: "À Propos", href: "/about" },
    { label: "Nous Contacter", href: "/about" },
    { label: "Conditions d'utilisation", href: "/about" },
    { label: "Politique de confidentialité", href: "/about" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy-500 text-white">
      {/* Newsletter Strip */}
      <div className="border-b border-white/10">
        <div className="section-container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Abonnez-vous à notre newsletter</h3>
            <p className="text-sm text-white/60 mt-0.5">Recevez les dernières offres et nouveautés</p>
          </div>
          <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Votre adresse email..."
              className="flex-1 md:w-72 px-4 py-2.5 rounded-lg bg-white/10 border border-white/15
                         text-sm text-white placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
                         transition-all"
            />
            <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shrink-0">
              S&apos;abonner
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="font-bold text-lg leading-none">KARKACHI</span>
                <span className="block text-[10px] text-white/50 tracking-[0.2em] uppercase -mt-0.5">
                  Phone
                </span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Votre destination premium à Marrakech (4 Magasins). Dirigé par Mohamed Zakaria KARKACHI.
            </p>
            <div className="flex gap-2.5">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Boutique</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-orange-400" />
                <span>Marrakech, Maroc (4 Magasins)</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone className="w-4 h-4 shrink-0 text-orange-400" />
                <span>+212 676-423340</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail className="w-4 h-4 shrink-0 text-orange-400" />
                <span>contact@karkachiphone.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} KARKACHI PHONE. Tous droits réservés.</span>
          <div className="flex gap-4">
            <span>💳 CMI</span>
            <span>💳 Visa</span>
            <span>💳 Mastercard</span>
            <span>💵 Cash</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
