'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
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
          <h1 className="font-bold text-lg text-foreground">이용약관</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <p className="text-muted-foreground text-sm">시행일: 2026년 3월 1일</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제1조 (목적)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              본 약관은 Time Pie(이하 &quot;서비스&quot;)가 제공하는 시간 관리 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제2조 (정의)</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>&quot;서비스&quot;란 Time Pie가 제공하는 일정 관리, 할 일 관리, 습관 추적 등 시간 관리 관련 기능을 말합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 자를 말합니다.</li>
              <li>&quot;계정&quot;이란 이용자가 서비스를 이용하기 위해 소셜 로그인을 통해 생성한 고유 식별 정보를 말합니다.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제3조 (약관의 효력 및 변경)</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
              <li>서비스는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 날부터 효력을 발생합니다.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제4조 (서비스의 제공)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">서비스는 다음과 같은 기능을 제공합니다.</p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>24시간 파이 차트 기반 일정 관리</li>
              <li>할 일(Todo) 생성, 수정, 삭제 및 완료 관리</li>
              <li>습관(Habit) 추적 및 통계</li>
              <li>알림 및 푸시 알림 기능</li>
              <li>다크 모드 등 사용자 설정</li>
              <li>기타 서비스가 추가 개발하여 제공하는 기능</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제5조 (서비스 이용)</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>서비스는 연중무휴, 1일 24시간 제공을 원칙으로 합니다. 다만, 시스템 점검 등의 사유로 일시적으로 중단될 수 있습니다.</li>
              <li>서비스는 무료로 제공되며, 추후 유료 기능이 추가될 수 있습니다.</li>
              <li>이용자는 소셜 로그인(Google, Kakao 등)을 통해 계정을 생성하고 서비스를 이용할 수 있습니다.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제6조 (이용자의 의무)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스를 이용하여 법령에 위반되는 행위를 하는 것</li>
              <li>서비스의 정보를 무단으로 수집, 이용, 제공하는 행위</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제7조 (서비스의 변경 및 중단)</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>서비스는 운영상, 기술상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
              <li>서비스 중단의 경우 사전에 공지합니다. 다만, 불가피한 사유가 있는 경우 사후에 공지할 수 있습니다.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제8조 (면책 조항)</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              <li>서비스는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
              <li>서비스는 이용자가 서비스를 이용하여 기대하는 결과를 얻지 못한 것에 대해 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">제9조 (분쟁 해결)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              본 약관과 관련하여 분쟁이 발생한 경우, 서비스와 이용자는 분쟁 해결을 위해 성실히 협의합니다. 협의가 이루어지지 않을 경우 관련 법령에 따른 관할 법원에 소를 제기할 수 있습니다.
            </p>
          </section>

          <section className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground/70">
              본 약관은 2026년 3월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
