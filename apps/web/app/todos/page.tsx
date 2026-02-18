'use client'

import { useState, useMemo } from 'react'
import {
  useTodoStore,
  useTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useToggleTodoMutation,
  useDeleteTodoMutation,
  toDateString,
} from '@time-pie/core'
import { Header, BottomNav, FloatingAddButton, TodoModal } from '../components'
import { useAuth } from '../providers'
import type { Todo, TodoInsert } from '@time-pie/supabase'

const PRIORITY_COLORS = {
  high: 'bg-error',
  medium: 'bg-warning',
  low: 'bg-gray-400',
}

const PRIORITY_LABELS = {
  high: '높음',
  medium: '중간',
  low: '낮음',
}

type FilterType = 'all' | 'today' | 'completed' | 'pending'

export default function TodosPage() {
  const { user } = useAuth()
  const { todos: storeTodos, filter, setFilter } = useTodoStore()
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

  const handleAddTodo = async (todo: Omit<TodoInsert, 'user_id'>) => {
    if (!user) return
    try {
      await createTodoMutation.mutateAsync({ ...todo, user_id: user.id })
      setModalOpen(false)
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  const handleEditTodo = async (todo: Omit<TodoInsert, 'user_id'>) => {
    if (!editingTodo) return
    try {
      await updateTodoMutation.mutateAsync({ id: editingTodo.id, updates: todo })
      setModalOpen(false)
      setEditingTodo(null)
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo)
    setModalOpen(true)
  }

  const filters: { label: string; value: FilterType }[] = [
    { label: '전체', value: 'all' },
    { label: '오늘', value: 'today' },
    { label: '완료', value: 'completed' },
    { label: '미완료', value: 'pending' },
  ]

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.is_completed).length,
    today: todos.filter((t) => t.due_date === todayStr).length,
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pb-20">
      <Header title="투두" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-xl text-center shadow-sm">
            <p className="text-2xl font-bold text-secondary">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">전체</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-xl text-center shadow-sm">
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
            <p className="text-xs text-gray-500">완료</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-xl text-center shadow-sm">
            <p className="text-2xl font-bold text-primary">{stats.today}</p>
            <p className="text-xs text-gray-500">오늘</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.value
                ? 'bg-secondary text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {displayTodos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-gray-500 dark:text-gray-400">할 일이 없습니다</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium"
              >
                할 일 추가
              </button>
            </div>
          ) : (
            displayTodos
              .sort((a, b) => {
                // Primary: incomplete todos first (false before true)
                if (a.is_completed !== b.is_completed) {
                  return a.is_completed ? 1 : -1
                }
                // Secondary: priority (high → medium → low)
                const priorityOrder = { high: 0, medium: 1, low: 2 }
                return priorityOrder[a.priority] - priorityOrder[b.priority]
              })
              .map((todo) => (
                <div
                  key={todo.id}
                  className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm transition-opacity ${todo.is_completed ? 'opacity-60' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodoMutation.mutate(todo.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${todo.is_completed
                        ? 'bg-success border-success'
                        : 'border-gray-300 hover:border-success'
                        }`}
                    >
                      {todo.is_completed && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Content - Clickable for edit */}
                    <button
                      onClick={() => openEditModal(todo)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs text-white ${PRIORITY_COLORS[todo.priority]
                            }`}
                        >
                          {PRIORITY_LABELS[todo.priority]}
                        </span>
                        {todo.due_date && (
                          <span className={`text-xs ${todo.due_date < todayStr ? 'text-error' :
                            todo.due_date === todayStr ? 'text-primary' : 'text-gray-500'
                            }`}>
                            {todo.due_date === todayStr ? '오늘' : todo.due_date}
                          </span>
                        )}
                      </div>
                      <p
                        className={`font-medium dark:text-white ${todo.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                          }`}
                      >
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{todo.description}</p>
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteTodoMutation.mutate(todo.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
