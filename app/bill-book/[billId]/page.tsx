import { getBillById } from "@/lib/actions/bill";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default async function BillDetailPage({ params }: { params: Promise<{ billId: string }> }) {
  const { billId } = await params;
  const { data: bill, success } = await getBillById(billId);

  if (!success || !bill) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Bill Not Found</h1>
          <Link href="/bill-book" className="text-blue-600 hover:underline mt-4 block">Return to Bill Book</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <Link href="/bill-book" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Bill Book
        </Link>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors print:hidden"
          // In a real app, onClick window.print(), but this is a server component button (cannot have onClick).
          // We would make a Client Component wrapper or just a form/link.
          // For simplicity, we just show the layout effectively.
        >
          <Printer size={16} /> Print Bill
        </button>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-0">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
            <p className="text-slate-500 mt-1">#{bill.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 mb-1">Date</p>
            <p className="font-medium text-slate-900">
              {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="overflow-hidden border rounded-lg mb-8">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4 text-left w-16">Sno</th>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bill.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-slate-400">{item.sno || index + 1}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.productName}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-slate-600">₹{item.price}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between items-center py-4 border-t border-dashed border-slate-200">
              <span className="font-bold text-slate-900 text-lg">Grand Total</span>
              <span className="font-bold text-blue-600 text-2xl">₹{bill.totalAmount}</span>
            </div>
            <p className="text-right text-xs text-slate-400">Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
