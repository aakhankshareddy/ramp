import { getProducts } from "@/lib/actions/stock";
import { getBills } from "@/lib/actions/bill";
import BillBook from "@/components/BillBook";

export default async function Page() {
  const [productsRes, billsRes] = await Promise.all([
    getProducts(),
    getBills()
  ]);
  
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <BillBook 
        products={productsRes.data || []} 
        initialBills={billsRes.data || []} 
      />
    </div>
  );
}
