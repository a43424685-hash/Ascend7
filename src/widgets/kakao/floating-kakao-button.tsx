import { getKakaoChatUrl } from '@/shared/lib/kakao'

export function FloatingKakaoButton() {
  const url = getKakaoChatUrl()
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오톡 1:1 문의"
      className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 flex-col items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
    >
      <span className="text-sm font-extrabold leading-tight">1:1</span>
      <span className="text-xs font-bold leading-tight">문의</span>
    </a>
  )
}
