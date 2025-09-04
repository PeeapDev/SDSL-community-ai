// Mock vendor profile/verification store
export type VendorProfile = {
  vendorId: string
  displayName: string
  avatarUrl?: string
  storeAvatarUrl?: string
  bannerUrl?: string
  bio?: string
  verified: boolean
  rating: number // 0-5
  ratingsCount: number
  kyc: {
    status: "unsubmitted" | "pending" | "approved" | "rejected"
    submittedAt?: number
    fields?: Record<string,string>
  }
  notifications: {
    marketing: boolean
    productUpdates: boolean
    orders: boolean
  }
}

const KEY = "vendor_profiles_v1"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function write<T>(key: string, value: T) { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)) }

export function listVendorProfiles(): VendorProfile[] { return read<VendorProfile[]>(KEY, []) }
export function getVendorProfile(vendorId: string): VendorProfile | undefined { return listVendorProfiles().find(v=>v.vendorId===vendorId) }
export function upsertVendorProfile(input: VendorProfile) {
  const items = listVendorProfiles()
  const idx = items.findIndex(v=>v.vendorId===input.vendorId)
  if (idx>=0) items[idx]=input; else items.push(input)
  write(KEY, items)
  return input
}

export function seedVendorProfiles() {
  const items = listVendorProfiles()
  if (items.length) return
  upsertVendorProfile({ vendorId: "v-001", displayName: "Campus Store", avatarUrl: "/placeholder-logo.png", storeAvatarUrl: "/placeholder-logo.png", bannerUrl: "/placeholder.jpg", bio: "Official campus merchandise.", verified: true, rating: 4.6, ratingsCount: 124, kyc: { status: "approved", submittedAt: Date.now()- 86400e3 }, notifications: { marketing: true, productUpdates: true, orders: true } })
  upsertVendorProfile({ vendorId: "v-002", displayName: "Sports Shop", avatarUrl: "/placeholder-logo.png", storeAvatarUrl: "/placeholder-logo.png", bannerUrl: "/placeholder.jpg", bio: "Sportswear and PE gear.", verified: false, rating: 4.2, ratingsCount: 58, kyc: { status: "unsubmitted" }, notifications: { marketing: false, productUpdates: true, orders: true } })
}
