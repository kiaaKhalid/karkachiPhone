// import ProductCard from "@/components/product-card" // Corrected import
// import type { Product } from "@/lib/types"

// interface RecommendedAccessoriesProps {
//   accessories: Product[]
// }

// export default function RecommendedAccessories({ accessories }: RecommendedAccessoriesProps) {
//   if (!accessories || accessories.length === 0) {
//     return null
//   }

//   return (
//     <section className="py-8">
//       <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recommended Accessories</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {accessories.map((accessory) => (
//           <ProductCard key={accessory.id} product={accessory} />
//         ))}
//       </div>
//     </section>
//   )
// }
