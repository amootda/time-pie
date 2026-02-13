# PR Review Notes

PR #3 (`refactor` -> `main`) CodeRabbit 리뷰에서 나온 지적 사항 정리.

## 1. docs/PRD.md - 마크다운 테이블 포맷 (Minor)

- **위치**: 섹션 3.1~3.8 테이블 (line 44-98)
- **내용**: 테이블 위아래에 빈 줄이 없어 markdownlint MD058 경고 발생
- **수정 방법**: 각 테이블 전후에 빈 줄 추가

```diff
 ### 3.1 일정 타입 분류
+
 | 항목 | 설명 |
 |------|------|
 | ... |
+
```

## 2. packages/core/src/hooks/useUserData.ts - 로딩 상태 누락 (Minor)

- **위치**: `refreshData` 함수 (line 139-156)
- **내용**: `setExecutionLoading`, `setSuggestionLoading`이 의존성 배열에는 있지만 실제 호출되지 않음. execution/suggestion 로드 중 로딩 표시 없고 에러 시 피드백도 없음.
- **수정 방법**: try/finally 블록에 로딩 상태 관리 추가

```diff
  try {
      setEventLoading(true)
      setTodoLoading(true)
      setHabitLoading(true)
+     setExecutionLoading(true)
+     setSuggestionLoading(true)
      // ...
  } finally {
      setEventLoading(false)
      setTodoLoading(false)
      setHabitLoading(false)
+     setExecutionLoading(false)
+     setSuggestionLoading(false)
  }
```

## 3. apps/web/app/components/EventModal.tsx - 에러 상태 초기화 누락

- **위치**: useEffect (모달 open 시)
- **내용**: 모달이 열릴 때 이전 저장 에러(`saveError`)가 초기화되지 않아 이전 에러 메시지가 남아있을 수 있음
- **수정 방법**: `isOpen` true일 때 `setSaveError(null)` 호출 추가
