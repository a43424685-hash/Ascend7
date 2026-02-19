export default function EventPage() {
  return (
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-10 py-10">
          <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-1">Community</p>
          <h1 className="text-xl font-black tracking-tight">EVENT</h1>
        </div>
      </div>

      {/* 본문 */}
      <div className="container mx-auto px-6 lg:px-10 py-12 pb-24">
        <div className="text-center py-32">
          <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 12.75h.008v.008H12v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM9.75 12.75h.008v.008H9.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM7.5 12.75h.008v.008H7.5v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 2.25h.008v.008H7.5v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM9.75 15h.008v.008H9.75V15zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 15h.008v.008H12V15zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 font-medium tracking-wide">진행 중인 이벤트가 없습니다</p>
          <p className="text-xs text-gray-300 mt-1.5">새로운 이벤트를 곧 준비하겠습니다</p>
        </div>
      </div>
    </div>
  )
}
