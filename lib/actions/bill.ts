'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const BillItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  price: z.number(),
  total: z.number(),
})

const CreateBillSchema = z.object({
  items: z.array(BillItemSchema).min(1, "Bill must have at least one item"),
  totalAmount: z.number(),
})

export async function createBill(data: { items: any[], totalAmount: number }) {
  const validation = CreateBillSchema.safeParse(data)
  
  if (!validation.success) {
    return { success: false, error: "Invalid bill data" }
  }

  const { items, totalAmount } = validation.data

  try {
    // Transaction: Create Bill -> Create Items -> Decrease Stock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check stock availability first to avoid race conditions or invalid states
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product || product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${item.productName}. Available: ${product?.quantity || 0}`)
        }
      }

      // 2. Create Bill
      const bill = await tx.bill.create({
        data: {
          totalAmount,
          items: {
            create: items.map((item, index) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              sno: index + 1
            }))
          }
        }
      })

      // 3. Update Stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity }
          }
        })
      }

      return bill
    })

    revalidatePath('/bill-book')
    revalidatePath('/stock-book')
    return { success: true, billId: result.id }

  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create bill" }
  }
}

export async function getBills() {
  try {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 for performance
    })
    return { success: true, data: bills }
  } catch (error) {
    return { success: false, error: "Failed to fetch bills" }
  }
}

export async function getBillById(id: string) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: { items: true }
    })
    if (!bill) return { success: false, error: "Bill not found" }
    return { success: true, data: bill }
  } catch (error) {
    return { success: false, error: "Failed to fetch bill" }
  }
}
