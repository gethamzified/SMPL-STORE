'use server'

import * as api from '@/lib/api/collections'
import { verifyAdmin } from '@/lib/admin-auth'

export async function createCollection(formData: FormData) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  return api.createCollection(formData)
}

export async function updateCollection(formData: FormData) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  return api.updateCollection(formData)
}

export async function deleteCollection(id: string) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  return api.deleteCollection(id)
}

export async function reorderCollections(items: { id: string; sort_order: number }[]) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  return api.reorderCollections(items)
}

