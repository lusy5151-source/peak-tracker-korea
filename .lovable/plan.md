

## 정상 인증 플로우 버그 수정 계획

### 문제
`summits` 테이블에 해당 산의 정상(봉우리) 데이터가 없으면 "등록된 정상이 없습니다"라는 메시지만 표시되고 다음 단계로 진행 불가.

### 수정 내용

**두 곳을 수정합니다:**

#### 1. `src/pages/SummitClaimPage.tsx` — select-summit 단계 (라인 527-531)
- `summits.length === 0`일 때 빈 화면 대신, 산 자체를 폴백 정상 항목으로 표시
- 폴백 Summit 객체 생성: `{ id: "fallback-{mountainId}", mountain_id, summit_name: "{산이름} 정상", latitude: mountain.lat, longitude: mountain.lng, elevation: mountain.height }`
- `summits`와 폴백을 합친 `displaySummits` 변수를 만들어 렌더링에 사용
- `selectedSummit` 조회 시에도 `displaySummits`에서 찾도록 수정

#### 2. `src/components/SummitClaimSection.tsx` — 라인 126
- `if (summits.length === 0) return null;` → 동일한 폴백 로직 적용
- 산 이름과 좌표를 props로 이미 받고 있으므로 (`mountainId`, `mountainName`) 바로 폴백 생성 가능

#### 3. `src/hooks/useSummits.ts` — `claimSummit` 함수
- 폴백 summit ID(`fallback-*`)로 인증 시, `summits` 배열에서 찾지 못하는 문제 방지
- 폴백인 경우에도 정상적으로 DB에 저장되도록 처리

### 기술 상세
- 폴백 summit은 DB의 `summits` 테이블에 실제로 존재하지 않으므로, `summit_claims` 테이블에 insert할 때 `summit_id`에 `fallback-{mountainId}` 문자열이 들어감 (uuid가 아님)
- `summit_claims.summit_id`는 uuid 타입이므로, 폴백용 고정 uuid를 생성하는 방식으로 처리 (예: `00000000-0000-0000-0000-{mountainId 패딩}`)
- 또는 더 안전하게: 폴백 선택 시 `summits` 테이블에 자동으로 해당 산의 기본 정상을 insert하는 방식도 고려 가능하나, summits 테이블은 INSERT RLS가 없어 불가

**최종 접근**: `claimSummit` 함수에서 summit을 직접 찾는 대신 호출 시 필요한 데이터(latitude, longitude, mountain_id)를 직접 전달하도록 수정. 폴백 summit ID는 deterministic UUID로 생성.

