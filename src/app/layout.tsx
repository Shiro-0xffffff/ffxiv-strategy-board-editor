import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FF14 战术板编辑器',
  description: 'FF14 战术板编辑器',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
