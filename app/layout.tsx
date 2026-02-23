import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { FloatingKakaoButton } from '@/widgets/kakao/floating-kakao-button'
import { AnnouncementBarServer } from '@/widgets/announcement-bar/announcement-bar-server'
import { EditModeProvider } from '@/features/admin-edit/edit-mode-provider'
import { AdminEditButton } from '@/features/admin-edit/admin-edit-button'
import { EditPanel } from '@/features/admin-edit/edit-panel'
import { Providers } from './providers'
import { StoreOnly } from '@/shared/ui/store-only'

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
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="ko">
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <EditModeProvider>
            <StoreOnly>
              <AnnouncementBarServer />
              <Header />
            </StoreOnly>
            <main className="flex-1">{children}</main>
            <StoreOnly>
              <Footer />
              <FloatingKakaoButton />
              <AdminEditButton />
              <EditPanel />
            </StoreOnly>
          </EditModeProvider>
        </Providers>
      </body>
    </html>
  )
}
