'use client'

import { useState, useRef } from "react"
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/stock"
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, X } from "lucide-react"

type Product = {
  id: string
  name: string
  price: number
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export default function StockManager({ initialProducts }: { initialProducts: Product[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Optimistic update could go here, but using simple router refresh pattern via action revalidate
  // Actually, for instant feedback, we might want local state update, relies on parent re-render?
  // Since we used revalidatePath in action, wrapping in useRouter() refresh might be needed or just let Next.js handle it.
  // We'll rely on the fact that server action revalidates the path, Next.js should update the RSC payload.
  
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, formData)
    } else {
      result = await createProduct(formData)
    }
    setLoading(false)
    
    if (result?.success) {
      setIsModalOpen(false)
      setEditingProduct(null)
      formRef.current?.reset()
      // Optional: Add toast success here
    } else {
      alert("Error: " + JSON.stringify(result?.error))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    await deleteProduct(id)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const openNew = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const getStatus = (qty: number) => {
    if (qty === 0) return { label: "Missing", color: "bg-red-100 text-red-700 border-red-200" }
    if (qty <= 5) return { label: "Low Stock", color: "bg-amber-100 text-amber-700 border-amber-200" }
    return { label: "Available", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stock Book</h1>
          <p className="text-slate-500 mt-1">Manage your inventory and track stock availability.</p>
        </div>
        <button 
          onClick={openNew}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm gap-2"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Package size={48} className="text-slate-200" />
                      <p>No products found in inventory.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialProducts.map((product) => {
                  const status = getStatus(product.quantity)
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                      <td className="px-6 py-4 text-slate-600">₹{product.price}</td>
                      <td className="px-6 py-4 text-slate-600">{product.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(product)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-lg text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form ref={formRef} action={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Product Name</label>
                <input 
                  name="name"
                  defaultValue={editingProduct?.name}
                  required 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-sm"
                  placeholder="e.g. Wireless Mouse"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Price (₹)</label>
                  <input 
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct?.price}
                    required 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-sm"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Quantity</label>
                  <input 
                    name="quantity"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.quantity}
                    required 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
