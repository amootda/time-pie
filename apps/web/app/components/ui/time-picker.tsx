"use client"

import { Clock } from "lucide-react"
import * as React from "react"
import { cn, Popover, PopoverContent, PopoverTrigger } from "./popover"

interface TimePickerProps {
    value: string // HH:mm format
    onChange: (value: string) => void
    disabled?: boolean
}

export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const hourRef = React.useRef<HTMLDivElement>(null)
    const minuteRef = React.useRef<HTMLDivElement>(null)

    // Parse initial value
    const parseTime = (timeStr: string) => {
        if (!timeStr) return { hour: '09', minute: '00', period: '오전' as const }
        const [h, m] = timeStr.split(':')
        const hourInt = parseInt(h, 10)
        const period = hourInt >= 12 ? '오후' as const : '오전' as const
        const displayHour = hourInt > 12 ? hourInt - 12 : (hourInt === 0 ? 12 : hourInt)

        return {
            hour: displayHour.toString().padStart(2, '0'),
            minute: m,
            period
        }
    }

    const { hour, minute, period } = React.useMemo(() => parseTime(value), [value])

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))
    const periods = ['오전', '오후'] as const

    // Auto-scroll to selected values when popover opens
    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                const scrollToSelected = (container: HTMLDivElement | null, selectedValue: string, items: string[]) => {
                    if (!container) return
                    const index = items.indexOf(selectedValue)
                    if (index === -1) return
                    const buttons = container.querySelectorAll('button')
                    if (buttons[index]) {
                        buttons[index].scrollIntoView({ block: 'center', behavior: 'instant' })
                    }
                }
                scrollToSelected(hourRef.current, hour, hours)
                scrollToSelected(minuteRef.current, minute, minutes)
            }, 50)
            return () => clearTimeout(timer)
        }
    }, [isOpen, hour, minute])

    const handleTimeChange = (type: 'hour' | 'minute' | 'period', newVal: string) => {
        let newHour = parseInt(hour, 10)
        let newMinute = parseInt(minute, 10)
        let newPeriod = period

        if (type === 'hour') newHour = parseInt(newVal, 10)
        if (type === 'minute') newMinute = parseInt(newVal, 10)
        if (type === 'period') newPeriod = newVal as typeof period

        // Convert back to 24h format
        let hour24 = newHour
        if (newPeriod === '오후' && newHour !== 12) hour24 += 12
        if (newPeriod === '오전' && newHour === 12) hour24 = 0

        const timeStr = `${hour24.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`
        onChange(timeStr)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        "w-full flex items-center justify-start text-left font-normal px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer",
                        !value && "text-muted-foreground"
                    )}
                >
                    <Clock className="mr-2 h-4 w-4 opacity-50" />
                    {value ? (
                        <span>
                            {period} {hour}:{minute}
                        </span>
                    ) : (
                        <span>시간 선택</span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[60]" align="start">
                <div className="flex h-[220px] divide-x divide-border">
                    {/* Period (오전/오후) */}
                    <div className="flex flex-col w-[64px] py-2">
                        {periods.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handleTimeChange('period', p)}
                                className={cn(
                                    "flex-1 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-center flex items-center justify-center cursor-pointer transition-colors min-h-[44px]",
                                    p === period && "bg-primary text-white hover:bg-primary hover:text-white font-bold rounded-md"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Hours */}
                    <div ref={hourRef} className="flex flex-col overflow-y-auto w-[64px] no-scrollbar py-2">
                        {hours.map((h) => (
                            <button
                                key={h}
                                type="button"
                                onClick={() => handleTimeChange('hour', h)}
                                className={cn(
                                    "w-full px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-center shrink-0 cursor-pointer transition-colors min-h-[44px]",
                                    h === hour && "bg-primary text-white hover:bg-primary hover:text-white font-bold rounded-md"
                                )}
                            >
                                {h}시
                            </button>
                        ))}
                    </div>

                    {/* Minutes */}
                    <div ref={minuteRef} className="flex flex-col overflow-y-auto w-[64px] no-scrollbar py-2">
                        {minutes.map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => handleTimeChange('minute', m)}
                                className={cn(
                                    "w-full px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-center shrink-0 cursor-pointer transition-colors min-h-[44px]",
                                    m === minute && "bg-primary text-white hover:bg-primary hover:text-white font-bold rounded-md"
                                )}
                            >
                                {m}분
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
