# SDSL-community-ai

Monorepo: Next.js app for SDSL community with wallet, directory (@handle/phone), and QR features.

## Key features
- Wallet send/receive with identifier resolution (@username, +phone, userId)
- User directory management via /api/user/directory
- Payment QR generation (qrcode)

## Dev
- pnpm install
- pnpm dev

Configure Supabase in ai/.env.local (server-side keys) and run SQL in lib/sql/wallet.sql.
