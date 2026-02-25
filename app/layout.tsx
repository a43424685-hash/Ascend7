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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://itero7.com'

export const metadata: Metadata = {
  title: {
    default: 'ITERO7 - 7일간의 반복, 다시 하는 사람들을 위한 짐웨어',
    template: '%s | ITERO7',
  },
  description: '7일간의 반복, 다시 하는 사람들을 위한 짐웨어 - ITERO7',
  openGraph: {
    type: 'website',
    siteName: 'ITERO7',
    title: 'ITERO7 - 7일간의 반복, 다시 하는 사람들을 위한 짐웨어',
    description: '7일간의 반복, 다시 하는 사람들을 위한 짐웨어 - ITERO7',
    locale: 'ko_KR',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ITERO7 - 7일간의 반복, 다시 하는 사람들을 위한 짐웨어',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ITERO7 - 7일간의 반복, 다시 하는 사람들을 위한 짐웨어',
    description: '7일간의 반복, 다시 하는 사람들을 위한 짐웨어 - ITERO7',
    images: [`${SITE_URL}/og-image.png`],
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
