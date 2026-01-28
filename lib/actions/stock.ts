'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
})

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: products }
  } catch (error) {
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function createProduct(formData: FormData) {
  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    price: formData.get('price'),
    quantity: formData.get('quantity'),
  })

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors }
  }

  try {
    await prisma.product.create({
      data: validatedFields.data
    })
    revalidatePath('/stock-book')
    revalidatePath('/bill-book')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create product. Name might be unique." }
  }
}

export async function updateProduct(id: string, formData: FormData) {
    const validatedFields = ProductSchema.safeParse({
      name: formData.get('name'),
      price: formData.get('price'),
      quantity: formData.get('quantity'),
    })
  
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.flatten().fieldErrors }
    }
  
    try {
      await prisma.product.update({
        where: { id },
        data: validatedFields.data
      })
      revalidatePath('/stock-book')
      revalidatePath('/bill-book')
      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to update product" }
    }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    })
    revalidatePath('/stock-book')
    revalidatePath('/bill-book')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete product" }
  }
}
