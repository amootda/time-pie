'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-bold text-lg text-foreground">개인정보처리방침</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <p className="text-muted-foreground text-sm">시행일: 2026년 3월 1일</p>
          </section>

          <section className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Time Pie(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보처리방침을 통해 이용자의 개인정보가 어떻게 수집, 이용, 관리되는지 안내합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제1조 (수집하는 개인정보)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">서비스는 회원가입 및 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">소셜 로그인 시 수집 항목</p>
                <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc pl-4 mt-1">
                  <li>이메일 주소</li>
                  <li>이름 (프로필 이름)</li>
                  <li>프로필 이미지 URL</li>
                  <li>소셜 계정 고유 식별자 (OAuth ID)</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">서비스 이용 중 자동 수집 항목</p>
                <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc pl-4 mt-1">
                  <li>서비스 이용 기록 (일정, 할 일, 습관 데이터)</li>
                  <li>알림 설정 및 테마 설정 정보</li>
                  <li>푸시 알림 구독 정보</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제2조 (개인정보의 수집 및 이용 목적)</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>회원 식별 및 가입 의사 확인</li>
              <li>서비스 제공 및 기능 개선</li>
              <li>일정, 할 일, 습관 데이터의 저장 및 동기화</li>
              <li>알림 및 푸시 알림 발송</li>
              <li>이용자 문의 응대 및 고지 사항 전달</li>
              <li>서비스 이용 통계 분석 및 개선</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제3조 (개인정보의 보유 및 이용 기간)</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>이용자의 개인정보는 서비스 이용 기간 동안 보유합니다.</li>
              <li>회원 탈퇴 시 개인정보는 지체 없이 파기합니다.</li>
              <li>다만, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
                <ul className="space-y-1 list-disc pl-4 mt-1">
                  <li>전자상거래 등에서의 소비자 보호에 관한 법률: 계약 또는 청약 철회 기록 5년</li>
                  <li>통신비밀보호법: 접속 로그 기록 3개월</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법률에 특별한 규정이 있는 경우</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제5조 (개인정보의 처리 위탁)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다.</p>
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium text-foreground">수탁 업체</p>
                  <p className="text-muted-foreground">Supabase Inc.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">위탁 업무</p>
                  <p className="text-muted-foreground">데이터베이스 호스팅 및 인증</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div>
                  <p className="font-medium text-foreground">수탁 업체</p>
                  <p className="text-muted-foreground">Vercel Inc.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">위탁 업무</p>
                  <p className="text-muted-foreground">웹 애플리케이션 호스팅</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제6조 (개인정보의 파기)</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다.</li>
              <li>전자적 파일 형태의 정보는 복구할 수 없는 방법으로 삭제합니다.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제7조 (이용자의 권리)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정 및 삭제 요구</li>
              <li>개인정보 처리 정지 요구</li>
              <li>회원 탈퇴 (서비스 내 설정에서 가능)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제8조 (개인정보의 안전성 확보 조치)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취합니다.</p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>개인정보의 암호화 전송 (HTTPS/TLS)</li>
              <li>데이터베이스 접근 제어 (Row Level Security)</li>
              <li>소셜 로그인 기반 인증으로 비밀번호 미저장</li>
              <li>정기적인 보안 점검 및 업데이트</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제9조 (쿠키의 사용)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              서비스는 이용자의 편의를 위해 쿠키를 사용합니다. 쿠키는 테마 설정, 인증 세션 유지 등의 목적으로 사용되며, 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제10조 (개인정보 보호책임자)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              개인정보 처리에 관한 불만 처리 및 피해 구제를 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-muted/30 rounded-xl p-4 text-sm space-y-1">
              <p className="text-muted-foreground">담당: Time Pie 운영팀</p>
              <p className="text-muted-foreground">문의: 서비스 내 피드백 기능 이용</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제11조 (개인정보처리방침의 변경)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              본 개인정보처리방침이 변경되는 경우, 변경 사항은 서비스 내 공지를 통해 안내하며, 변경된 방침은 공지 후 7일이 경과한 날부터 효력을 발생합니다.
            </p>
          </section>

          <section className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground/70">
              본 개인정보처리방침은 2026년 3월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
