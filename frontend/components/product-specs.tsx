import type { Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductSpecsProps {
  specs: Product["specs"];
}

export default function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || specs.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          {specs.map((spec, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 last:border-b-0"
            >
              <span className="font-medium capitalize">{spec.name.replace(/([A-Z])/g, " $1")}:</span>
              <span className="text-right">{spec.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}