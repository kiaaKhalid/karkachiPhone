import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Users, Lightbulb, ExternalLink, Github, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">À Propos de Nous</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Chez KARKACHI PHONE, nous sommes passionnés par la connexion avec les dernières et meilleures
          technologies mobiles. Notre mission est de fournir une expérience d&apos;achat fluide, offrant une large sélection
          de produits, des prix compétitifs et un service client exceptionnel.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-col items-center">
            <Globe className="h-12 w-12 text-blue-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notre Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 dark:text-gray-300">
            Être la destination en ligne leader pour la technologie mobile, permettant aux individus d&apos;accéder à des
            appareils innovants qui améliorent leur vie quotidienne.
          </CardContent>
        </Card>
        <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-col items-center">
            <Lightbulb className="h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notre Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 dark:text-gray-300">
            Fournir une gamme diversifiée de téléphones mobiles et d&apos;accessoires de haute qualité, couplée à une
            expérience d&apos;achat intuitive et un support client inégalé.
          </CardContent>
        </Card>
        <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-col items-center">
            <Users className="h-12 w-12 text-purple-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nos Valeurs</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 dark:text-gray-300">
            La satisfaction client, l&apos;innovation, l&apos;intégrité et un engagement envers l&apos;excellence guident tout ce que
            nous faisons.
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">Notre Histoire</h2>
        <div className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 space-y-6">
          <p>
            Fondé en 2020, KARKACHI PHONE a commencé avec une idée simple : rendre la technologie mobile de
            pointe accessible à tous. Ce qui a commencé comme une petite entreprise en ligne s&apos;est développé en une
            plateforme de confiance, servant des milliers de clients satisfaits à travers le monde.
          </p>
          <p>
            Nous croyons qu&apos;un téléphone mobile est plus qu&apos;un simple appareil ; c&apos;est une passerelle vers la connexion,
            la créativité et la productivité. C&apos;est pourquoi nous sélectionnons méticuleusement notre sélection, en
            partenariat avec des marques leaders pour vous apporter le meilleur en smartphones, tablettes, montres
            connectées et accessoires.
          </p>
          <p>
            Notre équipe est composée d&apos;enthousiastes de la technologie et d&apos;experts du service client dédiés à
            s&apos;assurer que votre parcours avec nous soit fluide et agréable. De la navigation au checkout, et au-delà,
            nous sommes là pour vous soutenir à chaque étape.
          </p>
        </div>
      </section>
      {/* Section Développeurs */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 mb-12">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
          Développé par des Experts
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Ce site e-commerce a été conçu et développé par une équipe de développeurs passionnés, spécialisés dans les
          technologies web modernes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Développeur 1 */}
          <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <Image
                  src="https://i.ibb.co/gFd7hDDY/khalid-profile-copy.jpg"
                  alt="KIAA Khalid"
                  width={120}
                  height={120}
                  className="rounded-full mb-6 object-cover border-4 border-blue-500"
                />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">KIAA Khalid</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">Software Engineer</p>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Développeur passionné, spécialisé dans la conception et le développement d&apos;applications robustes et évolutives.
                Maîtrise des langages modernes (Java, Spring Boot, React, SQL/NoSQL) et des bonnes pratiques (Clean Code, tests, CI/CD)
                pour livrer des solutions performantes et centrées utilisateur.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    React
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                    Next.js
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                    Spring Boot
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                    python
                  </span>
                </div>

                <div className="flex gap-4">
                  <Link
                    href="https://kiaa-khalid.vercel.app/"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Portfolio
                  </Link>
                  <Link
                    href="https://github.com/kiaaKhalid"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors duration-200"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/khalid-kiaa-bitkal/"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors duration-200"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Développeur 2 */}
          <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <Image
                  src="https://media.licdn.com/dms/image/v2/D4E03AQE6z0oxYmY00w/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1674604440585?e=1758758400&v=beta&t=fktYJbT0mXyYMpeoQngLBzC4crvomloqqc8K-I7y9RE"
                  alt="Mohamed Karkachi"
                  width={120}
                  height={120}
                  className="rounded-full mb-6 object-cover border-4 border-purple-500"
                />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mohamed Karkachi</h3>
                <p className="text-purple-600 dark:text-purple-400 font-semibold mb-3">Développeuse Frontend</p>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Spécialisée dans la création d&apos;interfaces modernes, réactives et centrées utilisateur. Maîtrise de React, JavaScript/TypeScript 
                et des bonnes pratiques UI/UX pour concevoir des applications performantes et élégantes, en collaboration étroite avec les équipes backend et design.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded-full text-sm">
                    UI/UX
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    React
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                    Tailwind CSS
                  </span>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                    Figma
                  </span>
                </div>

                <div className="flex gap-4">
                  <Link
                    href="https://sarahchen-design.com"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Portfolio
                  </Link>
                  <Link
                    href="https://github.com/MohamedKARKACHI"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors duration-200"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/mohamed-karkachi-894678253/"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors duration-200"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            Vous avez un projet de développement web ?
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
              Contactez notre équipe
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
