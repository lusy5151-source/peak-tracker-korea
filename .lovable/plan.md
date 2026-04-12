

## 등산 계획 날짜 선택 버그 수정

### 문제
`CreatePlanPage.tsx` 라인 197에서 `disabled={(d) => d < new Date()}`로 되어 있어, `new Date()`가 현재 시각을 포함하므로 오늘 날짜가 비활성화됨.

### 수정

**파일: `src/pages/CreatePlanPage.tsx` (라인 197)**

변경 전:
```ts
disabled={(d) => d < new Date()}
```

변경 후:
```ts
disabled={(d) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}}
```

오늘 날짜의 시작(00:00:00)과 비교하여 오늘은 선택 가능하고 어제 이전만 비활성화됩니다. 한 줄 수정입니다.

