'use server'

import * as api from '@/lib/api/products'
import { verifyAdmin } from '@/lib/admin-auth'

export async function createProduct(formData: FormData) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  console.log('Action: createProduct started');
  return api.createProduct(formData)
}

export async function updateProduct(formData: FormData) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  console.log('Action: updateProduct started');
  return api.updateProduct(formData)
}

export async function deleteProduct(id: string) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  return api.deleteProduct(id)
}

