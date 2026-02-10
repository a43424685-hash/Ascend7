import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/shared/api/supabaseClient'

/**
 * Supabase 연결 테스트 API 엔드포인트
 * GET /api/test-supabase
 */
export async function GET() {
  const startTime = Date.now()
  const logs: string[] = []

  const log = (message: string) => {
    const timestamp = new Date().toISOString()
    logs.push(`[${timestamp}] ${message}`)
    console.log(message)
  }

  try {
    log('🔍 Supabase 연결 테스트 시작')

    // 1. 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    log(`환경 변수 확인:`)
    log(`  - URL: ${supabaseUrl ? '✅ 설정됨' : '❌ 없음'}`)
    log(`  - Key: ${supabaseKey ? '✅ 설정됨' : '❌ 없음'}`)

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: '환경 변수가 설정되지 않았습니다',
          logs,
        },
        { status: 500 }
      )
    }

    // 2. 클라이언트 생성
    log('Supabase 클라이언트 생성 중...')
    const supabase = await getSupabaseClient()
    log('✅ 클라이언트 생성 성공')

    // 3. products 테이블 조회 테스트
    log('products 테이블 조회 중...')
    const { data, error, count } = await supabase
      .from('products')
      .select('id, name, slug, category', { count: 'exact' })
      .limit(5)

    if (error) {
      log(`❌ 쿼리 에러: ${error.message}`)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          logs,
        },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime

    log(`✅ 성공! ${count || data?.length || 0}개 제품 조회 완료 (${duration}ms)`)

    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 성공',
      data: {
        productCount: count || data?.length || 0,
        products: data,
        duration: `${duration}ms`,
      },
      config: {
        url: supabaseUrl.substring(0, 30) + '...',
        hasKey: !!supabaseKey,
        keyLength: supabaseKey.length,
      },
      logs,
    })
  } catch (err: any) {
    log(`❌ 예외 발생: ${err.message}`)
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: err.stack,
        logs,
      },
      { status: 500 }
    )
  }
}

