export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">Time Pie</h1>
        <p className="text-xl text-foreground/70 mb-8">
          시간을 파이처럼 관리하세요
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
            시작하기
          </button>
          <button className="px-6 py-3 border border-secondary text-secondary rounded-lg font-medium hover:bg-secondary-50 transition-colors">
            더 알아보기
          </button>
        </div>
      </div>
    </main>
  )
}
