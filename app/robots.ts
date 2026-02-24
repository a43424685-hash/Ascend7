import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ascend7.kr'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/naver-feed.xml'],
      disallow: ['/admin/', '/api/', '/auth/callback'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
