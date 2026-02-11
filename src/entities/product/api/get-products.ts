import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { ProductWithImages, Variant } from '@/shared/types/database'

export async function getProducts(
  category?: string
): Promise<ProductWithImages[]> {
  try {
    const supabase = await getSupabaseClient()

    let query = supabase
      .from('products')
      .select('*, images:product_images(*), variants:variants(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      const errorMessage = String(error.message || error)

      // HTML 응답인 경우 URL 오류로 판단
      if (
        errorMessage.includes('<!DOCTYPE') ||
        errorMessage.includes('<html') ||
        errorMessage.includes('404')
      ) {
        throw new Error(
          `Supabase 연결 오류: URL이 잘못되었거나 프로젝트를 찾을 수 없습니다.`
        )
      }

      // 테이블이 없는 경우
      if (
        error.message?.includes('relation') &&
        error.message.includes('does not exist')
      ) {
        throw new Error(
          `데이터베이스 테이블이 없습니다. database/01_schema.sql을 실행하세요.`
        )
      }

      // 권한 오류
      if (error.message?.includes('permission') || error.code === '42501') {
        throw new Error(`데이터베이스 권한 오류: ${error.message}`)
      }

      throw new Error(`제품 조회 실패: ${error.message || '알 수 없는 오류'}`)
    }

    if (!data) {
      return []
    }

    const processedProducts = data.map((product) => ({
      ...product,
      images: (product.images || []).sort(
        (a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
      ),
      variants: (product.variants || []).filter((v: Variant) => v.is_active),
    })) as ProductWithImages[]

    return processedProducts
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error(`예상치 못한 오류가 발생했습니다: ${String(err)}`)
  }
}
