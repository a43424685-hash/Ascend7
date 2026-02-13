import Link from 'next/link'
import { getFeaturedProducts } from '@/entities/product/api/get-featured-products'
import { getActiveBanners } from '@/entities/banner/api/get-banners'
import { ProductGrid } from '@/widgets/product-grid'
import { HeroSlider } from '@/widgets/hero-slider'
import { ScrollAnimate } from '@/shared/ui/scroll-animate'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = []
  let banners: Awaited<ReturnType<typeof getActiveBanners>> = []

  try {
    ;[featuredProducts, banners] = await Promise.all([
      getFeaturedProducts(8),
      getActiveBanners(),
    ])
  } catch {
    // silently fail
  }

  return (
    <div>
      {/* ─── Hero Section ─── */}
      {banners.length > 0 ? (
        <HeroSlider banners={banners} />
      ) : (
        <section className="relative bg-black text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          <div className="relative container mx-auto px-4">
            <div className="flex flex-col items-center justify-center min-h-[85vh] lg:min-h-[90vh] text-center">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-gray-400 mb-4 sm:mb-6 animate-fade-in">
                프리미엄 짐웨어 (2026)
              </p>

              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] animate-fade-in-up">
                ASCEND
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  SEVEN
                </span>
              </h1>

              <p className="mt-6 sm:mt-8 text-sm sm:text-base text-gray-400 max-w-md mx-auto leading-relaxed px-4 animate-fade-in">
                Ascend every day. All seven.<br />
                <span className="text-xs text-gray-500">일주일동안 멈추지 않고 성장하다</span>
              </p>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up">
                <Link
                  href="/shop"
                  className="px-10 py-4 bg-white text-black text-sm font-bold tracking-wider hover:bg-gray-100 transition-all duration-300"
                >
                  SHOP NOW
                </Link>
                <Link
                  href="/shop?category=top"
                  className="px-10 py-4 border border-gray-600 text-white text-sm font-medium tracking-wider hover:border-white transition-all duration-300"
                >
                  NEW ARRIVALS
                </Link>
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Brand Values ─── */}
      <section className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
            {[
              { num: '01', title: 'PERFORMANCE', desc: '고성능 원단' },
              { num: '02', title: 'DURABILITY', desc: '뛰어난 내구성' },
              { num: '03', title: 'COMFORT', desc: '극한의 편안함' },
              { num: '04', title: 'STYLE', desc: '프리미엄 디자인' },
            ].map((v, i) => (
              <ScrollAnimate key={v.num} delay={i * 100}>
                <div className="py-8 lg:py-12 px-4 lg:px-8 text-center">
                  <span className="text-[10px] text-gray-400 tracking-widest">{v.num}</span>
                  <h3 className="text-xs sm:text-sm font-bold tracking-wider mt-2">{v.title}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-1">{v.desc}</p>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <ScrollAnimate>
            <div className="flex items-end justify-between mb-8 lg:mb-12">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-1">Collection</p>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">FEATURED</h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-medium tracking-wider border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors"
              >
                VIEW ALL
              </Link>
            </div>
          </ScrollAnimate>
          <ScrollAnimate delay={150}>
            <ProductGrid products={featuredProducts} />
          </ScrollAnimate>
        </section>
      )}

      {/* ─── Split Banner ─── */}
      <section className="bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh] lg:min-h-[60vh]">
            <ScrollAnimate className="flex flex-col justify-center py-16 lg:py-24 lg:pr-16">
              <p className="text-[10px] tracking-[0.4em] text-gray-500 uppercase mb-4">Our Philosophy</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                PUSH YOUR<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">LIMITS</span>
              </h2>
              <p className="mt-6 text-sm text-gray-400 leading-relaxed max-w-md">
                ASCEND7은 최고의 퍼포먼스를 추구하는 이들을 위해 탄생했습니다.
                모든 제품은 훈련의 한계를 넘어설 수 있도록 설계되었습니다.
              </p>
              <div className="mt-8">
                <Link
                  href="/shop"
                  className="inline-block px-8 py-3 border border-white text-sm font-medium tracking-wider hover:bg-white hover:text-black transition-all duration-300"
                >
                  EXPLORE
                </Link>
              </div>
            </ScrollAnimate>
            <ScrollAnimate delay={200} className="flex items-center justify-center py-16 lg:py-24 border-t lg:border-t-0 lg:border-l border-gray-800">
              <div className="grid grid-cols-2 gap-8 sm:gap-12 text-center">
                {[
                  { num: '100%', label: '프리미엄 원단' },
                  { num: '7일', label: '무료 교환/반품' },
                  { num: '5만원+', label: '무료 배송' },
                  { num: '1:1', label: '카카오 상담' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl sm:text-3xl font-black">{s.num}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="container mx-auto px-4 py-20 lg:py-28 text-center">
        <ScrollAnimate>
          <p className="text-[10px] tracking-[0.4em] text-gray-400 uppercase mb-3">Ready to Level Up?</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6">
            START YOUR JOURNEY
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            지금 ASCEND7 컬렉션을 만나보세요.
          </p>
          <Link
            href="/shop"
            className="inline-block px-12 py-4 bg-black text-white text-sm font-bold tracking-wider hover:bg-gray-900 transition-colors"
          >
            SHOP ALL
          </Link>
        </ScrollAnimate>
      </section>
    </div>
  )
}
