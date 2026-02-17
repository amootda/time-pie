// Events
export {
  eventKeys,
  useEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from './events'

// Todos
export {
  todoKeys,
  useTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
} from './todos'

// Habits
export {
  habitKeys,
  useHabitsQuery,
  useHabitLogsQuery,
  useCreateHabitMutation,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
  useLogHabitMutation,
} from './habits'

// Executions
export {
  executionKeys,
  useExecutionsQuery,
  useCreateExecutionMutation,
  useStartExecutionMutation,
  useCompleteExecutionMutation,
  useSkipExecutionMutation,
} from './executions'

// Suggestions
export {
  suggestionKeys,
  useSuggestionsQuery,
  useMarkSuggestionReadMutation,
} from './suggestions'
