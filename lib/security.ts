import crypto from "crypto"

const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const KEYLEN = 32

export async function hashPin(pin: string): Promise<string> {
  if (!/^[0-9]{4,8}$/.test(pin)) throw new Error("PIN must be 4-8 digits")
  const salt = crypto.randomBytes(16)
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(pin, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (err, buf) => {
      if (err) reject(err); else resolve(buf)
    })
  })
  return `v1$${salt.toString("base64")}$${derived.toString("base64")}`
}

export async function verifyPin(pin: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false
  const [ver, saltB64, hashB64] = stored.split("$")
  if (ver !== "v1" || !saltB64 || !hashB64) return false
  const salt = Buffer.from(saltB64, "base64")
  const target = Buffer.from(hashB64, "base64")
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(pin, salt, target.length, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (err, buf) => {
      if (err) reject(err); else resolve(buf)
    })
  })
  return crypto.timingSafeEqual(derived, target)
}
