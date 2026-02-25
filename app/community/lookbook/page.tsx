import Image from 'next/image'
import Link from 'next/link'
import { getLookbookItems } from '@/entities/lookbook/api/get-lookbook'

export const dynamic = 'force-dynamic'

export default async function LookbookPage() {
  const items = await getLookbookItems()

  return (
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-10 py-10">
          <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-1">Community</p>
          <h1 className="text-xl font-black tracking-tight">LOOK BOOK</h1>
        </div>
      </div>

      {/* 본문 */}
      <div className="container mx-auto px-6 lg:px-10 py-12 pb-24">
        {items.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-wide">곧 업데이트됩니다</p>
            <p className="text-xs text-gray-300 mt-1.5">ITERO7의 스타일을 담은 룩북이 준비 중입니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {items.map((item) => {
              const Wrapper = item.link_url ? Link : 'div'
              const wrapperProps = item.link_url
                ? { href: item.link_url as string }
                : {}

              return (
                // @ts-expect-error dynamic tag
                <Wrapper
                  key={item.id}
                  {...wrapperProps}
                  className="group relative block overflow-hidden bg-gray-50"
                >
                  {/* 이미지 (정사각형) */}
                  <div className="aspect-square relative">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.04]"
                    />
                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-white text-center">
                      <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-2 leading-tight">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-[10px] text-white/70 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.link_url && (
                        <span className="mt-3 text-[9px] tracking-[0.2em] text-white/50 uppercase">
                          자세히 보기 →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 태그 */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="p-3 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] tracking-[0.1em] text-gray-400 bg-gray-50 px-2 py-0.5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Wrapper>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
