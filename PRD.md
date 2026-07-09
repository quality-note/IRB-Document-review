# PRD (Product Requirements Document)
## 임상연구 심의문서 검토 지원 시스템

- **작성일**: 2026-07-06 (최초 작성) → 2026-07-08 (역할 분리·담당자 워크플로우·통합 피드 반영 갱신)
- **버전**: v2.0
- **관련 문서**: [BRD.md](./BRD.md)

---

## 1. 개요

| 항목 | 내용 |
|---|---|
| 제품명 | 임상연구 심의문서 검토 지원 시스템 |
| 목적 | IRB 행정간사의 심의서류 사전 검토 업무 보조 + 연구담당자와의 확인·회신·자료제출 과정을 시스템 내부로 흡수 |
| 대상 사용자 | **행정간사**(백주환, 오은하 — 고정 계정) / **연구담당자**(행정간사가 연구과제별로 발급하는 계정) |
| 판단 주체 | 담당자·심의위원회·기관 (시스템은 최종 판단하지 않음) |
| 기술 스택 | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + react-router-dom(HashRouter) + lucide-react |
| 데이터 저장 | React Context 기반 인메모리 상태 + 소스 내 시드 데이터 + 계정/비밀번호는 `localStorage`. Supabase 연동 대비 타입/구조 선설계 |
| 배포/실행 | `npm run dev` (개발), `npm run build` (정적 빌드, `dist/`), Vercel 배포(`irb-document-review.vercel.app`) |

---

## 2. 역할별 화면 구조

로그인한 계정의 역할(`UserRole`)에 따라 완전히 다른 화면이 렌더링된다 (`App.tsx`에서 분기).

### 2.1 행정간사 등 (관리자/행정간사/검토자/조회 전용) → 기존 7메뉴 화면

1. 대시보드 (`/`)
2. 문서 검토 (`/document-review`)
3. 검토 결과 (`/review-results`)
4. 행정의견 초안 (`/opinion-draft`)
5. 근거자료 검색 (`/knowledge-search`)
6. 지식베이스 관리 (`/knowledge-manage`)
7. 설정 (`/settings`)

레이아웃: 좌측 사이드바(고정)와 상단 헤더(고정)는 화면 전환과 무관하게 항상 노출되며, 본문 영역만 내부 스크롤된다.

### 2.2 연구담당자 → 전용 단독 화면 (`ResearcherPortal.tsx`)

- 메뉴/사이드바 없음. 상단에 시스템명 + 로그인한 담당자 이름 + 로그아웃만 있는 간단한 헤더.
- 본인에게 배정된 연구과제만 조회 가능 (`getProjectsByResearcher`로 필터링). 배정된 과제가 여러 개면 선택 드롭다운이 뜬다.
- 연구과제 상태에 따라 표시가 달라짐:
  - `임시저장`/`검토 중`/`보완 권고`(아직 전달 전): "행정간사의 사전 검토가 진행 중입니다" 안내만 표시, 확인 필요사항 비노출
  - `담당자 확인 중`(전달됨): 확인 필요사항·문서 간 불일치 목록(답변 입력 가능) + 수정자료 업로드 + "답변 및 자료 제출" 버튼
  - `완료`/`보류`: 읽기 전용으로 그동안의 답변 내용 확인 가능

로그인 화면(`Login.tsx`)은 두 역할이 공통으로 사용하며, 아이디/비밀번호로 로그인 후 역할에 따라 자동으로 다른 화면으로 진입한다.

---

## 3. 화면별 상세 기능

### 3.0 로그인 (`Login.tsx`)

- 로그인 전에는 어떤 화면도 접근할 수 없다.
- 아이디/비밀번호 입력, 실패 시 오류 메시지 표시. 로그인 성공 시 `localStorage`에 세션 저장 → 새로고침해도 유지.
- 행정간사 고정 계정 (`authService.ts`):

  | 이름 | 아이디 | 초기 비밀번호 | 역할 |
  |---|---|---|---|
  | 백주환 | l15057@mf.seegene.com | 1234 | 행정간사 |
  | 오은하 | waoeh@mf.seegene.com | 5678 | 행정간사 |

- 연구담당자 계정은 고정되어 있지 않고, 행정간사가 화면에서 발급한 만큼 동적으로 존재한다 (`localStorage`에 축적).
- 헤더에서 로그아웃, 비밀번호 변경 가능 (행정간사·연구담당자 공통).
- **한계**: 서버 인증이 아니므로 브라우저 개발자 도구로 소스/저장소를 보면 계정 정보가 노출됨. "타 직원·타 연구자의 실수/무단 접근을 막는 1차 확인" 수준의 보안이다.

### 3.1 대시보드 (`Dashboard.tsx`) — 행정간사 전용

- 카드: 전체 검토 건수, 검토 중 건수, 보완 권고 건수, 완료 건수
- 카드: 최근 업로드 문서, 자주 발생한 보완 항목 TOP 5, 최근 검토 이력, 지식베이스 최신 업데이트일 + 활성 자료 수
- 하단 표: 최근 검토 과제 전체 목록 — 접수번호/연구명/연구 유형/연구책임자/검토상태/미해결 확인필요사항 수/최종 수정일/담당자. 행 클릭 시 검토 결과 화면으로 이동.

### 3.2 문서 검토 (`DocumentReview.tsx`) — 행정간사 전용

- **신규 검토 건 등록 폼**: 접수번호, 접수일, 연구명, 연구책임자(이상 필수) / 소속부서, 연구 유형(다중 선택, 최소 1개 필수) / 검토 담당자(행정간사, 백주환 기본값) / 비고
  - 연구 유형 목록(10종): 인간대상연구, 인체유래물연구, 잔여검체 사용 연구, 후향적 연구, 전향적 연구, 의무기록 연구, 체외진단의료기기 임상적 성능시험, 탐색적 임상적 성능시험, 확증적 임상적 성능시험, 기타
- **연구담당자 계정 지정 (필수, `ResearcherAssignPanel.tsx`)**: "기존 계정 선택"(이미 발급된 연구담당자 중 재사용) 또는 "신규 계정 발급"(이름/로그인ID/초기비밀번호 입력) 중 선택. 지정 없이는 등록 불가.
- **검토 건 선택**: 기존 등록된 건을 드롭다운으로 선택해 문서 업로드 대상 지정. 선택 시 연구책임자/연구 유형/담당자/상태/연구담당자 계정 정보 표시.
- **문서 업로드 패널** (`FileUploadPanel.tsx`): 문서 종류 선택 후 파일 선택(다중), 업로드 목록(실제 첨부파일 있으면 클릭 시 열람), "AI 검토 실행" 버튼(문서 0건이면 비활성화). 업로드 시 `uploadedBy: "행정간사"`로 기록.
- 하단 개인정보 포함 문서 업로드 주의문 및 시스템 면책 안내문 표시.

### 3.3 검토 결과 (`ReviewResults.tsx`) — 행정간사 전용, v2.0에서 전면 개편

**개편 이유**: 기존에는 요약/필수항목 누락/문서 간 불일치/규정 검토 필요사항/개인정보 및 검체 관리/연구자 확인 질문/담당자 메모의 7개 탭으로 나뉘어 있었으나, 사용성 피드백에 따라 **탭 구분을 완전히 제거**하고 하나의 화면에서 모두 보고 등록할 수 있도록 변경했다.

- 상단: 위험도 정의 안내, 프로젝트 정보(접수번호/연구명/상태/연구책임자/연구 유형/담당자/접수일), 업로드 문서 목록(업로더 표시)
- **연구담당자 계정 지정/변경** (`ResearcherAssignPanel.tsx`): 미지정 상태면 "지정", 지정된 상태면 "변경" 버튼으로 인라인에서 즉시 배정 가능
- **재검토 버튼**: 업로드된 문서를 기준으로 AI 사전 검토를 다시 실행. 실행 시 **AI가 생성한 기존 findings/inconsistencies만 교체**되고, 수기로 등록한 항목은 유지된다. 담당자 확인 완료/불일치 확인 상태는 초기화됨(툴팁 안내).
- **담당자에게 전달 버튼**: 연구담당자 계정이 지정되어 있고 확인 필요사항이 1건 이상 있을 때 노출. 누르면 상태가 `담당자 확인 중`으로 바뀌고, 그 순간부터 연구담당자가 로그인해 확인할 수 있게 됨.
- **최종 접수 버튼**: 상태가 `담당자 확인 중`일 때 노출. 담당자가 제출(`researcherSubmittedAt` 존재)했을 때만 활성화. 누르면 상태가 `완료`로 바뀜.
- **통합 검토 항목 피드**: `ReviewFinding` + `DocumentInconsistency` + `StaffMemo`를 하나의 배열로 합쳐 **위험도 순(높음→중간→낮음→참고, 문서 간 불일치는 항상 "높음", 메모는 최하위)으로 정렬**한 뒤 한 화면에 이어서 표시한다. 카테고리별 화면 분리는 없다.
  - `ReviewFinding` → `FindingCard`로 렌더링 (위험도/카테고리 배지, 설명, 관련 문서, 권고사항, 근거 후보 + 첨부파일 링크, 연구담당자 답변 읽기 전용 표시, 담당자 확인 완료 토글)
  - `DocumentInconsistency` → `InconsistencyCard`로 렌더링 (연구계획서/동의서/결과보고서/기타 문서 값 비교 그리드, 검토 결과, 확인 상태 변경 드롭다운, 연구담당자 답변 읽기 전용 표시)
  - `StaffMemo` → 단순 카드 (작성자/일시/내용)
- **검토 항목 수기 추가 (`AddReviewItemForm.tsx`)**: 화면 어디서든 이 폼 하나로 "확인 필요사항"(분류·위험도·제목·설명·관련 문서·권고사항·근거 후보 선택), "문서 간 불일치"(항목명·문서별 값·검토 결과), "담당자 메모"(내용) 세 가지 유형 중 골라 바로 등록할 수 있다. 등록된 항목은 AI 생성 항목과 동일하게 통합 피드에 합류한다.
- 하단 시스템 면책 안내문 고정 표시.

### 3.4 행정의견 초안 (`OpinionDraft.tsx`) — 행정간사 전용

- 문체 4종: 공식적으로 / 부드럽게 / 간단하게 / 상세하게 — 선택 시 자동 재생성
- 초안 구성: 검토 개요 / 주요 보완 권고사항 / 문서 간 불일치 확인 요청사항 / 추가 확인이 필요한 사항(연구자 확인 질문) / 관련 근거 후보 / 회신 요청 문구
- `textarea`에서 직접 수정 가능, **글꼴은 나눔고딕**
- 버튼: 초안 다시 생성, 복사하기, 저장하기(이력에 추가), Word 출력(mock `.doc`), PDF 출력(브라우저 인쇄)
- 이 화면은 여전히 "출력해서 회신 문구를 참고"하는 용도이며, v2.0의 담당자 워크플로우(3.3, 3.6)와는 별개로 유지된다 — 실제 회신 확인/자료 제출은 이제 담당자 워크플로우로 처리되고, 이 초안은 필요 시 보조적으로 활용한다.

### 3.5 근거자료 검색 (`KnowledgeBaseSearch.tsx`) — 행정간사 전용

- 필터: 전체 / 법령 / 시행규칙 / 식약처 가이드라인 / 기관 SOP / 과거 심의사례 / 표준 보완문구
- 검색창: 문서명/요약/키워드 텍스트 검색
- 결과 표 + 상세 모달(첨부파일 열기 링크 포함)

### 3.6 지식베이스 관리 (`KnowledgeBaseManage.tsx`) — 행정간사 전용

- 등록 폼: 자료명·버전(필수) / 자료 유형(9종) / 시행일 또는 개정일 / 적용 대상 / 관련 키워드 / 요약 / 주요 내용 / 첨부파일 / 활성 여부 / 비고
- "과거 심의사례" 선택 시 비식별화 안내문, 항상 업로드 주의문 표시
- 목록: 활성/비활성 토글, 수정(모달), 삭제(확인 후)
- **삭제 영향**: 특정 자료 유형의 존재 자체가 전제인 검토 항목("유사 과거 심의사례 참고 권고")은 재검토 시 해당 유형의 활성 자료가 없으면 생성되지 않는다.

### 3.7 설정 (`Settings.tsx`) — 행정간사 전용

- 사용자 권한 관리(**5종** 설명: 관리자/행정간사/검토자/조회 전용/**연구담당자** — 표시용, 실제 권한 분기는 로그인 역할 기반 라우팅으로만 구현됨)
- 검토 상태값 관리(6종: 임시저장/검토 중/보완 권고/담당자 확인 중/완료/보류 — **담당자 확인 중 = 연구담당자에게 전달되어 답변 대기 중인 상태**)
- 위험도 기준 설명, 출력 양식 설정(mock), AI 분석 사용 여부 설정, 파일 보관기간 설정(mock), 개인정보 업로드 주의문 설정
- 하단 시스템 면책 안내문 고정 표시

---

## 4. 담당자 워크플로우 (v2.0 핵심 추가 기능)

### 4.1 상태 전이

```
임시저장 → 검토 중 → 보완 권고 → [담당자에게 전달] → 담당자 확인 중 → [담당자 제출] → (제출 완료 표시) → [최종 접수] → 완료
```

- `담당자에게 전달`, `최종 접수`는 **행정간사만** 수행하는 명시적 버튼 클릭이다. 자동 발송/자동 접수는 없다.
- `담당자 제출`은 **연구담당자만** 수행하며, `ReviewProject.researcherSubmittedAt`에 타임스탬프가 기록된다. 상태 자체는 바뀌지 않고(계속 `담당자 확인 중`), 제출 여부만 플래그로 남아 행정간사가 확인할 신호가 된다.
- 재검토를 실행해도 상태 전이 로직에는 영향 없음 (AI 생성 항목만 교체).

### 4.2 계정-과제 배정 모델

- `ReviewProject.researcherId`가 연구과제와 연구담당자 계정(`AuthUser.id`)을 1:1로 연결한다. (연구담당자 1명이 여러 과제의 `researcherId`로 재사용될 수 있음 → N:1)
- 계정 발급/재사용은 `AuthContext.createUser()` / `listResearchers()` / `findUserById()`를 통해 이루어지며, 실제 입력 UI는 `ResearcherAssignPanel.tsx` 하나로 통일되어 **문서 검토 화면(등록 시, 항상 펼쳐진 상태)**과 **검토 결과 화면(등록 후 지정/변경, 접었다 펼치는 상태)** 양쪽에서 재사용된다.

### 4.3 답변/제출 데이터

- `ReviewFinding`과 `DocumentInconsistency` 모두 `researcherResponse` / `researcherRespondedAt` 필드를 가진다. 연구담당자 화면에서는 입력창(textarea)으로, 행정간사 화면(`FindingCard`/`InconsistencyCard`)에서는 읽기 전용 텍스트로 렌더링된다 — **같은 컴포넌트가 `onResponseChange` prop 유무로 편집/읽기 모드를 전환**한다.
- 연구담당자가 업로드하는 수정자료는 기존 `addDocument()`에 `uploadedBy` 인자를 추가해 구분한다 (`"행정간사"` 또는 담당자 이름). 행정간사 화면의 업로드 문서 목록에 업로더가 배지로 표시된다.

---

## 5. 데이터 모델 (`src/types`) — v2.0 변경분 포함

### 5.1 review.ts

```ts
type UserRole = "관리자" | "행정간사" | "검토자" | "조회 전용" | "연구담당자"; // v2.0: 연구담당자 추가

interface ReviewProject {
  id: string; receiptNo: string; title: string; principalInvestigator: string;
  department: string; studyType: StudyType[]; reviewer: string; receivedDate: string;
  status: ReviewStatus; memo: string;
  researcherId?: string;            // v2.0: 배정된 연구담당자 계정 id
  researcherSubmittedAt?: string;   // v2.0: 담당자 제출 시각
  createdAt: string; updatedAt: string;
}

interface UploadedDocument {
  id: string; projectId: string; documentType: DocumentType; fileName: string;
  fileUrl: string; uploadedAt: string; extractedText?: string;
  uploadedBy?: string; // v2.0: 업로더 구분 ("행정간사" 또는 담당자 이름)
}

interface ReviewFinding {
  id: string; projectId: string; category: FindingCategory; severity: Severity;
  title: string; description: string; sourceDocument: string; recommendation: string;
  basisIds: string[]; humanReviewRequired: true; resolved: boolean; createdAt: string;
  researcherResponse?: string;      // v2.0
  researcherRespondedAt?: string;   // v2.0
}

interface DocumentInconsistency {
  id: string; projectId: string; itemName: string; protocolValue: string;
  consentValue: string; reportValue: string; otherValue: string; finding: string;
  confirmationStatus: "미확인" | "확인 중" | "확인 완료";
  createdAt: string;                 // v2.0: 통합 피드 정렬용으로 추가
  researcherResponse?: string;       // v2.0
  researcherRespondedAt?: string;    // v2.0
}
```

> `studyType`은 배열(다중 선택)이다. Supabase 연동 시 다대다 관계 테이블 또는 배열 컬럼(JSON/text[])으로 매핑 필요.

### 5.2 knowledgeBase.ts — 변경 없음 (v1.0과 동일)

### 5.3 authService.ts (v2.0에서 확장)

```ts
interface AuthUser { id: string; name: string; role: UserRole; }
// Credential = AuthUser + password

// 행정간사 2계정은 하드코딩, 연구담당자 계정은 아래 함수로 동적 발급되어 localStorage에 누적됨
function createUser(id, password, name, role): AuthUser;   // v2.0
function findUserById(id): AuthUser | null;                  // v2.0
function listUsersByRole(role): AuthUser[];                  // v2.0
```

---

## 6. AI 분석(mock) 로직 + 수기 등록 — `aiReviewService.ts` / `ReviewDataContext.tsx`

`analyzeDocuments(project, documents, knowledgeBase)`는 실제 LLM 호출 없이 규칙 기반으로 결과를 생성한다. 핵심 원칙: **업로드하지 않은 문서, 존재하지 않는 근거자료를 언급하지 않는다.**

### 6.1 조건부 생성 규칙 (변경 없음)

| 조건 필드 | 의미 |
|---|---|
| `anyOf: DocumentType[]` | 업로드된 문서 중 하나 이상 존재해야 적용 |
| `allOf: DocumentType[]` | 업로드된 문서에 모두 존재해야 적용 |
| `requiresKnowledgeBaseType: KnowledgeBaseType` | 지식베이스에 해당 유형의 활성 자료가 있어야 적용 |

### 6.2 mock 템플릿 (6종 확인사항 + 2종 불일치) — v1.0과 동일, 상세는 이전 버전 참고

### 6.3 재검토(교체) 동작

`runAiReview(projectId)`는 재실행 시 해당 프로젝트의 **AI가 생성한 기존 findings/inconsistencies만 새 결과로 교체**한다. (v2.0에서 명확화: 수기로 등록한 항목은 AI 생성분과 구분되어 관리되지 않으므로, 실제로는 재검토 시 프로젝트의 findings/inconsistencies 전체가 교체된다 — **수기 등록 항목도 재검토를 실행하면 함께 사라지므로, 재검토는 신중히 사용해야 한다.** 이 동작은 UI 상 재검토 버튼 툴팁으로 안내된다.)

### 6.4 수기 등록 (`addManualFinding` / `addManualInconsistency`, v2.0 신규)

- 행정간사가 `AddReviewItemForm.tsx`에서 유형(확인 필요사항/문서 간 불일치/담당자 메모)을 고르고 직접 입력한 항목을 AI 생성 항목과 동일한 배열(`findings`/`inconsistencies`)에 추가한다.
- 근거 후보(`basisIds`)는 활성 지식베이스 항목 중에서 선택적으로 태그할 수 있다.
- 수기 항목도 연구담당자 워크플로우(전달/답변/제출/최종 접수)에 동일하게 포함된다.

---

## 7. 인증/보안 사양 (`authService.ts`, `AuthContext.tsx`) — v2.0 확장

- 행정간사 2계정은 하드코딩, 연구담당자 계정은 `createUser()`로 동적 발급되어 `localStorage`에 누적 저장됨.
- 동일 로그인 ID로 재차 "신규 계정 발급"을 시도하면 이름/역할만 갱신되고 기존 비밀번호는 유지된다 (계정 재사용 시나리오 대응).
- 로그인 세션은 `localStorage`에 저장되어 새로고침 후에도 유지되며, 로그아웃 시 제거됨.
- **한계**: 서버 검증이 없는 프론트엔드 전용 게이트. 개발자 도구로 소스/로컬스토리지를 열람하면 행정간사·연구담당자 계정 정보 모두 확인 가능. 실제 보안이 필요한 시점에는 Supabase Auth 등 서버 인증으로 교체(`authService.ts` 내부만 교체).
- **기기 간 데이터 미공유**: 연구담당자 계정과 그 계정이 볼 데이터는 발급한 브라우저의 `localStorage`에만 존재한다. 행정간사가 계정을 발급한 기기와 연구담당자가 로그인하는 기기가 다르면(보통 그렇다), 같은 배포 URL이라도 각자 브라우저 저장소가 달라 데이터가 보이지 않을 수 있다 — **이는 Supabase 등 실제 백엔드 연동 전까지의 구조적 한계이며, 현재 배포본에서 여러 사용자가 실제로 데이터를 공유하려면 백엔드 연동이 선행되어야 한다.**

---

## 8. 파일 첨부/내보내기 사양 (v1.0과 동일)

### 8.1 첨부파일

- 지식베이스 근거자료: `public/knowledge-base/*.pdf` (11종)
- 프로젝트 시드 문서: `public/project-documents/*.pdf`
- 화면에서 직접 업로드하는 파일은 파일명만 저장(`fileUrl: "#"`), 실제 바이트는 저장되지 않음 (연구담당자가 올리는 수정자료도 동일).

### 8.2 내보내기 (`exportService.ts`)

- `exportAsWord()`: HTML 기반 mock `.doc` 다운로드
- `exportAsPdf()` / `printCurrentView()`: 브라우저 인쇄
- `copyTextToClipboard()`: 클립보드 복사

---

## 9. 비기능 요구사항

- **디자인**: 흰색/회색/남색/청록색 중심의 업무용 톤
- **레이아웃**: 행정간사 화면은 사이드바·헤더 고정 + 본문 스크롤. 연구담당자 화면은 메뉴 없는 단독 페이지.
- **표/카드 가독성**: 지식베이스 표는 단어 단위 줄바꿈(`break-keep`), 좁은 열은 줄바꿈 방지(`whitespace-nowrap`)
- **행정의견 편집 글꼴**: 나눔고딕
- **반응형**: `sm/md/lg` 브레이크포인트 기준 그리드 재배치

---

## 10. 알려진 제한사항 (Known Limitations)

- 브라우저 새로고침 시, 세션 중 입력한 데이터 중 소스 시드로 반영되지 않은 항목은 초기화된다.
- 로그인은 서버 인증이 아니며, **행정간사 기기와 연구담당자 기기 간 데이터가 공유되지 않는다** (7장 참고) — 실사용 배포 시 가장 먼저 인지해야 할 제한사항.
- AI 분석은 문서 "종류"만 근거로 하며 문서 내용 자체를 읽지 않는다.
- 재검토를 실행하면 수기로 등록한 항목도 함께 삭제된다 (6.3 참고).
- 사용자가 화면에서 업로드한 파일은 실제로 저장/열람되지 않는다.
- 사용자 권한 5종에 따른 실제 기능 제한은 "행정간사 vs 연구담당자" 화면 분기 정도만 구현되어 있고, 관리자/검토자/조회 전용 간의 세부 권한 차이는 아직 없다.
- Word/PDF 출력은 정식 문서 생성이 아닌 브라우저 인쇄/HTML 기반 mock이다.
- 연구담당자에게 "전달되었다"는 사실이 자동으로 통지되지 않는다 (담당자가 스스로 로그인해서 확인해야 함).

---

## 11. 향후 연동 지점 요약

| 영역 | 교체 대상 파일 | 비고 |
|---|---|---|
| 데이터 저장소 | `src/context/ReviewDataContext.tsx` | CRUD 함수 내부만 Supabase 호출로 교체 — **행정간사·연구담당자 간 데이터 공유 문제의 근본 해결책** |
| 인증 | `src/services/authService.ts` | Supabase Auth 등으로 교체 |
| AI 분석 | `src/services/aiReviewService.ts`의 `analyzeDocuments()`, `generateOpinionDraft()` | 입출력 타입 고정, 내부 구현만 교체 |
| 파일 저장소 | 업로드 처리부(`FileUploadPanel`→`addDocument`), 지식베이스 첨부 | Supabase Storage 등으로 교체 |
| 알림 | 신규: "담당자에게 전달" 시점 | 이메일/문자 발송 연동 지점 |
| 문서 생성 | `src/services/exportService.ts` | 실제 Word/PDF 생성 라이브러리로 교체 |

---

## 12. 부록: 파일 구조 (v2.0 기준)

```
src/
  components/  AddReviewItemForm, Badge, DashboardCards, FileUploadPanel, FindingCard,
               InconsistencyCard, InconsistencyTable, KnowledgeBaseTable, Layout,
               OpinionEditor, ProjectTable, ResearcherAssignPanel, SafetyNotice
  context/     AuthContext, ReviewDataContext
  pages/       Login, Dashboard, DocumentReview, ReviewResults, OpinionDraft,
               KnowledgeBaseSearch, KnowledgeBaseManage, Settings, ResearcherPortal
  services/    authService, aiReviewService, exportService, mockData
  types/       review, knowledgeBase
  utils/       formatting, severity
  App.tsx, main.tsx, index.css
public/
  knowledge-base/       실제 근거자료 첨부파일(11종)
  project-documents/    시드 검토 건 첨부파일
```

**v1.0 → v2.0 파일 변경 요약**
- 신규: `AddReviewItemForm.tsx`, `InconsistencyCard.tsx`, `ResearcherAssignPanel.tsx`, `pages/ResearcherPortal.tsx`
- 삭제: `ReviewResultTabs.tsx`(탭 구조 제거), `AddFindingForm.tsx`/`AddInconsistencyForm.tsx`(→ `AddReviewItemForm.tsx`로 통합)
- 확장: `authService.ts`/`AuthContext.tsx`(동적 계정 발급), `ReviewDataContext.tsx`(담당자 워크플로우 함수 다수 추가), `types/review.ts`(역할·필드 추가)
