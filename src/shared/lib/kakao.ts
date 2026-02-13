const KAKAO_CHANNEL_ID = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_ID

export function getKakaoChatUrl(): string | null {
  if (!KAKAO_CHANNEL_ID) return null
  return `https://pf.kakao.com/${KAKAO_CHANNEL_ID}/chat`
}
