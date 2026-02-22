import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { ProductWithImages, Variant } from '@/shared/types/database'

export interface ProductFilters {
  category?: string
  sub?: string
  color?: string
  size?: string
  sortBy?: 'newest' | 'price-asc' | 'price-desc'
  q?: string
  minPrice?: number
  maxPrice?: number
}

/**
 * 필터링 및 정렬이 적용된 제품 조회
 */
export async function getProductsWithFilters(
  filters: ProductFilters = {}
): Promise<ProductWithImages[]> {
  try {
    const supabase = await getSupabaseClient()

    let query = supabase
      .from('products')
      .select('*, images:product_images(*), variants:variants(*)')
      .eq('is_active', true)

    // 검색어 필터
    if (filters.q) {
      query = query.ilike('name', `%${filters.q}%`)
    }

    // 카테고리 필터
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    // 서브카테고리 필터
    if (filters.sub && filters.sub !== 'all') {
      query = query.eq('sub_category', filters.sub)
    }

    // 정렬
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`제품 조회 실패: ${error.message}`)
    }

    if (!data) {
      return []
    }

    // 클라이언트 사이드 필터링 (색상, 사이즈)
    let filteredProducts = data.map((product) => ({
      ...product,
      images: (product.images || []).sort(
        (a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
      ),
      variants: (product.variants || []).filter((v: Variant) => v.is_active),
    })) as ProductWithImages[]

    // 색상 필터
    if (filters.color) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants?.some((v) => v.color === filters.color)
      )
    }

    // 사이즈 필터
    if (filters.size) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants?.some((v) => v.size === filters.size)
      )
    }

    // 가격 범위 필터
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((product) => {
        const prices = product.variants?.map((v) => v.price) || []
        if (prices.length === 0) return false
        const minP = Math.min(...prices)
        if (filters.minPrice !== undefined && minP < filters.minPrice) return false
        if (filters.maxPrice !== undefined && minP > filters.maxPrice) return false
        return true
      })
    }

    // 가격 정렬 (클라이언트 사이드)
    if (filters.sortBy === 'price-asc' || filters.sortBy === 'price-desc') {
      filteredProducts.sort((a, b) => {
        const aPrices = a.variants?.map((v) => v.price) || []
        const bPrices = b.variants?.map((v) => v.price) || []
        const aMin = aPrices.length > 0 ? Math.min(...aPrices) : 0
        const bMin = bPrices.length > 0 ? Math.min(...bPrices) : 0

        if (filters.sortBy === 'price-asc') {
          return aMin - bMin
        } else {
          return bMin - aMin
        }
      })
    }

    return filteredProducts
  } catch (err) {
    throw err
  }
}
