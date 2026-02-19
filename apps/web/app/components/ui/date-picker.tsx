"use client"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

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
                        "w-full flex items-center justify-start text-left font-normal px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ko }) : <span>{placeholder}</span>}
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
