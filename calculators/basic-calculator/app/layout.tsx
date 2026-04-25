import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Basic Calculator',
  description: 'Basic arithmetic calculator: add, subtract, multiply, divide, modulo, and percentage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
