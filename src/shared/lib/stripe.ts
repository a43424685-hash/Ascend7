import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY가 설정되지 않았습니다.\n' +
    '.env.local 파일에 STRIPE_SECRET_KEY를 추가하세요.'
  )
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

