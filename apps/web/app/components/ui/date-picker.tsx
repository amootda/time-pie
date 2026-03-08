"use client"

import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { Calendar } from "./calendar"
import { cn, Popover, PopoverContent, PopoverTrigger } from "./popover"

interface DatePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    placeholder?: string
}

export function DatePicker({ date, setDate, placeholder = "날짜 선택" }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "w-full flex items-center justify-center text-center px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer text-sm font-medium",
                        !date && "text-muted-foreground font-normal"
                    )}
                >
                    {date ? format(date, "M월 d일 (EEEE)", { locale: ko }) : <span>{placeholder}</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[60]" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    )
}
