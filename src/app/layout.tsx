import { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Inter, Roboto_Mono, Noto_Sans } from 'next/font/google'

import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})
const robotoMono = Roboto_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})
const notoSans = Noto_Sans({
  variable: '--font-preview',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FF14 战术板编辑器',
  description: '针对《最终幻想XIV》中战术板的编辑器，在这里创建、编辑、预览、分享你的战术板。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" className={`${inter.variable} ${robotoMono.variable} ${notoSans.variable} overscroll-none`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
