import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { FloatingKakaoButton } from '@/widgets/kakao/floating-kakao-button'
import { AnnouncementBarServer } from '@/widgets/announcement-bar/announcement-bar-server'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'ASCEND7 - Premium Gymwear',
    template: '%s | ASCEND7',
  },
  description: '고성능 트레이닝을 위한 프리미엄 짐웨어 브랜드 ASCEND7',
  openGraph: {
    type: 'website',
    siteName: 'ASCEND7',
    title: 'ASCEND7 - Premium Gymwear',
    description: '고성능 트레이닝을 위한 프리미엄 짐웨어 브랜드 ASCEND7',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <AnnouncementBarServer />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingKakaoButton />
        </Providers>
      </body>
    </html>
  )
}
