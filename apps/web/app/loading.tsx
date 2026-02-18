'use client'

import { PieChart } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
            {/* Animated Spinner with PieChart icon */}
            <div className="relative flex items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />

                {/* Center Icon */}
                <PieChart className="w-8 h-8 text-primary/80" />
            </div>

            {/* Pulsing dots */}
            <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary opacity-70"
                        style={{
                            animation: 'loading-dot 1.2s ease-in-out infinite',
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>

            <style jsx global>{`
        @keyframes loading-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
