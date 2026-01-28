import { getProducts } from "@/lib/actions/stock";
import StockManager from "@/components/StockManager";
import { Package } from "lucide-react";

export default async function Page() {
  const { data: products, success } = await getProducts();

  if (!success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-50 p-4 rounded-full text-red-500 mb-4">
            <Package size={48} />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Failed to load stock</h2>
        <p className="text-slate-500 mt-2">Please check your database connection.</p>
      </div>
    );
  }

  return <StockManager initialProducts={products || []} />;
}
