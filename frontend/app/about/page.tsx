import { Card, CardContent } from "@/components/ui/card"
import { Globe, Users, Lightbulb, ExternalLink, Github, Linkedin, Smartphone, ShieldCheck, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-4 font-inter text-foreground">
      <div className="section-container py-8 md:py-16">
        {/* Hero Section */}
        <section className="text-center mb-20 max-w-4xl mx-auto px-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-6">
            Notre Histoire
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
            Passionnés par la <span className="text-accent">Technologie</span> Mobile
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Chez <span className="font-bold text-foreground">KARKACHI PHONE</span>, nous sommes passionnés par la connexion avec les dernières et meilleures
            de produits, des prix compétitifs et un service client exceptionnel depuis 2009.
          </p>
        </section>

        {/* Vision/Mission Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 pr-4 pl-4">
          <div className="p-8 rounded-[2rem] bg-secondary/50 border border-border/40 hover:border-accent/20 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
              <Globe className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Notre Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              Être la destination en ligne leader pour la technologie mobile au Maroc, permettant à tous d&apos;accéder à des
              appareils innovants qui améliorent leur vie quotidienne.
            </p>
          </div>
          
          <div className="p-8 rounded-[2rem] bg-secondary/50 border border-border/40 hover:border-accent/20 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
              <Lightbulb className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Notre Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              Fournir une gamme diversifiée de téléphones et d&apos;accessoires de haute qualité, couplée à une
              expérience d&apos;achat intuitive et un support client inégalé.
            </p>
          </div>

          <div className="p-8 rounded-[2rem] bg-secondary/50 border border-border/40 hover:border-accent/20 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Nos Valeurs</h3>
            <p className="text-muted-foreground leading-relaxed">
              La satisfaction client, l&apos;innovation, l&apos;intégrité et un engagement constant envers l&apos;excellence guident chacune de nos décisions.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-secondary/30 rounded-[3rem] p-8 md:p-16 mb-24 border border-border/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Un Voyage vers l&apos;Innovation</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Ce qui a commencé comme une petite entreprise passionnée en 2009 s&apos;est développé en une plateforme de confiance, servant des milliers de clients satisfaits.
                </p>
                <p>
                  Nous croyons qu&apos;un téléphone mobile est plus qu&apos;un simple appareil ; c&apos;est une passerelle vers la connexion, la créativité et la productivité. C&apos;est pourquoi nous sélectionnons méticuleusement chaque produit.
                </p>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-black text-accent tracking-tighter">15ans+</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expertise</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-accent tracking-tighter">10k+</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clients</div>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1556740734-7f9a2b7a0f4?q=80&w=2070&auto=format&fit=crop"
                alt="Our Workspace"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">L&apos;Équipe de Développement</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
              Ce projet e-commerce premium a été conçu et développé par une équipe passionnée par l&apos;excellence UI/UX.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto px-4">
             {/* KIAA Khalid */}
            <div className="bg-secondary/20 border border-border/40 rounded-[2.5rem] p-8 md:p-10 hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-accent rounded-full blur-xl opacity-20 scale-125" />
                  <Image
                    src="https://i.ibb.co/gFd7hDDY/khalid-profile-copy.jpg"
                    alt="KIAA Khalid"
                    width={140}
                    height={140}
                    className="rounded-full relative object-cover border-4 border-background shadow-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1">KIAA Khalid</h3>
                <p className="text-accent font-bold text-sm tracking-widest uppercase mb-4">Software Engineer</p>
                <p className="text-muted-foreground mb-8 line-clamp-3 text-sm leading-relaxed">
                  Expert en architecture robuste et développement Full Stack. Maîtrise de Spring Boot, React et des workflows CI/CD pour des solutions évolutives.
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {["Spring Boot", "Next.js", "MySQL", "React"].map(skill => (
                    <span key={skill} className="px-3 py-1 bg-background/50 text-[10px] font-bold uppercase border border-border/40 rounded-full">{skill}</span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Link href="https://github.com/kiaaKhalid" target="_blank" className="p-3 rounded-full bg-foreground text-background hover:scale-110 transition-all"><Github className="w-5 h-5" /></Link>
                  <Link href="https://www.linkedin.com/in/khalid-kiaa-bitkal/" target="_blank" className="p-3 rounded-full bg-[#0077b5] text-white hover:scale-110 transition-all"><Linkedin className="w-5 h-5" /></Link>
                  <Link href="https://kiaa-khalid.vercel.app/" target="_blank" className="p-3 rounded-full bg-accent text-white hover:scale-110 transition-all"><ExternalLink className="w-5 h-5" /></Link>
                </div>
              </div>
            </div>

            {/* Mohamed Karkachi */}
            <div className="bg-secondary/20 border border-border/40 rounded-[2.5rem] p-8 md:p-10 hover:shadow-xl transition-all group overflow-hidden relative text-foreground">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-accent rounded-full blur-xl opacity-20 scale-125" />
                  <Image
                    src="https://media.licdn.com/dms/image/v2/D4E03AQE6z0oxYmY00w/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1674604440585?e=1758758400&v=beta&t=fktYJbT0mXyYMpeoQngLBzC4crvomloqqc8K-I7y9RE"
                    alt="Mohamed Karkachi"
                    width={140}
                    height={140}
                    className="rounded-full relative object-cover border-4 border-background shadow-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1">Mohamed Karkachi</h3>
                <p className="text-accent font-bold text-sm tracking-widest uppercase mb-4">Frontend Engineer</p>
                <p className="text-muted-foreground mb-8 line-clamp-3 text-sm leading-relaxed">
                  Spécialiste UI/UX et interfaces interactives. Passionné par la création d&apos;expériences utilisateur fluides, élégantes et performantes.
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {["UI/UX", "Tailwind", "TypeScript", "Figma"].map(skill => (
                    <span key={skill} className="px-3 py-1 bg-background/50 text-[10px] font-bold uppercase border border-border/40 rounded-full">{skill}</span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Link href="https://github.com/MohamedKARKACHI" target="_blank" className="p-3 rounded-full bg-foreground text-background hover:scale-110 transition-all"><Github className="w-5 h-5" /></Link>
                  <Link href="https://www.linkedin.com/in/mohamed-karkachi-894678253/" target="_blank" className="p-3 rounded-full bg-[#0077b5] text-white hover:scale-110 transition-all"><Linkedin className="w-5 h-5" /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-32 py-20 rounded-[3rem] bg-accent text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
          <div className="relative z-10 px-4">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Vous avez un projet ?</h2>
            <p className="text-white/80 max-w-xl mx-auto text-lg mb-10">
              Notre équipe d&apos;experts est prête à donner vie à vos idées les plus innovantes.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-accent font-black rounded-2xl hover:bg-secondary hover:text-foreground transition-all uppercase tracking-widest shadow-xl"
            >
              Contactez-nous
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
