import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedProducts } from '@/entities/product/api/get-featured-products'
import { getActiveBanners } from '@/entities/banner/api/get-banners'
import { getHomeSections } from '@/entities/cms/api/get-home-sections'
import { getActiveFlashSales } from '@/entities/flash-sale/api/get-flash-sales'
import { ProductGrid } from '@/widgets/product-grid'
import { HeroSlider } from '@/widgets/hero-slider'
import { StaticHeroSlider } from '@/widgets/hero-slider/static-hero-slider'
import { FlashSaleFloatingCard } from '@/widgets/flash-sale/flash-sale-floating-card'
import { InstagramFeedSection } from '@/widgets/instagram-feed'
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

  let flashSales: Awaited<ReturnType<typeof getActiveFlashSales>> = []

  try {
    ;[featuredProducts, banners, flashSales] = await Promise.all([
      getFeaturedProducts(8),
      getActiveBanners(),
      getActiveFlashSales(),
    ])
  } catch {
    // silently fail
  }

  const { brandValues, philosophy, bottomCta } = sections

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <div className="relative">
        <EditableSection sectionId="hero-banner" label="히어로 배너">
          {banners.length > 0 ? (
            <HeroSlider banners={banners} />
          ) : (
            <StaticHeroSlider />
          )}
        </EditableSection>
        {flashSales.length > 0 && <FlashSaleFloatingCard sales={flashSales} />}
      </div>

      {/* ─── Brand Values ─── */}
      <EditableSection sectionId="brand-values" label="브랜드 가치">
        <section className="border-b border-gray-100 relative overflow-hidden">
          {brandValues.bgImage && (
            <Image src={brandValues.bgImage} alt="" fill className="object-cover opacity-5" sizes="100vw" />
          )}
          <div className="container mx-auto px-6 lg:px-10 relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
              {brandValues.items.map((v, i) => (
                <ScrollAnimate key={v.num} delay={i * 80}>
                  <div className="py-12 lg:py-16 px-5 lg:px-10 text-center">
                    <span
                      className={`tracking-[0.35em] ${!brandValues.styles?.num?.fontSize ? 'text-[9px]' : ''} ${!brandValues.styles?.num?.color ? 'text-gray-300' : ''}`}
                      style={toCSS(brandValues.styles?.num)}
                    >
                      {v.num}
                    </span>
                    <h3
                      className={`tracking-wide mt-3 ${!brandValues.styles?.title?.fontSize ? 'text-xs sm:text-sm' : ''} ${!brandValues.styles?.title?.fontWeight ? 'font-bold' : ''}`}
                      style={toCSS(brandValues.styles?.title)}
                    >
                      {v.title}
                    </h3>
                    <p
                      className={`mt-2 leading-relaxed ${!brandValues.styles?.desc?.fontSize ? 'text-[11px] sm:text-xs' : ''} ${!brandValues.styles?.desc?.color ? 'text-gray-400' : ''}`}
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
        <section className="container mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <ScrollAnimate>
            <div className="flex items-end justify-between mb-12 lg:mb-16">
              <div>
                <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-2">Collection</p>
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight">FEATURED</h2>
              </div>
              <Link
                href="/shop"
                className="text-[10px] font-medium tracking-[0.15em] text-gray-400 hover:text-black transition-colors duration-200 flex items-center gap-1"
              >
                VIEW ALL <span>→</span>
              </Link>
            </div>
          </ScrollAnimate>
          <ScrollAnimate delay={100}>
            <ProductGrid products={featuredProducts} />
          </ScrollAnimate>
        </section>
      )}

      {/* ─── Philosophy ─── */}
      <EditableSection sectionId="philosophy" label="브랜드 철학">
        <section className="bg-[#0a0a0a] text-white relative overflow-hidden">
          {philosophy.bgImage && (
            <Image src={philosophy.bgImage} alt="" fill className="object-cover opacity-15" sizes="100vw" />
          )}
          <div className="container mx-auto px-6 lg:px-10 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh] lg:min-h-[60vh]">
              <ScrollAnimate className="flex flex-col justify-center py-16 lg:py-24 lg:pr-16">
                <p
                  className={`uppercase mb-5 ${!philosophy.styles?.subheading?.fontSize ? 'text-[9px]' : ''} ${!philosophy.styles?.subheading?.color ? 'text-white/25' : ''} font-medium`}
                  style={{ letterSpacing: '0.4em', ...toCSS(philosophy.styles?.subheading) }}
                >
                  {philosophy.subheading}
                </p>
                <h2
                  className={`tracking-tight leading-tight ${!philosophy.styles?.heading?.fontSize ? 'text-3xl sm:text-4xl lg:text-5xl' : ''} ${!philosophy.styles?.heading?.fontWeight ? 'font-black' : ''}`}
                  style={toCSS(philosophy.styles?.heading)}
                >
                  {philosophy.heading}<br />
                  <span className="text-white/30">{philosophy.headingHighlight}</span>
                </h2>
                <p
                  className={`mt-7 leading-relaxed max-w-md whitespace-pre-line ${!philosophy.styles?.description?.fontSize ? 'text-sm' : ''} ${!philosophy.styles?.description?.color ? 'text-white/35' : ''}`}
                  style={toCSS(philosophy.styles?.description)}
                >
                  {philosophy.description}
                </p>
                <div className="mt-9">
                  <Link
                    href={philosophy.buttonUrl}
                    className="inline-block px-8 py-3 border border-white/12 text-sm font-medium tracking-wider text-white/60 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                  >
                    {philosophy.buttonText}
                  </Link>
                </div>
              </ScrollAnimate>
              <ScrollAnimate delay={150} className="flex items-center justify-center py-16 lg:py-24 border-t lg:border-t-0 lg:border-l border-white/5">
                <div className="grid grid-cols-2 gap-10 sm:gap-14 text-center">
                  {philosophy.stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl sm:text-4xl font-black text-white">{s.num}</p>
                      <div className="w-5 h-px bg-white/10 mx-auto my-3" />
                      <p className="text-[9px] text-white/25 tracking-[0.2em] uppercase">{s.label}</p>
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
        <section className="relative overflow-hidden bg-[#0a0a0a]">
          <div className="h-px bg-white/5" />
          {bottomCta.bgImage && (
            <Image src={bottomCta.bgImage} alt="" fill className="object-cover opacity-10" sizes="100vw" />
          )}
          <div className="container mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center relative">
            <ScrollAnimate>
              <p
                className={`uppercase mb-5 ${!bottomCta.styles?.subheading?.fontSize ? 'text-[9px]' : ''} ${!bottomCta.styles?.subheading?.color ? 'text-white/25' : ''} font-medium`}
                style={{ letterSpacing: '0.5em', ...toCSS(bottomCta.styles?.subheading) }}
              >
                {bottomCta.subheading}
              </p>
              <h2
                className={`tracking-tight mb-7 ${!bottomCta.styles?.heading?.fontSize ? 'text-4xl sm:text-5xl lg:text-6xl' : ''} ${!bottomCta.styles?.heading?.fontWeight ? 'font-black' : ''} text-white`}
                style={toCSS(bottomCta.styles?.heading)}
              >
                {bottomCta.heading}
              </h2>
              <p
                className={`mb-10 max-w-sm mx-auto leading-relaxed ${!bottomCta.styles?.description?.fontSize ? 'text-sm' : ''} ${!bottomCta.styles?.description?.color ? 'text-white/35' : ''}`}
                style={toCSS(bottomCta.styles?.description)}
              >
                {bottomCta.description}
              </p>
              <Link
                href={bottomCta.buttonUrl}
                className="inline-block px-12 py-4 bg-white text-black text-[10px] font-black tracking-[0.25em] hover:bg-gray-100 transition-colors duration-200"
              >
                {bottomCta.buttonText}
              </Link>
            </ScrollAnimate>
          </div>
        </section>
      </EditableSection>

      {/* ─── Instagram Feed ─── */}
      <InstagramFeedSection />
    </div>
  )
}
