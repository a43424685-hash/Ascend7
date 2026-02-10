import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { ProductWithImages, Variant } from '@/shared/types/database'

export async function getProducts(
  category?: string
): Promise<ProductWithImages[]> {
  console.log('📦 getProducts 호출됨', { category })
  
  try {
    const supabase = await getSupabaseClient()
    console.log('✅ Supabase 클라이언트 생성 성공')

    console.log('🔍 products 테이블 조회 시작...')
    
    let query = supabase
      .from('products')
      .select('*, images:product_images(*), variants:variants(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (category) {
      console.log('  - 카테고리 필터:', category)
      query = query.eq('category', category)
    }

    const { data, error } = await query
    
    console.log('📊 쿼리 결과:', {
      hasData: !!data,
      dataLength: data?.length || 0,
      hasError: !!error,
      errorMessage: error?.message,
    })

    if (error) {
      // 에러 객체를 문자열로 변환 (모든 속성 포함)
      const errorStr = JSON.stringify(error, null, 2)
      const errorMessage = String(error.message || error || errorStr)
      
      console.error('Supabase Query Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: errorStr,
      })

      // HTML 응답인 경우 URL 오류로 판단
      if (
        errorMessage.includes('<!DOCTYPE') ||
        errorMessage.includes('<html') ||
        errorMessage.includes('Supabase') ||
        errorMessage.includes('404') ||
        errorMessage.includes('Looking for something')
      ) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        console.error('Supabase Configuration:', {
          url: supabaseUrl,
          hasKey: !!supabaseKey,
          keyLength: supabaseKey?.length,
        })

        throw new Error(
          `❌ Supabase 연결 오류: URL이 잘못되었거나 프로젝트를 찾을 수 없습니다.\n\n` +
          `📋 확인 사항:\n` +
          `1. .env.local 파일이 프로젝트 루트에 있는지 확인\n` +
          `2. NEXT_PUBLIC_SUPABASE_URL 형식: https://[프로젝트ID].supabase.co\n` +
          `3. 현재 URL: ${supabaseUrl || '❌ 설정되지 않음'}\n` +
          `4. Supabase 대시보드 → Settings → API → Project URL 복사\n` +
          `5. 개발 서버 재시작: npm run dev\n\n` +
          `💡 팁: http://localhost:3000/test-env 에서 환경 변수를 확인하세요.`
        )
      }

      // 테이블이 없는 경우
      if (
        error.message?.includes('relation') &&
        (error.message.includes('does not exist') ||
          error.message.includes('존재하지 않'))
      ) {
        throw new Error(
          `❌ 데이터베이스 테이블이 없습니다.\n\n` +
          `📋 해결 방법:\n` +
          `1. Supabase 대시보드 → SQL Editor 열기\n` +
          `2. supabase-schema.sql 파일의 전체 내용 복사\n` +
          `3. SQL Editor에 붙여넣고 Run 버튼 클릭\n` +
          `4. 성공 메시지 확인\n\n` +
          `원본 오류: ${error.message}`
        )
      }

      // 권한 오류
      if (error.message?.includes('permission') || error.code === '42501') {
        throw new Error(
          `❌ 데이터베이스 권한 오류\n\n` +
          `📋 해결 방법:\n` +
          `1. Supabase 대시보드 → Settings → API 확인\n` +
          `2. Anon Key가 올바른지 확인\n` +
          `3. Row Level Security (RLS) 정책 확인\n\n` +
          `원본 오류: ${error.message}`
        )
      }

      throw new Error(
        `제품 조회 실패: ${error.message || '알 수 없는 오류'}\n` +
        `에러 코드: ${error.code || 'N/A'}\n` +
        `상세: ${error.details || 'N/A'}`
      )
    }

    if (!data) {
      console.log('⚠️ 데이터가 없습니다 (빈 배열 반환)')
      return []
    }

    const processedProducts = data.map((product) => ({
      ...product,
      images: (product.images || []).sort(
        (a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0)   
      ),
      variants: (product.variants || []).filter(
        (v: Variant) => v.is_active
      ),
    })) as ProductWithImages[]

    console.log('✅ 제품 처리 완료:', {
      총개수: processedProducts.length,
      제품명: processedProducts.map(p => p.name),
    })

    return processedProducts
  } catch (err) {
    // 클라이언트 생성 실패 등 상위 레벨 에러
    if (err instanceof Error) {
      // 이미 포맷된 에러는 그대로 전달
      if (err.message.includes('❌') || err.message.includes('확인 사항')) {
        throw err
      }
      throw new Error(
        `Supabase 연결 실패: ${err.message}\n\n` +
        `환경 변수를 확인하고 개발 서버를 재시작하세요.`
      )
    }
    throw new Error(`예상치 못한 오류가 발생했습니다: ${String(err)}`)
  }
}
