'use client'

import {
    toDateString,
    useCreateTodoMutation,
    useDeleteTodoMutation,
    useTodoStore,
    useTodosQuery,
    useToggleTodoMutation,
    useUpdateTodoMutation,
} from '@time-pie/core'
import type { Todo, TodoInsert } from '@time-pie/supabase'
import { AlertCircle, Calendar, Check, Inbox, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useState } from 'react'
import { BottomNav, FloatingAddButton, Header } from '../components'
import { useAuth } from '../providers'

const TodoModal = dynamic(
  () => import('../components/TodoModal').then((m) => ({ default: m.TodoModal })),
  { loading: () => null }
)

const PRIORITY_COLORS = {
  high: 'bg-error/10 text-error ring-1 ring-error/20',
  medium: 'bg-warning/10 text-warning ring-1 ring-warning/20',
  low: 'bg-muted text-muted-foreground ring-1 ring-border',
}

const PRIORITY_LABELS = {
  high: '높음',
  medium: '중간',
  low: '낮음',
}

type FilterType = 'all' | 'today' | 'completed' | 'pending'

export default function TodosPage() {
  const { user } = useAuth()
  // ✅ Zustand Selector: 필요한 값만 개별 구독
  const storeTodos = useTodoStore((s) => s.todos)
  const filter = useTodoStore((s) => s.filter)
  const setFilter = useTodoStore((s) => s.setFilter)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  // React Query hooks
  const { data: todosData } = useTodosQuery(user?.id)
  const createTodoMutation = useCreateTodoMutation()
  const updateTodoMutation = useUpdateTodoMutation()
  const toggleTodoMutation = useToggleTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()

  const todayStr = toDateString()

  // Use API data if available (even if empty array), otherwise fallback to store
  const todos = todosData ?? storeTodos

  // Filter todos based on selected filter
  const displayTodos = useMemo(() => {
    switch (filter) {
      case 'today':
        return todos.filter((t) => t.due_date === todayStr)
      case 'completed':
        return todos.filter((t) => t.is_completed)
      case 'pending':
        return todos.filter((t) => !t.is_completed)
      default:
        return todos
    }
  }, [todos, filter, todayStr])

  const handleAddTodo = useCallback(
    async (todo: Omit<TodoInsert, 'user_id'>) => {
      if (!user) return
      try {
        await createTodoMutation.mutateAsync({ ...todo, user_id: user.id })
        setModalOpen(false)
      } catch (error) {
        console.error('Failed to create todo:', error)
      }
    },
    [user, createTodoMutation]
  )

  const handleEditTodo = useCallback(
    async (todo: Omit<TodoInsert, 'user_id'>) => {
      if (!editingTodo) return
      try {
        await updateTodoMutation.mutateAsync({ id: editingTodo.id, updates: todo })
        setModalOpen(false)
        setEditingTodo(null)
      } catch (error) {
        console.error('Failed to update todo:', error)
      }
    },
    [editingTodo, updateTodoMutation]
  )

  const openEditModal = useCallback((todo: Todo) => {
    setEditingTodo(todo)
    setModalOpen(true)
  }, [])

  const filters: { label: string; value: FilterType }[] = [
    { label: '오늘', value: 'today' },
    { label: '미완료', value: 'pending' },
    { label: '완료', value: 'completed' },
    { label: '전체', value: 'all' }
  ]

  const stats = useMemo(
    () => ({
      total: todos.length,
      completed: todos.filter((t) => t.is_completed).length,
      today: todos.filter((t) => t.due_date === todayStr).length,
    }),
    [todos, todayStr]
  )

  // Pre-sort display todos to avoid sorting in render
  const sortedDisplayTodos = useMemo(
    () =>
      [...displayTodos].sort((a, b) => {
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1
        }
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }),
    [displayTodos]
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="투두" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card p-4 rounded-2xl border border-border shadow-sm text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">전체</p>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border shadow-sm text-center">
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
            <p className="text-xs text-muted-foreground mt-1">완료</p>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border shadow-sm text-center">
            <p className="text-2xl font-bold text-primary">{stats.today}</p>
            <p className="text-xs text-muted-foreground mt-1">오늘</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${filter === f.value
                ? 'bg-foreground text-background shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {displayTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">할 일이 없습니다</p>
              <p className="text-sm text-muted-foreground mb-6">새로운 할 일을 추가해보세요!</p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary-600 transition-colors active:scale-95"
              >
                할 일 추가하기
              </button>
            </div>
          ) : (
            sortedDisplayTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group bg-card p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 ${todo.is_completed ? 'opacity-60 bg-muted/30' : ''
                    }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodoMutation.mutate({ id: todo.id, currentIsCompleted: todo.is_completed })}
                      aria-label={todo.is_completed ? '완료 취소' : '완료로 표시'}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${todo.is_completed
                        ? 'bg-success border-success scale-100'
                        : 'border-muted-foreground/30 hover:border-success/50 hover:bg-success/5'
                        }`}
                    >
                      <Check className={`w-3.5 h-3.5 text-white transition-opacity duration-200 ${todo.is_completed ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                    </button>

                    {/* Content - Clickable for edit */}
                    <button
                      onClick={() => openEditModal(todo)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLORS[todo.priority]
                            }`}
                        >
                          {PRIORITY_LABELS[todo.priority]}
                        </span>
                        {todo.due_date && (
                          <div className={`flex items-center gap-1 text-xs font-medium ${todo.due_date < todayStr ? 'text-error' :
                            todo.due_date === todayStr ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                            {todo.due_date === todayStr ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                            <span>{todo.due_date === todayStr ? '오늘 마감' : todo.due_date}</span>
                          </div>
                        )}
                      </div>
                      <p
                        className={`font-medium text-[15px] leading-snug transition-colors ${todo.is_completed
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                          }`}
                      >
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className={`text-sm mt-1 transition-colors ${todo.is_completed ? 'text-muted-foreground/50' : 'text-muted-foreground'
                          }`}>
                          {todo.description}
                        </p>
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('정말 삭제하시겠습니까?')) {
                          deleteTodoMutation.mutate(todo.id)
                        }
                      }}
                      aria-label={`${todo.title} 삭제`}
                      className="p-2 -mr-2 text-muted-foreground/50 hover:text-error hover:bg-error/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </main>

      <FloatingAddButton onAddTodo={() => setModalOpen(true)} />
      <BottomNav />

      <TodoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTodo(null)
        }}
        onSave={editingTodo ? handleEditTodo : handleAddTodo}
        initialData={editingTodo || undefined}
        mode={editingTodo ? 'edit' : 'create'}
      />
    </div>
  )
}

