// IBTU Admin Inventory Data & Movement History
// Manages stock calculations, adjustments, and movement logs

import { getStoredAdminProducts, saveStoredAdminProducts } from './adminCatalogData'

const STORAGE_KEY_MOVEMENTS = 'ibtu_admin_inventory_movements'

// Initial seed movements for frontend demonstration
export const initialMovements = [
  {
    id: 'MOV-2026-8810',
    createdAt: '2026-03-01T15:30:00Z',
    variantId: 'var-prod-dress-trad-0-0',
    productId: 'prod-dress-trad',
    productName: "Women's Traditional Dress",
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    sku: 'IBTU-HAB-101-S-1',
    variantLabel: 'Size: S • Color: White with Yellow Tibeb',
    movementType: 'Purchase',
    quantity: 12,
    quantityBefore: 8,
    quantityAfter: 20,
    referenceType: 'PURCHASE_ORDER',
    referenceId: 'PO-2026-088',
    user: 'Alazar Tesfaye (Data Encoder)',
    reason: 'New handwoven batch from Addis Ababa artisan weavers',
    notes: 'Delivered in mint condition with verified Tibeb border weaving.',
  },
  {
    id: 'MOV-2026-8809',
    createdAt: '2026-03-01T11:20:00Z',
    variantId: 'var-prod-hoodie-0-0',
    productId: 'prod-hoodie',
    productName: "Men's Premium Hoodie",
    productImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    sku: 'IBTU-MEN-100-XS-1',
    variantLabel: 'Size: XS • Color: Forest Green',
    movementType: 'Customer Return',
    quantity: 1,
    quantityBefore: 4,
    quantityAfter: 5,
    referenceType: 'CUSTOMER_RETURN',
    referenceId: 'RET-2026-042',
    user: 'System Admin',
    reason: 'Customer requested size exchange',
    notes: 'Item inspected, unwashed with original tag attached; returned to shelf.',
  },
  {
    id: 'MOV-2026-8808',
    createdAt: '2026-02-28T16:15:00Z',
    variantId: 'var-prod-gabi-0-0',
    productId: 'prod-gabi',
    productName: "Men's Classic Gabi",
    productImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    sku: 'IBTU-TRA-104-STD-1',
    variantLabel: 'Size: Standard • Color: Natural Cotton',
    movementType: 'Damaged',
    quantity: -1,
    quantityBefore: 3,
    quantityAfter: 2,
    referenceType: 'DAMAGE_WRITE_OFF',
    referenceId: 'DMG-2026-007',
    user: 'System Admin',
    reason: 'Defective fringe border detected during fulfillment',
    notes: 'Set aside for return to artisan supplier.',
  },
  {
    id: 'MOV-2026-8807',
    createdAt: '2026-02-27T09:45:00Z',
    variantId: 'var-prod-netela-0-0',
    productId: 'prod-netela',
    productName: 'Handwoven Netela Scarf',
    productImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    sku: 'IBTU-TRA-105-STD-1',
    variantLabel: 'Size: Standard • Color: White / Golden Tibeb',
    movementType: 'Adjustment',
    quantity: 4,
    quantityBefore: 6,
    quantityAfter: 10,
    referenceType: 'MANUAL_ADJUSTMENT',
    referenceId: 'ADJ-2026-015',
    user: 'Alazar Tesfaye (Data Encoder)',
    reason: 'Quarterly inventory physical count discrepancy correction',
    notes: 'Found 4 uncounted units in storage container 2B.',
  },
  {
    id: 'MOV-2026-8806',
    createdAt: '2026-02-25T14:00:00Z',
    variantId: 'var-prod-jacket-0-0',
    productId: 'prod-jacket',
    productName: 'Modern Habesha Bomber Jacket',
    productImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    sku: 'IBTU-MEN-102-L-1',
    variantLabel: 'Size: L • Color: Forest Green',
    movementType: 'Opening Stock',
    quantity: 25,
    quantityBefore: 0,
    quantityAfter: 25,
    referenceType: 'INITIAL_STOCK',
    referenceId: 'INIT-2026-003',
    user: 'System Admin',
    reason: 'Initial catalog stocking',
    notes: 'Received initial production run.',
  },
]

// Calculate stock status based on available stock and low stock threshold
export function evaluateStockStatus(availableStock, threshold = 3) {
  if (availableStock <= 0) return 'Out of Stock'
  if (availableStock <= threshold) return 'Low Stock'
  return 'In Stock'
}

// 1. Get Stored Inventory Items (Flattened Variants with Calculations)
export function getStoredInventoryItems() {
  const products = getStoredAdminProducts()
  const items = []

  products.forEach((prod) => {
    const variants = prod.variants && prod.variants.length > 0 ? prod.variants : []

    if (variants.length > 0) {
      variants.forEach((v, vIdx) => {
        const physicalStock = Number(v.stockQuantity ?? v.physicalStock ?? 10)
        // Simulate small realistic reserved stock for some items (e.g. index % 3 === 0)
        const reservedStock = v.reservedStock !== undefined ? Number(v.reservedStock) : (vIdx === 0 && physicalStock > 3 ? 1 : 0)
        const availableStock = physicalStock - reservedStock
        const threshold = Number(v.lowStockThreshold || 3)
        const stockStatus = evaluateStockStatus(availableStock, threshold)

        items.push({
          id: v.id || `var-${prod.id}-${vIdx}`,
          variantId: v.id || `var-${prod.id}-${vIdx}`,
          productId: prod.id,
          productName: prod.name,
          productAmharicName: prod.amharicName,
          productImage: prod.image,
          category: prod.category,
          sku: v.sku || `${prod.sku}-${v.size || 'STD'}`,
          size: v.size || 'Standard',
          color: v.color || 'Default',
          physicalStock,
          reservedStock,
          availableStock,
          lowStockThreshold: threshold,
          stockStatus,
          price: Number(v.price || prod.price),
          active: v.active !== false,
        })
      })
    } else {
      // Fallback single product representation
      const physicalStock = Number(prod.stockCount ?? 15)
      const reservedStock = 1
      const availableStock = physicalStock - reservedStock
      const threshold = Number(prod.lowStockThreshold || 3)
      const stockStatus = evaluateStockStatus(availableStock, threshold)

      items.push({
        id: `var-${prod.id}-single`,
        variantId: `var-${prod.id}-single`,
        productId: prod.id,
        productName: prod.name,
        productAmharicName: prod.amharicName,
        productImage: prod.image,
        category: prod.category,
        sku: prod.sku,
        size: prod.sizes?.[0] || 'Standard',
        color: prod.colors?.[0] || 'Default',
        physicalStock,
        reservedStock,
        availableStock,
        lowStockThreshold: threshold,
        stockStatus,
        price: Number(prod.price),
        active: true,
      })
    }
  })

  return items
}

// 2. Get Stored Movements
export function getStoredInventoryMovements() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MOVEMENTS)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  saveStoredInventoryMovements(initialMovements)
  return initialMovements
}

// 3. Save Stored Movements
export function saveStoredInventoryMovements(movements) {
  try {
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(movements))
  } catch {
    // ignore
  }
}

// 4. Update Variant Stock & Record Movement
export function recordStockAdjustment({
  variantId,
  adjustmentType, // 'Purchase' | 'Opening Stock' | 'Customer Return' | 'Damaged' | 'Lost' | 'Adjustment'
  deltaQuantity,  // positive number to add or subtract
  mode = 'add',   // 'add' or 'subtract'
  reason,
  notes,
  userDisplayName = 'System Administrator',
}) {
  const products = getStoredAdminProducts()
  let targetVariant = null
  let targetProduct = null
  let quantityBefore = 0
  let quantityAfter = 0
  let netDelta = 0

  // Determine delta sign
  const isAddition =
    adjustmentType === 'Purchase' ||
    adjustmentType === 'Opening Stock' ||
    adjustmentType === 'Customer Return' ||
    (adjustmentType === 'Adjustment' && mode === 'add')

  netDelta = isAddition ? Math.abs(deltaQuantity) : -Math.abs(deltaQuantity)

  const updatedProducts = products.map((prod) => {
    if (!prod.variants) return prod

    const hasVariant = prod.variants.some((v) => v.id === variantId)
    if (!hasVariant) return prod

    targetProduct = prod

    const updatedVariants = prod.variants.map((v) => {
      if (v.id === variantId) {
        targetVariant = v
        quantityBefore = Number(v.stockQuantity ?? 10)
        quantityAfter = Math.max(0, quantityBefore + netDelta)

        return {
          ...v,
          stockQuantity: quantityAfter,
          physicalStock: quantityAfter,
        }
      }
      return v
    })

    const totalProductStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)

    return {
      ...prod,
      variants: updatedVariants,
      stockCount: totalProductStock,
      stockStatus: totalProductStock <= 0 ? 'Out of Stock' : totalProductStock <= 5 ? 'Low Stock' : 'In Stock',
    }
  })

  if (!targetVariant || !targetProduct) {
    throw new Error('Target product variant was not found in catalog state.')
  }

  // Save updated products
  saveStoredAdminProducts(updatedProducts)

  // Create Movement Record
  const newMovement = {
    id: `MOV-2026-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
    variantId: targetVariant.id,
    productId: targetProduct.id,
    productName: targetProduct.name,
    productImage: targetProduct.image,
    sku: targetVariant.sku,
    variantLabel: `Size: ${targetVariant.size || 'STD'} • Color: ${targetVariant.color || 'Default'}`,
    movementType: adjustmentType,
    quantity: netDelta,
    quantityBefore,
    quantityAfter,
    referenceType: `MANUAL_${adjustmentType.toUpperCase().replace(/\s+/g, '_')}`,
    referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
    user: userDisplayName,
    reason: reason || 'Manual stock level adjustment',
    notes: notes || '',
  }

  const existingMovements = getStoredInventoryMovements()
  const updatedMovements = [newMovement, ...existingMovements]
  saveStoredInventoryMovements(updatedMovements)

  return {
    success: true,
    movement: newMovement,
    quantityBefore,
    quantityAfter,
  }
}
