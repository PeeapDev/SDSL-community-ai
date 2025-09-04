// Mock wallet store for all roles
export type Transaction = {
  id: string
  userId: string
  amount: number // + credit, - debit
  type: "deposit" | "withdrawal" | "purchase" | "payout" | "refund" | "transfer_out" | "transfer_in"
  description?: string
  createdAt: number
}

const BAL_KEY = "wallet_balances_v1"
const TX_KEY = "wallet_transactions_v1"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function write<T>(key: string, value: T) { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)) }

export function getBalance(userId: string): number {
  const map = read<Record<string, number>>(BAL_KEY, {})
  return map[userId] ?? 0
}
export function setBalance(userId: string, amount: number) {
  const map = read<Record<string, number>>(BAL_KEY, {})
  map[userId] = amount
  write(BAL_KEY, map)
}
export function adjustBalance(userId: string, delta: number) {
  const current = getBalance(userId)
  setBalance(userId, current + delta)
}

export function listTransactions(userId: string, limit = 50): Transaction[] {
  return read<Transaction[]>(TX_KEY, []).filter(t => t.userId === userId).sort((a,b)=>b.createdAt-a.createdAt).slice(0, limit)
}
export function addTransaction(userId: string, amount: number, type: Transaction["type"], description?: string) {
  const tx: Transaction = { id: `tx_${Date.now()}`, userId, amount, type, description, createdAt: Date.now() }
  const list = read<Transaction[]>(TX_KEY, [])
  write(TX_KEY, [tx, ...list])
  adjustBalance(userId, amount)
  return tx
}

export function canAfford(userId: string, amount: number): boolean {
  return getBalance(userId) >= amount
}

// Wallet-to-wallet transfer
export function transfer(fromUserId: string, toUserId: string, amount: number, note?: string) {
  if (amount <= 0) throw new Error("Amount must be positive")
  if (!canAfford(fromUserId, amount)) throw new Error("Insufficient balance")
  addTransaction(fromUserId, -amount, "transfer_out", note || `Transfer to ${toUserId}`)
  addTransaction(toUserId, amount, "transfer_in", note || `Transfer from ${fromUserId}`)
}

// Refund helper: credit payer, debit payee (if sufficient)
export function refund(payerUserId: string, payeeUserId: string, amount: number, note?: string) {
  if (amount <= 0) throw new Error("Amount must be positive")
  if (!canAfford(payeeUserId, amount)) throw new Error("Payee has insufficient balance for refund")
  addTransaction(payeeUserId, -amount, "refund", note || `Refund to ${payerUserId}`)
  addTransaction(payerUserId, amount, "refund", note || `Refund from ${payeeUserId}`)
}

export function seedWallet(userId: string) {
  if (listTransactions(userId).length) return
  setBalance(userId, 50)
  addTransaction(userId, 50, "deposit", "Welcome bonus")
}
