import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="text-center max-w-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <FileQuestion className="w-12 h-12 text-muted-foreground" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">
                    페이지를 찾을 수 없어요
                </h2>
                <p className="text-muted-foreground mb-8 text-sm">
                    요청하신 페이지가 존재하지 않거나 삭제되었을 수 있습니다.<br />
                    올바른 경로인지 다시 한 번 확인해주세요.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20"
                >
                    <Home className="w-5 h-5" />
                    홈으로 돌아가기
                </Link>
            </div>
        </div>
    )
}
