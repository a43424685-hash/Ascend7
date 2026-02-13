export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ]

    const optional = [
      { key: 'RESEND_API_KEY', warn: '이메일 발송이 비활성화됩니다.' },
      { key: 'NEXT_PUBLIC_KAKAO_CHANNEL_ID', warn: '카카오 문의 버튼이 숨겨집니다.' },
      { key: 'NEXT_PUBLIC_SITE_URL', warn: 'Stripe 리다이렉트가 localhost로 fallback됩니다.' },
    ]

    const missing = required.filter((key) => !process.env[key])

    if (missing.length > 0) {
      console.error(
        `\n❌ [ENV] 필수 환경변수 누락:\n${missing.map((k) => `  - ${k}`).join('\n')}\n` +
        `.env.local 파일을 확인하세요.\n`
      )
    }

    for (const { key, warn } of optional) {
      if (!process.env[key]) {
        console.warn(`⚠️ [ENV] ${key} 미설정 — ${warn}`)
      }
    }
  }
}
