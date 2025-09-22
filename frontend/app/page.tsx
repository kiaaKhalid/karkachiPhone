import HeroSection from "@/components/hero-section"
import PromotionalBannerSection from "@/components/promotional-banner-section"
import MixedProductsSection from "@/components/mixed-products-section"
import DealsSection from "@/components/deals-section"
import ProductsForYouSection from "@/components/products-for-you-section"
import NewsletterSection from "@/components/newsletter-section"
import SocialMediaSection from "@/components/social-media-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <PromotionalBannerSection />
      <HeroSection />
      <MixedProductsSection />
      <DealsSection />
      <ProductsForYouSection />
      <NewsletterSection />
      <SocialMediaSection />
    </main>
  )
}
