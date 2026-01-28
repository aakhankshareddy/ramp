import Link from "next/link";
import { ArrowRight, Book, ShoppingCart } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex lg:flex-col lg:gap-10">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-slate-900 tracking-tight">
          RAMP
        </h1>
        <p className="text-center text-slate-500 mt-4 text-lg">
          Inventory and Billing Management System
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-3xl">
          <Link 
            href="/bill-book"
            className="group relative flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 gap-4"
          >
            <div className="p-4 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart size={48} />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800">Bill Book</h2>
            <p className="text-slate-500 text-center">Generate bills and manage transactions</p>
            <ArrowRight className="absolute bottom-8 right-8 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
          </Link>

          <Link 
            href="/stock-book"
            className="group relative flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 gap-4"
          >
            <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <Book size={48} />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800">Stock Book</h2>
            <p className="text-slate-500 text-center">Manage inventory and product details</p>
            <ArrowRight className="absolute bottom-8 right-8 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
          </Link>
        </div>
      </div>
    </main>
  );
}
