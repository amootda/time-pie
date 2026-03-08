"use client"

import * as React from "react"
import { cn } from "./utils"

interface TimePickerProps {
    value: string // HH:mm (24h)
    onChange: (value: string) => void
    disabled?: boolean
    minTime?: string // HH:mm — 이 시간 이하는 선택 불가
}

// 30분 단위 슬롯 00:00 ~ 23:30
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0')
    const m = i % 2 === 0 ? '00' : '30'
    return `${h}:${m}`
})

function formatDisplay(timeStr: string): string {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${period} ${displayHour}:${m.toString().padStart(2, '0')}`
}

export function TimePicker({ value, onChange, disabled, minTime }: TimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [inputText, setInputText] = React.useState(formatDisplay(value))
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)

    // 같은 페이지에 여러 TimePicker가 있을 때 aria-controls 연결을 위한 고유 ID
    const listboxId = React.useId()

    const inputRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLDivElement>(null)
    const highlightedRef = React.useRef<HTMLButtonElement>(null)
    const selectedRef = React.useRef<HTMLButtonElement>(null)

    // value prop 외부 변경 시 동기화 (입력 중에는 덮어쓰지 않음)
    React.useEffect(() => {
        if (document.activeElement !== inputRef.current) {
            setInputText(formatDisplay(value))
        }
    }, [value])

    // minTime을 총 분으로 환산
    const parsedMin = React.useMemo(() => {
        if (!minTime) return null
        const [h, m] = minTime.split(':').map(Number)
        return h * 60 + m
    }, [minTime])

    const isSlotDisabled = (slot: string): boolean => {
        if (parsedMin === null) return false
        const [h, m] = slot.split(':').map(Number)
        return h * 60 + m <= parsedMin
    }

    // readOnly 모드: 타이핑 불가이므로 필터링 없이 전체 슬롯 표시
    const filteredSlots = TIME_SLOTS

    // 드롭다운 열릴 때 선택된 슬롯으로 스크롤
    React.useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => {
                selectedRef.current?.scrollIntoView({ block: 'center' })
            })
        }
    }, [isOpen])

    // 키보드 이동 시 하이라이트된 항목 스크롤
    React.useEffect(() => {
        highlightedRef.current?.scrollIntoView({ block: 'nearest' })
    }, [highlightedIndex])

    // readOnly이므로 파싱 없이 드롭다운만 닫음
    const commitInput = React.useCallback(() => {
        setIsOpen(false)
        setHighlightedIndex(-1)
    }, [])

    const selectSlot = (slot: string) => {
        onChange(slot)
        setInputText(formatDisplay(slot))
        setIsOpen(false)
        setHighlightedIndex(-1)
    }

    const handleFocus = () => {
        setIsOpen(true)
        inputRef.current?.select() // Google Calendar처럼 포커스 시 전체 선택
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                if (!isOpen) setIsOpen(true)
                setHighlightedIndex(prev => {
                    let next = prev + 1
                    // disabled 슬롯은 건너뜀
                    while (next < filteredSlots.length && isSlotDisabled(filteredSlots[next])) next++
                    return next < filteredSlots.length ? next : prev
                })
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(prev => {
                    let next = prev - 1
                    // disabled 슬롯은 건너뜀
                    while (next >= 0 && isSlotDisabled(filteredSlots[next])) next--
                    return next >= 0 ? next : prev
                })
                break
            case 'Enter':
                e.preventDefault()
                if (highlightedIndex >= 0 && filteredSlots[highlightedIndex]) {
                    // disabled 슬롯은 Enter로도 선택 불가 (클릭 동작과 동일)
                    if (!isSlotDisabled(filteredSlots[highlightedIndex])) {
                        selectSlot(filteredSlots[highlightedIndex])
                    } else {
                        commitInput()
                    }
                } else {
                    commitInput()
                }
                break
            case 'Escape':
                setInputText(formatDisplay(value))
                setIsOpen(false)
                setHighlightedIndex(-1)
                inputRef.current?.blur()
                break
            case 'Tab':
                commitInput()
                break
        }
    }

    return (
        <div className="relative w-full">
            {/* 트리거: 텍스트 입력 필드 */}
            <div className={cn(
                "w-full flex items-center justify-center px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-colors text-sm cursor-pointer",
                disabled && "opacity-50 pointer-events-none"
            )}
            onClick={() => {
                if (!disabled && !isOpen) {
                    setIsOpen(true);
                    inputRef.current?.focus();
                }
            }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    disabled={disabled}
                    onFocus={handleFocus}
                    onBlur={commitInput}
                    readOnly={true} // 사용자가 직접 타이핑할 수 없도록 수정
                    onKeyDown={handleKeyDown}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={listboxId}
                    className="w-full bg-transparent outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400 cursor-pointer text-center"
                    placeholder="시간 선택"
                    autoComplete="off"
                />
            </div>

            {/* 드롭다운 슬롯 리스트 */}
            {isOpen && (
                <div
                    id={listboxId}
                    role="listbox"
                    ref={listRef}
                    onMouseDown={e => e.preventDefault()} // 슬롯 클릭 시 input blur 방지
                    className="absolute top-full left-0 mt-1 w-36 max-h-56 overflow-y-auto z-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-1"
                >
                    {filteredSlots.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-400 text-center">결과 없음</p>
                    ) : (
                        filteredSlots.map((slot, idx) => {
                            const isSelected = value === slot
                            const isDisabled = isSlotDisabled(slot)
                            const isHighlighted = idx === highlightedIndex
                            return (
                                <button
                                    key={slot}
                                    // 하이라이트 우선, 없으면 선택된 항목에 ref
                                    ref={isHighlighted ? highlightedRef : isSelected ? selectedRef : undefined}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => !isDisabled && selectSlot(slot)}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={isDisabled}
                                    className={cn(
                                        "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors",
                                        isHighlighted
                                            ? "bg-primary text-white font-medium"
                                            : isSelected
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700",
                                        isDisabled && "opacity-40 cursor-not-allowed pointer-events-none"
                                    )}
                                >
                                    {formatDisplay(slot)}
                                </button>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}
