import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { MockAuthProvider } from '@/components/providers/MockAuthProvider'
import BackButton from '@/components/ui/BackButton'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <MockAuthProvider>
          {/* Global Back button shown on all pages */}
          <div className="fixed top-4 left-4 z-50">
            <BackButton />
          </div>
          {children}
        </MockAuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
