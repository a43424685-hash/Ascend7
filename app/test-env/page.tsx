export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  const urlIsValid =
    supabaseUrl?.startsWith('https://') &&
    supabaseUrl?.includes('.supabase.co') &&
    !supabaseUrl.endsWith('/')

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Environment Variables Test</h1>
      <div className="space-y-4">
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase URL</h2>
          <div className="space-y-2">
            <p>
              <strong>설정됨:</strong>{' '}
              {supabaseUrl ? '✅ Yes' : '❌ No'}
            </p>
            {supabaseUrl && (
              <>
                <p>
                  <strong>URL:</strong> {supabaseUrl.substring(0, 50)}
                  {supabaseUrl.length > 50 ? '...' : ''}
                </p>
                <p>
                  <strong>형식 검증:</strong>{' '}
                  {urlIsValid ? (
                    <span className="text-green-600">✅ 올바른 형식</span>
                  ) : (
                    <span className="text-red-600">
                      ❌ 잘못된 형식 (https://[프로젝트ID].supabase.co 형식이어야 함)
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <div className="space-y-2">
            <p>
              <strong>Anon Key:</strong> {hasAnonKey ? '✅ 설정됨' : '❌ 없음'}
            </p>
            <p>
              <strong>Service Role Key:</strong>{' '}
              {hasServiceKey ? '✅ 설정됨' : '❌ 없음'}
            </p>
          </div>
        </div>

        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-semibold mb-4">체크리스트</h2>
          <ul className="space-y-2">
            <li>
              {supabaseUrl ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_URL 설정됨
            </li>
            <li>
              {urlIsValid ? '✅' : '❌'} URL 형식이 올바름
            </li>
            <li>
              {hasAnonKey ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_ANON_KEY 설정됨
            </li>
            <li>
              {hasServiceKey ? '✅' : '❌'} SUPABASE_SERVICE_ROLE_KEY 설정됨
            </li>
          </ul>
        </div>

        {!urlIsValid && supabaseUrl && (
          <div className="bg-red-50 border-2 border-red-200 p-6">
            <h3 className="font-semibold text-red-800 mb-2">
              ⚠️ URL 형식 오류
            </h3>
            <p className="text-red-700 mb-2">
              현재 URL: <code>{supabaseUrl}</code>
            </p>
            <p className="text-red-700">
              올바른 형식: <code>https://[프로젝트ID].supabase.co</code>
            </p>
            <p className="text-red-700 mt-2">
              Supabase 대시보드 → Settings → API → Project URL에서 확인하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

