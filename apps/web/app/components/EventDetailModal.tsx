'use client'

import { getPurposeInfo, getScheduleTypeInfo } from '@time-pie/core'
import type { Event } from '@time-pie/supabase'
import dayjs from 'dayjs'
import { useState } from 'react'
import { AddModal } from './AddModal'

interface EventDetailModalProps {
  isOpen: boolean
  event: Event | null
  onClose: () => void
  onEdit: () => void
  onDelete: (id: string) => Promise<void> | void
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export function EventDetailModal({ isOpen, event, onClose, onEdit, onDelete }: EventDetailModalProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!event) return null

  const purposeInfo = getPurposeInfo(event.purpose)
  const typeInfo = getScheduleTypeInfo(event.event_type)

  const formattedDate = dayjs(event.start_at).format('YYYY년 M월 D일 (ddd)')
  const formattedStart = dayjs(event.start_at).format('HH:mm')
  const formattedEnd = dayjs(event.end_at).format('HH:mm')

  const repeatDaysLabel = event.repeat_days && event.repeat_days.length > 0
    ? event.repeat_days.map(d => DAY_LABELS[d]).join(', ') + '요일'
    : null

  const handleDelete = async () => {
    if (!event.id || isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete(event.id)
      setDeleteModalOpen(false)
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <AddModal isOpen={isOpen} onClose={onClose} title="일정 상세">
        <div className="space-y-4">

          {/* Title + type badge */}
          <div className="flex items-start gap-3">
            <div
              className="mt-1 w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: event.color || '#4A90D9' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-foreground leading-snug">{event.title}</p>
              {typeInfo && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <span>{typeInfo.emoji}</span>
                  <span>{typeInfo.label}</span>
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Details */}
          <dl className="space-y-3 text-sm">

            {/* Purpose */}
            {purposeInfo && (
              <div className="flex items-center gap-3">
                <dt className="w-16 text-muted-foreground shrink-0">유형</dt>
                <dd className="flex items-center gap-1.5 text-foreground">
                  <span>{purposeInfo.emoji}</span>
                  <span>{purposeInfo.label}</span>
                </dd>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-3">
              <dt className="w-16 text-muted-foreground shrink-0">날짜</dt>
              <dd className="text-foreground">{formattedDate}</dd>
            </div>

            {/* Time */}
            {event.event_type === 'anchor' && event.base_time ? (
              <div className="flex items-center gap-3">
                <dt className="w-16 text-muted-foreground shrink-0">기준 시간</dt>
                <dd className="text-foreground">{event.base_time}</dd>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <dt className="w-16 text-muted-foreground shrink-0">시간</dt>
                <dd className="text-foreground">{formattedStart} ~ {formattedEnd}</dd>
              </div>
            )}

            {/* Repeat days */}
            {repeatDaysLabel && (
              <div className="flex items-center gap-3">
                <dt className="w-16 text-muted-foreground shrink-0">반복</dt>
                <dd className="text-foreground">{repeatDaysLabel}</dd>
              </div>
            )}

            {/* Anchor: buffer */}
            {event.event_type === 'anchor' && event.buffer_min != null && (
              <div className="flex items-center gap-3">
                <dt className="w-16 text-muted-foreground shrink-0">버퍼</dt>
                <dd className="text-foreground">{event.buffer_min}분</dd>
              </div>
            )}

            {/* Reminder */}
            {event.reminder_min != null && (
              <div className="flex items-center gap-3">
                <dt className="w-16 text-muted-foreground shrink-0">알림</dt>
                <dd className="text-foreground">{event.reminder_min}분 전</dd>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="flex items-start gap-3">
                <dt className="w-16 text-muted-foreground shrink-0 mt-0.5">메모</dt>
                <dd className="text-foreground whitespace-pre-wrap wrap-break-word">{event.description}</dd>
              </div>
            )}
          </dl>

          <div className="h-px bg-border/50" />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              수정
            </button>
          </div>
        </div>
      </AddModal>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border/50 p-6 space-y-4 animate-slide-up">
            <p className="text-base font-bold text-foreground">일정 삭제</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{event.title}</span> 일정을 삭제하시겠습니까?<br />
              삭제된 일정은 복구할 수 없습니다.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 disabled:opacity-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
