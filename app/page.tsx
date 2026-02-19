import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedProducts } from '@/entities/product/api/get-featured-products'
import { getActiveBanners } from '@/entities/banner/api/get-banners'
import { getHomeSections } from '@/entities/cms/api/get-home-sections'
import { ProductGrid } from '@/widgets/product-grid'
import { HeroSlider } from '@/widgets/hero-slider'
import { ScrollAnimate } from '@/shared/ui/scroll-animate'
import { EditableSection } from '@/features/admin-edit/editable-section'
import type { TextStyle } from '@/entities/cms/types/home-sections'

export const dynamic = 'force-dynamic'

function toCSS(s?: TextStyle): React.CSSProperties {
  if (!s) return {}
  const css: React.CSSProperties = {}
  if (s.fontSize) css.fontSize = s.fontSize
  if (s.fontWeight) css.fontWeight = s.fontWeight
  if (s.color) css.color = s.color
  if (s.textAlign) css.textAlign = s.textAlign
  if (s.letterSpacing) css.letterSpacing = s.letterSpacing
  return css
}

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = []
  let banners: Awaited<ReturnType<typeof getActiveBanners>> = []

  const sections = await getHomeSections()

  try {
    ;[featuredProducts, banners] = await Promise.all([
      getFeaturedProducts(8),
      getActiveBanners(),
    ])
  } catch {
    // silently fail
  }

  const { brandValues, philosophy, bottomCta } = sections

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <EditableSection sectionId="hero-banner" label="히어로 배너">
        {banners.length > 0 ? (
          <HeroSlider banners={banners} />
        ) : (
          <section className="relative bg-black text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <div className="relative container mx-auto px-4">
              <div className="flex flex-col items-center justify-center min-h-[85vh] lg:min-h-[90vh] text-center px-4">
                {/* 서브 태그라인 */}
                <p className="text-[9px] sm:text-[10px] tracking-[0.55em] uppercase text-[#C9A84C] mb-8 sm:mb-10 animate-fade-in font-bold">
                  Premium Gymwear · Est. 2026
                </p>

                {/* 메인 헤드라인 - 거대한 골드 7 */}
                <div className="animate-fade-in-up">
                  <h1 className="font-black tracking-[-0.04em] leading-none">
                    <span className="block text-[17vw] sm:text-[14vw] lg:text-[11vw] xl:text-[10rem] text-white">ASCEND</span>
                    <span className="block text-[28vw] sm:text-[24vw] lg:text-[18vw] xl:text-[17rem] text-[#C9A84C] leading-[0.8]">7</span>
                  </h1>
                </div>

                {/* 골드 구분 라인 + 태그라인 */}
                <div className="flex items-center gap-4 mt-10 sm:mt-12 animate-fade-in">
                  <div className="w-10 h-px bg-[#C9A84C]/40" />
                  <p className="text-[9px] tracking-[0.45em] text-gray-500 uppercase whitespace-nowrap">Seven Days. No Limits.</p>
                  <div className="w-10 h-px bg-[#C9A84C]/40" />
                </div>

                {/* CTA 버튼 */}
                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up">
                  <Link
                    href="/shop"
                    className="px-12 py-4 bg-[#C9A84C] text-black text-[10px] font-black tracking-[0.3em] hover:bg-[#B8941F] transition-all duration-300"
                  >
                    SHOP NOW
                  </Link>
                  <Link
                    href="/shop?category=top"
                    className="px-12 py-4 border border-white/20 text-white text-[10px] font-medium tracking-[0.3em] hover:border-[#C9A84C]/60 hover:text-[#C9A84C] transition-all duration-300"
                  >
                    NEW ARRIVALS
                  </Link>
                </div>

                {/* 스크롤 다운 */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                  <svg className="w-5 h-5 text-[#C9A84C]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        )}
      </EditableSection>

      {/* ─── Brand Values ─── */}
      <EditableSection sectionId="brand-values" label="브랜드 가치">
        <section className="border-b border-gray-100 relative overflow-hidden bg-white">
          {brandValues.bgImage && (
            <Image src={brandValues.bgImage} alt="" fill className="object-cover opacity-10" sizes="100vw" />
          )}
          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
              {brandValues.items.map((v, i) => (
                <ScrollAnimate key={v.num} delay={i * 100}>
                  <div className="py-10 lg:py-14 px-4 lg:px-10 text-center group">
                    <span
                      className={`tracking-[0.35em] ${!brandValues.styles?.num?.fontSize ? 'text-[9px]' : ''} ${!brandValues.styles?.num?.color ? 'text-[#C9A84C]' : ''}`}
                      style={toCSS(brandValues.styles?.num)}
                    >
                      {v.num}
                    </span>
                    <h3
                      className={`tracking-wider mt-3 ${!brandValues.styles?.title?.fontSize ? 'text-xs sm:text-sm' : ''} ${!brandValues.styles?.title?.fontWeight ? 'font-black' : ''}`}
                      style={toCSS(brandValues.styles?.title)}
                    >
                      {v.title}
                    </h3>
                    <p
                      className={`mt-2 ${!brandValues.styles?.desc?.fontSize ? 'text-[11px] sm:text-xs' : ''} ${!brandValues.styles?.desc?.color ? 'text-gray-400' : ''} leading-relaxed`}
                      style={toCSS(brandValues.styles?.desc)}
                    >
                      {v.desc}
                    </p>
                  </div>
                </ScrollAnimate>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>

      {/* ─── Featured Products ─── */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-20 lg:py-28">
          <ScrollAnimate>
            <div className="flex items-end justify-between mb-10 lg:mb-14">
              <div>
                <p className="text-[9px] tracking-[0.45em] text-[#C9A84C] uppercase mb-2 font-bold">Collection</p>
                <h2 className="text-3xl lg:text-4xl font-black tracking-tighter">FEATURED</h2>
              </div>
              <Link
                href="/shop"
                className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-1.5"
              >
                VIEW ALL
                <span className="text-[#C9A84C]">→</span>
              </Link>
            </div>
          </ScrollAnimate>
          <ScrollAnimate delay={150}>
            <ProductGrid products={featuredProducts} />
          </ScrollAnimate>
        </section>
      )}

      {/* ─── Split Banner (Philosophy) ─── */}
      <EditableSection sectionId="philosophy" label="브랜드 철학">
        <section className="bg-black text-white relative overflow-hidden">
          {philosophy.bgImage && (
            <Image src={philosophy.bgImage} alt="" fill className="object-cover opacity-20" sizes="100vw" />
          )}
          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh] lg:min-h-[60vh]">
              <ScrollAnimate className="flex flex-col justify-center py-16 lg:py-24 lg:pr-16">
                <p
                  className={`uppercase mb-4 ${!philosophy.styles?.subheading?.fontSize ? 'text-[10px]' : ''} ${!philosophy.styles?.subheading?.color ? 'text-gray-500' : ''}`}
                  style={{ letterSpacing: '0.4em', ...toCSS(philosophy.styles?.subheading) }}
                >
                  {philosophy.subheading}
                </p>
                <h2
                  className={`tracking-tight leading-tight ${!philosophy.styles?.heading?.fontSize ? 'text-3xl sm:text-4xl lg:text-5xl' : ''} ${!philosophy.styles?.heading?.fontWeight ? 'font-black' : ''}`}
                  style={toCSS(philosophy.styles?.heading)}
                >
                  {philosophy.heading}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{philosophy.headingHighlight}</span>
                </h2>
                <p
                  className={`mt-6 leading-relaxed max-w-md whitespace-pre-line ${!philosophy.styles?.description?.fontSize ? 'text-sm' : ''} ${!philosophy.styles?.description?.color ? 'text-gray-400' : ''}`}
                  style={toCSS(philosophy.styles?.description)}
                >
                  {philosophy.description}
                </p>
                <div className="mt-8">
                  <Link
                    href={philosophy.buttonUrl}
                    className="inline-block px-8 py-3 border border-white text-sm font-medium tracking-wider hover:bg-white hover:text-black transition-all duration-300"
                  >
                    {philosophy.buttonText}
                  </Link>
                </div>
              </ScrollAnimate>
              <ScrollAnimate delay={200} className="flex items-center justify-center py-16 lg:py-24 border-t lg:border-t-0 lg:border-l border-gray-800/60">
                <div className="grid grid-cols-2 gap-10 sm:gap-14 text-center">
                  {philosophy.stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl sm:text-4xl font-black text-[#C9A84C]">{s.num}</p>
                      <div className="w-6 h-px bg-[#C9A84C]/30 mx-auto my-2" />
                      <p className="text-[10px] text-gray-500 tracking-[0.15em] uppercase">{s.label}</p>
                    </div>
                  ))}
                </div>
              </ScrollAnimate>
            </div>
          </div>
        </section>
      </EditableSection>

      {/* ─── Bottom CTA ─── */}
      <EditableSection sectionId="bottom-cta" label="하단 CTA">
        <section className="relative overflow-hidden bg-[#080808]">
          {/* 골드 상단 라인 */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
          {bottomCta.bgImage && (
            <Image src={bottomCta.bgImage} alt="" fill className="object-cover opacity-10" sizes="100vw" />
          )}
          <div className="container mx-auto px-4 lg:px-8 py-24 lg:py-32 text-center relative">
            <ScrollAnimate>
              <p
                className={`uppercase mb-4 ${!bottomCta.styles?.subheading?.fontSize ? 'text-[9px]' : ''} ${!bottomCta.styles?.subheading?.color ? 'text-[#C9A84C]' : ''} font-bold`}
                style={{ letterSpacing: '0.5em', ...toCSS(bottomCta.styles?.subheading) }}
              >
                {bottomCta.subheading}
              </p>
              <h2
                className={`tracking-tighter mb-6 ${!bottomCta.styles?.heading?.fontSize ? 'text-4xl sm:text-5xl lg:text-6xl' : ''} ${!bottomCta.styles?.heading?.fontWeight ? 'font-black' : ''} text-white`}
                style={toCSS(bottomCta.styles?.heading)}
              >
                {bottomCta.heading}
              </h2>
              <p
                className={`mb-10 max-w-sm mx-auto leading-relaxed ${!bottomCta.styles?.description?.fontSize ? 'text-sm' : ''} ${!bottomCta.styles?.description?.color ? 'text-gray-500' : ''}`}
                style={toCSS(bottomCta.styles?.description)}
              >
                {bottomCta.description}
              </p>
              <Link
                href={bottomCta.buttonUrl}
                className="inline-block px-14 py-4 bg-[#C9A84C] text-black text-[10px] font-black tracking-[0.3em] hover:bg-[#B8941F] transition-all duration-300"
              >
                {bottomCta.buttonText}
              </Link>
            </ScrollAnimate>
          </div>
        </section>
      </EditableSection>
    </div>
  )
}
