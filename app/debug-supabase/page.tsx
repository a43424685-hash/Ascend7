import { createClient } from '@/shared/lib/supabase/server'

export default async function DebugSupabasePage() {
  let connectionStatus = '테스트 중...'
  let errorDetails: any = null
  let configInfo: any = null

  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    configInfo = {
      hasUrl: !!supabaseUrl,
      url: supabaseUrl ? supabaseUrl.substring(0, 50) + '...' : '없음',
      urlLength: supabaseUrl?.length || 0,
      urlValid: supabaseUrl?.startsWith('https://') && supabaseUrl?.includes('.supabase.co'),
      hasKey: !!supabaseKey,
      keyLength: supabaseKey?.length || 0,
      keyStartsWith: supabaseKey?.substring(0, 20) || '없음',
    }

    // Supabase 클라이언트 생성 테스트
    const supabase = await createClient()

    // 간단한 쿼리 테스트
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (error) {
      errorDetails = {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
      connectionStatus = '❌ 연결 실패'
    } else {
      connectionStatus = '✅ 연결 성공'
    }
  } catch (err: any) {
    connectionStatus = '❌ 오류 발생'
    errorDetails = {
      message: err.message,
      stack: err.stack,
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Supabase 연결 디버깅</h1>

      <div className="space-y-6">
        {/* 연결 상태 */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-semibold mb-4">연결 상태</h2>
          <p className="text-2xl font-bold">{connectionStatus}</p>
        </div>

        {/* 환경 변수 정보 */}
        {configInfo && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-semibold mb-4">환경 변수 설정</h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <strong>URL 설정됨:</strong>{' '}
                {configInfo.hasUrl ? '✅' : '❌'}
              </div>
              <div>
                <strong>URL:</strong> {configInfo.url}
              </div>
              <div>
                <strong>URL 형식 검증:</strong>{' '}
                {configInfo.urlValid ? (
                  <span className="text-green-600">✅ 올바름</span>
                ) : (
                  <span className="text-red-600">❌ 잘못됨</span>
                )}
              </div>
              <div>
                <strong>Anon Key 설정됨:</strong>{' '}
                {configInfo.hasKey ? '✅' : '❌'}
              </div>
              <div>
                <strong>Anon Key 시작:</strong> {configInfo.keyStartsWith}
              </div>
            </div>
          </div>
        )}

        {/* 에러 상세 정보 */}
        {errorDetails && (
          <div className="border-2 border-red-500 bg-red-50 p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-800">
              에러 상세 정보
            </h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </div>
        )}

        {/* 해결 방법 */}
        {connectionStatus.includes('❌') && (
          <div className="border-2 border-yellow-500 bg-yellow-50 p-6">
            <h2 className="text-xl font-semibold mb-4">해결 방법</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>.env.local 파일 확인</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>프로젝트 루트에 .env.local 파일이 있는지 확인</li>
                  <li>
                    NEXT_PUBLIC_SUPABASE_URL 형식:
                    https://[프로젝트ID].supabase.co
                  </li>
                  <li>URL 끝에 슬래시(/)가 없어야 함</li>
                </ul>
              </li>
              <li>
                <strong>Supabase 대시보드에서 확인</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Settings → API → Project URL 복사</li>
                  <li>Anon Key 복사</li>
                </ul>
              </li>
              <li>
                <strong>개발 서버 재시작</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Ctrl+C로 서버 중지</li>
                  <li>npm run dev로 다시 시작</li>
                </ul>
              </li>
              <li>
                <strong>테이블 생성 확인</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Supabase SQL Editor에서 supabase-schema.sql 실행</li>
                  <li>Table Editor에서 products 테이블 확인</li>
                </ul>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

