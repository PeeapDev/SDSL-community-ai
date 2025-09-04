// Mock vendor product store using localStorage
export type ProductVariant = { id: string; name: string; price: number; stock: number; imageUrl?: string }
export type Product = {
  id: string
  vendorId: string
  title: string
  description?: string
  price: number
  imageUrl?: string // primary image for quick cards
  images?: string[] // gallery images for modal
  variants?: ProductVariant[]
  createdAt: number
  stock: number
  sponsored?: boolean
}

const PROD_KEY = "vendor_products_v1"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function write<T>(key: string, value: T) { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)) }

export function listProducts(): Product[] { return read<Product[]>(PROD_KEY, []) }
export function listProductsByVendor(vendorId: string): Product[] { return listProducts().filter(p => p.vendorId === vendorId) }
export function listRecentProducts(limit = 8): Product[] { return [...listProducts()].sort((a,b)=>b.createdAt-a.createdAt).slice(0, limit) }
export function listNewProducts(limit = 8): Product[] { return listRecentProducts(limit) } // alias for now
export function getProductById(id: string): Product | undefined { return listProducts().find(p => p.id === id) }

export function createProduct(input: Omit<Product, "id"|"createdAt">): Product {
  const items = listProducts()
  const p: Product = { ...input, id: `prod_${Date.now()}`, createdAt: Date.now() }
  write(PROD_KEY, [p, ...items])
  return p
}

export function seedDemoProducts() {
  const items = listProducts()
  if (items.length > 0) return
  createProduct({ vendorId: "v-001", title: "School Hoodie", description: "Warm fleece hoodie with school logo", price: 39.99, imageUrl: "/placeholder.jpg", images: ["/placeholder.jpg","/placeholder-user.jpg","/placeholder-logo.png"], stock: 25, sponsored: true, variants: [ { id: "s", name: "Small", price: 39.99, stock: 8, imageUrl: "/placeholder.jpg" }, { id: "m", name: "Medium", price: 39.99, stock: 10, imageUrl: "/placeholder.jpg" } ] })
  createProduct({ vendorId: "v-002", title: "PE Shorts", description: "Lightweight athletic shorts", price: 19.99, imageUrl: "/placeholder.jpg", images: ["/placeholder.jpg"], stock: 50 })
  createProduct({ vendorId: "v-001", title: "Notebook Pack", description: "5-pack lined notebooks", price: 9.99, imageUrl: "/placeholder.jpg", images: ["/placeholder.jpg"], stock: 100 })
}

// Mock sales analytics
export function getSalesSummary(vendorId: string) {
  const products = listProductsByVendor(vendorId)
  const revenue = products.reduce((acc,p)=> acc + p.price * Math.min(5, p.stock ? 1 : 0), 0)
  const units = products.length * 3
  return { revenue, units, products: products.length }
}
