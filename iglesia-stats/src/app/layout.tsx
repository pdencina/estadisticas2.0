import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Iglesia Stats',
  description: 'Plataforma de estadísticas de encuentros',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
