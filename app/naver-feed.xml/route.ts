import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// 네이버 쇼핑 카테고리 매핑
const CATEGORY_MAP: Record<string, string> = {
  outer: '패션의류 > 스포츠/레저의류 > 아우터',
  top: '패션의류 > 스포츠/레저의류 > 상의',
  bottom: '패션의류 > 스포츠/레저의류 > 하의',
  accessories: '패션잡화 > 스포츠/레저잡화',
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itero7.com'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: products } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:variants(*)')
    .eq('is_active', true)
    .eq('is_coming_soon', false)
    .order('created_at', { ascending: false })

  const items = (products || [])
    .map((product) => {
      const images = (product.images || []).sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      )
      const variants = (product.variants || []).filter((v: any) => v.is_active)
      const prices = variants.map((v: any) => v.price as number)
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0
      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0)
      const inStock = totalStock > 0

      if (!images[0] || minPrice === 0) return null

      const category = CATEGORY_MAP[product.category] || '패션의류 > 스포츠/레저의류'
      const imageUrl = images[0].url
      const productUrl = `${baseUrl}/product/${product.slug}`
      const description = product.description || `${product.name} - ITERO7 짐웨어`

      // 색상/사이즈 목록
      const colors = [...new Set(variants.map((v: any) => v.color as string))].join(', ')
      const sizes = [...new Set(variants.map((v: any) => v.size as string))].join(', ')

      return `
  <item>
    <g:id>${escapeXml(product.id)}</g:id>
    <g:title>${escapeXml(product.name)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${escapeXml(productUrl)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>${images[1] ? `\n    <g:additional_image_link>${escapeXml(images[1].url)}</g:additional_image_link>` : ''}
    <g:price>${minPrice} KRW</g:price>
    <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
    <g:brand>ITERO7</g:brand>
    <g:condition>new</g:condition>
    <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Activewear</g:google_product_category>
    <g:product_type>${escapeXml(category)}</g:product_type>${colors ? `\n    <g:color>${escapeXml(colors)}</g:color>` : ''}${sizes ? `\n    <g:size>${escapeXml(sizes)}</g:size>` : ''}
    <g:gender>unisex</g:gender>
    <g:age_group>adult</g:age_group>
    <g:shipping>
      <g:country>KR</g:country>
      <g:price>${minPrice >= 50000 ? '0' : '3000'} KRW</g:price>
    </g:shipping>
  </item>`
    })
    .filter(Boolean)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>ITERO7</title>
  <link>${baseUrl}</link>
  <description>ITERO7 - 7일간의 반복, 다시 하는 사람들을 위한 짐웨어</description>
${items}
</channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
