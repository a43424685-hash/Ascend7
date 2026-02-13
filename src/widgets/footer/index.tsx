import { getKakaoChatUrl } from '@/shared/lib/kakao'

export function Footer() {
  const kakaoChatUrl = getKakaoChatUrl()

  return (
    <footer className="border-t border-black mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold">ASCEND7</p>
          {kakaoChatUrl && (
            <a
              href={kakaoChatUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs text-gray-500 hover:text-black transition-colors"
            >
              카카오톡 문의하기
            </a>
          )}
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} ASCEND7. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
