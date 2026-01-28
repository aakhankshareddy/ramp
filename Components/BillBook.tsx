'use client'

import { useState } from "react"
import { createBill } from "@/lib/actions/bill"
import { useRouter } from "next/navigation"
import { Plus, Trash2, FileText, ArrowRight, Save, ShoppingCart, Calculator } from "lucide-react"

type Product = {
  id: string
  name: string
  price: number
  quantity: number
}

type Bill = {
  id: string
  createdAt: Date
  totalAmount: number
}

type CartItem = {
  productId: string
  name: string
  quantity: number
  price: number
  total: number
}

export default function BillBook({ products, initialBills }: { products: Product[], initialBills: Bill[] }) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)

  // Derived state
  const selectedProduct = products.find(p => p.id === selectedProductId)
  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0)
  
  // Available stock check (considering what's already in cart)
  const getAvailableStock = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return 0
    const inCart = cart.find(i => i.productId === productId)?.quantity || 0
    return product.quantity - inCart
  }

  const addItem = () => {
    if (!selectedProduct) return
    if (qty <= 0) return
    
    const available = getAvailableStock(selectedProduct.id)
    if (qty > available) {
      alert(`Cannot add ${qty}. Only ${available} remaining in stock.`)
      return
    }

    const existingItemIndex = cart.findIndex(item => item.productId === selectedProductId)
    
    if (existingItemIndex >= 0) {
      const newCart = [...cart]
      newCart[existingItemIndex].quantity += qty
      newCart[existingItemIndex].total = newCart[existingItemIndex].quantity * newCart[existingItemIndex].price
      setCart(newCart)
    } else {
      setCart([...cart, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity: qty,
        price: selectedProduct.price,
        total: qty * selectedProduct.price
      }])
    }
    
    setQty(1) // Reset qty
  }

  const removeItem = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const handleSaveBill = async () => {
    if (cart.length === 0) return
    setLoading(true)
    
    const billData = {
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      totalAmount: grandTotal
    }

    const result = await createBill(billData)
    setLoading(false)

    if (result.success) {
      setCart([])
      // router.refresh() // Refresh to update history and stock
      router.push(`/bill-book/${result.billId}`) // Requirement: navigate to bill detail? Or just show history?
      // Requirement says "Clicking history opens bill detail page".
      // Maybe stay on page to generate next bill?
      // Let's stay on page but refresh list.
      router.refresh()
    } else {
      alert("Error: " + result.error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Bill Generator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Controls & Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="text-blue-600" />
              New Bill
            </h2>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
                <select 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.name} (Stock: {p.quantity} | ₹{p.price})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-32">
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={addItem}
                  disabled={!selectedProductId || qty <= 0}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            {/* Bill Table */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 w-16 text-center">Sno</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Add items to start billing
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, index) => (
                      <tr key={index} className="group hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-center text-slate-400">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-right text-slate-600">₹{item.price}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">₹{item.total}</td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-blue-50/50 font-semibold text-slate-900 border-t border-blue-100">
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-right">Grand Total Final Bill:</td>
                    <td className="px-4 py-4 text-right text-lg text-blue-700">₹{grandTotal}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleSaveBill}
                disabled={cart.length === 0 || loading}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save size={20} /> Save Bill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="text-emerald-600" />
              Bill History
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 max-h-[600px]">
              {initialBills.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No bills generated yet.
                </div>
              ) : (
                initialBills.map(bill => (
                  <div 
                    key={bill.id}
                    onClick={() => router.push(`/bill-book/${bill.id}`)}
                    className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 bg-white border px-2 py-0.5 rounded">
                        #{bill.id.slice(-6)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-lg font-bold text-slate-900">₹{bill.totalAmount}</div>
                      <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
