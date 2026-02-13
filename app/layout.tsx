import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { FloatingKakaoButton } from '@/widgets/kakao/floating-kakao-button'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'ASCEND7 - Premium Gymwear',
  description: 'Elevate your training with ASCEND7 premium gymwear',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingKakaoButton />
        </Providers>
      </body>
    </html>
  )
}
