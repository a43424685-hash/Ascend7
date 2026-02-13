export const metadata = {
  title: '개인정보처리방침 | ASCEND7',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 max-w-3xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-8">개인정보처리방침</h1>

      <div className="text-sm text-gray-700 leading-relaxed space-y-6">
        <p>보틀천(이하 &quot;회사&quot;라 합니다)은 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하고 관련 고충을 신속하고 원활하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>

        <section>
          <h2 className="font-bold text-base mb-2">제1조 (개인정보의 처리 목적)</h2>
          <p className="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리된 개인정보는 아래 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 관련 법령에 따라 별도의 동의를 받습니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>회원 가입 및 관리:</strong> 회원 식별, 부정 이용 방지, 계정 관리</li>
            <li><strong>재화 또는 서비스 제공:</strong> 주문 처리, 배송, 결제, 환불, 고객 상담</li>
            <li><strong>고객 문의 및 민원 처리:</strong> 불만 처리, 분쟁 해결 기록 보존</li>
            <li><strong>서비스 개선:</strong> 이용 기록 분석 및 서비스 품질 향상</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제2조 (수집하는 개인정보 항목)</h2>
          <p className="mb-2">회사는 서비스 제공을 위해 최소한의 개인정보만 수집합니다.</p>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-xs text-gray-600 mb-1">회원가입 시</p>
              <p>이름, 이메일, 휴대전화번호, 배송지 주소</p>
            </div>
            <div>
              <p className="font-semibold text-xs text-gray-600 mb-1">주문 시</p>
              <p>이름, 배송지 주소, 연락처, 이메일, 결제 관련 정보</p>
              <p className="text-xs text-gray-500">※ 카드번호 등 민감 결제정보는 회사가 저장하지 않습니다.</p>
            </div>
            <div>
              <p className="font-semibold text-xs text-gray-600 mb-1">자동 수집 정보</p>
              <p>IP 주소, 접속 로그, 쿠키, 이용 기록</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제3조 (개인정보의 보유 및 이용기간)</h2>
          <p className="mb-2">회사는 개인정보 수집 목적이 달성된 후에는 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관해야 하는 정보는 아래와 같습니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>계약/청약철회 기록: 5년</li>
            <li>대금 결제 및 재화 공급 기록: 5년</li>
            <li>소비자 불만/분쟁 처리 기록: 3년</li>
            <li>접속 기록: 3개월</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제4조 (개인정보의 제3자 제공)</h2>
          <p className="mb-2">회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 다음의 경우 예외로 합니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>이용자의 사전 동의가 있는 경우</li>
            <li>법령에 의한 경우</li>
            <li>배송 및 결제 처리를 위해 필요한 최소한의 정보 제공 (택배사 → 배송 목적, 결제대행사(PG) → 결제 처리 목적)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제5조 (개인정보 처리 위탁)</h2>
          <p className="mb-2">회사는 원활한 서비스 제공을 위해 일부 업무를 외부에 위탁할 수 있습니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>결제 처리: PG사</li>
            <li>배송: 택배사</li>
            <li>이메일 발송: 메일 서비스 업체</li>
            <li>서버/호스팅: 클라우드 서비스 업체</li>
          </ul>
          <p className="mt-2">회사는 위탁업체가 개인정보를 안전하게 처리하도록 관리·감독합니다.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제6조 (이용자의 권리와 행사 방법)</h2>
          <p>이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요구할 수 있습니다. 요청은 아래 연락처를 통해 가능하며 회사는 지체 없이 조치합니다.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제7조 (개인정보의 파기)</h2>
          <p>개인정보는 목적 달성 후 즉시 파기됩니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>전자 파일: 복구 불가능한 방식 삭제</li>
            <li>문서: 분쇄 또는 소각</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제8조 (안전성 확보 조치)</h2>
          <p className="mb-2">회사는 개인정보 보호를 위해 다음 조치를 시행합니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>접근 권한 최소화</li>
            <li>암호화 저장</li>
            <li>보안 시스템 운영</li>
            <li>해킹 방지 기술 적용</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제9조 (쿠키 사용)</h2>
          <p>회사는 맞춤 서비스 제공을 위해 쿠키를 사용할 수 있으며, 이용자는 브라우저 설정을 통해 저장을 거부할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제10조 (개인정보 보호책임자)</h2>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-0.5">
            <p><strong>성명:</strong> 이병천</p>
            <p><strong>연락처:</strong> 010-9809-5148</p>
            <p><strong>이메일:</strong> chun8588@naver.com</p>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제11조 (개인정보 침해 신고)</h2>
          <p className="mb-2">개인정보 침해 발생 시 아래 기관에 신고할 수 있습니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>개인정보침해신고센터: 118</li>
            <li>경찰청 사이버수사국: 182</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제12조 (사업자 정보)</h2>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-0.5">
            <p><strong>상호:</strong> 보틀천</p>
            <p><strong>대표자:</strong> 이병천</p>
            <p><strong>주소:</strong> 서울시 강북구 노해로34, 9층</p>
            <p><strong>전화:</strong> 010-9809-5148</p>
            <p><strong>이메일:</strong> chun8588@naver.com</p>
            <p><strong>사업자등록번호:</strong> 369-17-02526</p>
            <p><strong>통신판매업 신고번호:</strong> 제2026-서울강북-0119호</p>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">제13조 (방침 변경)</h2>
          <p>본 방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며 변경 시 홈페이지에 공지합니다.</p>
        </section>

        <section className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">부칙: 본 개인정보처리방침은 2026년 02월 13일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  )
}
