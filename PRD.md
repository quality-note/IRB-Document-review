# PRD (Product Requirements Document)
## 임상연구 심의문서 검토 지원 시스템

- **작성일**: 2026-07-06 (최초 작성), 이후 반영된 모든 수정사항 포함하여 최종 정리
- **버전**: v1.0 (MVP)
- **관련 문서**: [BRD.md](./BRD.md)

---

## 1. 개요

| 항목 | 내용 |
|---|---|
| 제품명 | 임상연구 심의문서 검토 지원 시스템 |
| 목적 | IRB 행정간사/연구지원팀의 심의서류 사전 검토 업무 보조 |
| 대상 사용자 | 행정간사(백주환, 오은하) — 현재 2계정만 로그인 가능 |
| 판단 주체 | 담당자·심의위원회·기관 (시스템은 최종 판단하지 않음) |
| 기술 스택 | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + react-router-dom(HashRouter) + lucide-react |
| 데이터 저장 | 현재는 React Context 기반 인메모리 상태 + 소스 내 시드 데이터. Supabase 연동 대비 타입/구조 선설계 |
| 배포/실행 | `npm run dev` (개발), `npm run build` (정적 빌드, `dist/`) |

---

## 2. 정보구조 (메뉴 7개)

1. 대시보드 (`/`)
2. 문서 검토 (`/document-review`)
3. 검토 결과 (`/review-results`)
4. 행정의견 초안 (`/opinion-draft`)
5. 근거자료 검색 (`/knowledge-search`)
6. 지식베이스 관리 (`/knowledge-manage`)
7. 설정 (`/settings`)

로그인하지 않은 경우 위 메뉴 대신 로그인 화면만 노출된다.

레이아웃: 좌측 사이드바(고정, 자체 스크롤 없음)와 상단 헤더(고정)는 화면 전환과 무관하게 항상 노출되며, 본문 영역(`main`)만 내부 스크롤된다. 인쇄 시에는 사이드바/헤더가 숨겨지고 본문이 전체 페이지로 자연스럽게 흐른다.

---

## 3. 화면별 상세 기능

### 3.0 로그인 (`Login.tsx`)

- 로그인 전에는 어떤 메뉴도 접근할 수 없다 (App 최상단에서 인증 상태로 게이팅).
- 아이디(이메일)/비밀번호 입력, 실패 시 오류 메시지 표시.
- 로그인 성공 시 `localStorage`에 세션 저장 → 새로고침해도 로그인 유지.
- 등록된 계정 (초기값, `authService.ts`):

  | 이름 | 아이디 | 초기 비밀번호 | 역할 |
  |---|---|---|---|
  | 백주환 | l15057@mf.seegene.com | 1234 | 행정간사 |
  | 오은하 | waoeh@mf.seegene.com | 5678 | 행정간사 |

- 헤더에서 로그아웃, 비밀번호 변경(현재 비밀번호 확인 후 변경, `localStorage`에 재정의값 저장) 가능.
- **한계**: 서버 인증이 아니므로 브라우저 개발자 도구로 소스를 보면 계정 정보가 노출됨. "타 직원의 실수/무단 접근을 막는 1차 확인" 수준의 보안이다.

### 3.1 대시보드 (`Dashboard.tsx`)

- 카드: 전체 검토 건수, 검토 중 건수, 보완 권고 건수, 완료 건수
- 카드: 최근 업로드 문서(최근 5건), 자주 발생한 보완 항목 TOP 5(제목 기준 집계), 최근 검토 이력(최근 5건), 지식베이스 최신 업데이트일 + 활성 자료 수
- 하단 표: 최근 검토 과제 전체 목록 — 접수번호/연구명/연구 유형/연구책임자/검토상태/미해결 확인필요사항 수/최종 수정일/담당자. 행 클릭 시 해당 건의 검토 결과 화면으로 이동.

### 3.2 문서 검토 (`DocumentReview.tsx`)

- **신규 검토 건 등록 폼**: 접수번호, 접수일, 연구명, 연구책임자(이상 필수) / 소속부서, 연구 유형(다중 선택), 검토 담당자, 비고
  - **연구 유형은 다중 선택**(토글 칩 UI, 체크 표시). 최소 1개 이상 선택해야 등록 가능.
  - 연구 유형 목록: 인간대상연구, 인체유래물연구, 잔여검체 사용 연구, 후향적 연구, 전향적 연구, **의무기록 연구**, 체외진단의료기기 임상적 성능시험, 탐색적 임상적 성능시험, 확증적 임상적 성능시험, 기타
  - 검토 담당자 선택 목록 순서: **백주환(기본값), 오은하** (백주환이 주 사용자)
- **검토 건 선택**: 기존 등록된 건을 드롭다운으로 선택해 문서 업로드 대상 지정
- **문서 업로드 패널** (`FileUploadPanel.tsx`): 문서 종류 선택 후 파일 선택(다중 가능), 업로드 목록 표시(실제 첨부파일이 연결된 경우 파일명 클릭 시 새 탭에서 열람), "AI 검토 실행" 버튼(문서 0건이면 비활성화)
- AI 분석 사용 여부가 설정에서 꺼져 있으면 업로드 영역에 안내 문구 표시 및 실행 버튼 비활성화
- 업로드 문서 종류(10종): 연구계획서, 임상적 성능시험계획서, 설명문 및 동의서, 증례기록서, 연구자 이력서, 이해상충서약서, 개인정보 관련 문서, 인체유래물 또는 잔여검체 관련 문서, 결과보고서, 기타 심의서류
- 하단 개인정보 포함 문서 업로드 주의문 및 시스템 면책 안내문(SafetyNotice) 표시

### 3.3 검토 결과 (`ReviewResults.tsx`)

- 상단에 위험도 정의 안내("행정검토 우선순위" 의미, 법적 적합성과 무관함을 명시)
- 프로젝트 정보 카드: 접수번호/연구명/상태/연구책임자/연구 유형(다중, 쉼표 나열)/담당자/접수일
- **재검토 버튼**: 현재 업로드된 문서를 기준으로 AI 사전 검토를 다시 실행하고 **기존 검토 결과(필수항목 누락/불일치 등)를 새 결과로 교체**한다 (누적되지 않음). 지식베이스에서 근거자료를 삭제/수정한 뒤 결과를 최신화할 때 사용. 문서가 없으면 실행 불가 안내. 재검토 시 기존 "담당자 확인 완료"/불일치 확인 상태는 초기화됨(툴팁으로 안내).
- 탭 구성: 요약 / 필수항목 누락 / 문서 간 불일치 / 규정 검토 필요사항 / 개인정보 및 검체 관리 / 연구자 확인 질문 / 담당자 메모
  - 요약: 위험도별 건수, 업로드 문서 목록(실제 첨부파일 링크 포함), 검토 항목 카드 일부 미리보기
  - 필수항목 누락/규정 검토 필요사항/개인정보 및 검체 관리/연구자 확인 질문: 해당 카테고리의 `FindingCard` 목록
  - 문서 간 불일치: `InconsistencyTable` (검토 항목/연구계획서 내용/동의서 내용/결과보고서 내용/기타 문서 내용/검토 결과/담당자 확인 여부 — 확인 여부는 드롭다운으로 직접 변경 가능)
  - 담당자 메모: 메모 작성/목록(내부 참고용, 자동 발송 없음)
- `FindingCard`: 위험도/카테고리 배지, "담당자 확인 필요" 배지(고정), 설명, 관련 문서(실제 업로드된 문서 종류만 표시), 권고사항(초안), **근거 후보 영역**(근거자료명 + 관련 조항/페이지 + 실제 첨부파일이 있으면 "첨부파일에서 확인" 링크), 담당자 확인 완료 토글
- 하단 시스템 면책 안내문 고정 표시

### 3.4 행정의견 초안 (`OpinionDraft.tsx`)

- 문체 4종: 공식적으로 / 부드럽게 / 간단하게 / 상세하게 — 선택 시 자동 재생성
- 초안 구성: 검토 개요 / 주요 보완 권고사항 / 문서 간 불일치 확인 요청사항 / 추가 확인이 필요한 사항(연구자 확인 질문) / 관련 근거 후보(근거자료명 + 관련 조항/페이지) / 회신 요청 문구
- 초안은 `textarea`에서 직접 수정 가능하며 **글꼴은 나눔고딕**(웹폰트, 미설치 환경은 맑은 고딕으로 대체) 적용
- 버튼: 초안 다시 생성, 복사하기(클립보드), 저장하기(이력에 추가), Word 출력(HTML 기반 mock `.doc` 다운로드), PDF 출력(브라우저 인쇄)
- 저장 이력 목록(문체/작성자/일시) 표시
- 연구자에게 자동 발송하지 않는다는 안내 고정 표시, 하단 면책 안내문 고정 표시

### 3.5 근거자료 검색 (`KnowledgeBaseSearch.tsx`)

- 필터: 전체 / 법령(생명윤리법·체외진단의료기기법·개인정보 보호 관련 자료 포함) / 시행규칙 / 식약처 가이드라인 / 기관 SOP / 과거 심의사례 / 표준 보완문구
- 검색창: 문서명/요약/키워드 대상 텍스트 검색
- 결과 표(`KnowledgeBaseTable`): 문서명(단어 단위 줄바꿈) / 자료 유형(뱃지, 키워드 뱃지와 동일 스타일, 한 줄 표기 폭 확보) / 버전(대통령령 표기 기준 폭 고정, 넘치면 줄바꿈) / 시행일·개정일 / 관련 키워드 / 요약 / 보기 버튼
- 상세 모달: 문서명/자료 유형/버전/시행일/적용 대상/키워드/요약/본문/담당자 메모/**첨부파일 열기 링크**(실제 파일 있는 경우) 및 최종 수정일

### 3.6 지식베이스 관리 (`KnowledgeBaseManage.tsx`)

- 등록 폼: 자료명·버전(필수) / 자료 유형 / 시행일 또는 개정일 / 적용 대상 / 관련 키워드(쉼표 구분) / 요약 / 주요 내용 / 첨부파일 / 활성 여부 / 비고
- 자료 유형(9종): 생명윤리법, 체외진단의료기기법, 개인정보 보호 관련 자료, 시행규칙, 식약처 가이드라인, 기관 SOP, 과거 심의사례, 표준 보완문구, 기타
- 자료 유형으로 "과거 심의사례" 선택 시 비식별화 안내문 표시, 항상 개인정보 포함 문서 업로드 주의문 표시
- 등록된 근거자료 목록: 활성/비활성 토글, **수정**(팝업 모달에서 값 수정 후 저장), **삭제**(확인창 후 삭제) 지원
- **삭제 시 유의사항**: 지식베이스 항목을 삭제하면 그 항목을 "근거 후보"로 참조하던 검토 결과에서는 해당 근거 표시만 사라진다. 다만 특정 검토 항목("유사 과거 심의사례 참고 권고")처럼 **특정 자료 유형의 존재 자체가 전제인 항목은, 재검토 시 해당 유형의 활성 자료가 하나도 없으면 항목 자체가 생성되지 않는다** (아래 5장 참고).

### 3.7 설정 (`Settings.tsx`)

- 사용자 권한 관리(4종 설명: 관리자/행정간사/검토자/조회 전용 — 현재는 설명 표시용, 실제 권한 분기 로직 미구현)
- 검토 상태값 관리(6종 설명: 임시저장/검토 중/보완 권고/담당자 확인 중/완료/보류)
- 위험도 기준 설명(높음/중간/낮음/참고 — 행정검토 우선순위임을 명시)
- 출력 양식 설정(mock, 로컬 상태만 변경)
- **AI 분석 사용 여부 설정**: 끄면 문서 검토 화면에서 AI 검토 실행이 제한됨
- 파일 보관기간 설정(mock)
- 개인정보 포함 문서 업로드 주의문 설정(문구 편집 가능, 미리보기 제공)
- 하단 시스템 면책 안내문 고정 표시

---

## 4. 데이터 모델 (`src/types`)

### 4.1 review.ts

```ts
type StudyType = "인간대상연구" | "인체유래물연구" | "잔여검체 사용 연구" | "후향적 연구"
  | "전향적 연구" | "의무기록 연구" | "체외진단의료기기 임상적 성능시험"
  | "탐색적 임상적 성능시험" | "확증적 임상적 성능시험" | "기타";

type ReviewStatus = "임시저장" | "검토 중" | "보완 권고" | "담당자 확인 중" | "완료" | "보류";
type UserRole = "관리자" | "행정간사" | "검토자" | "조회 전용";
type Severity = "높음" | "중간" | "낮음" | "참고";
type DocumentType = "연구계획서" | "임상적 성능시험계획서" | "설명문 및 동의서" | "증례기록서"
  | "연구자 이력서" | "이해상충서약서" | "개인정보 관련 문서"
  | "인체유래물 또는 잔여검체 관련 문서" | "결과보고서" | "기타 심의서류";
type FindingCategory = "필수항목 누락" | "문서 간 불일치" | "규정 검토 필요사항"
  | "개인정보 및 검체 관리" | "연구자 확인 질문";
type OpinionTone = "공식적으로" | "부드럽게" | "간단하게" | "상세하게";

interface ReviewProject {
  id: string; receiptNo: string; title: string; principalInvestigator: string;
  department: string; studyType: StudyType[]; reviewer: string; receivedDate: string;
  status: ReviewStatus; memo: string; createdAt: string; updatedAt: string;
}

interface UploadedDocument {
  id: string; projectId: string; documentType: DocumentType; fileName: string;
  fileUrl: string; uploadedAt: string; extractedText?: string;
}

interface ReviewFinding {
  id: string; projectId: string; category: FindingCategory; severity: Severity;
  title: string; description: string; sourceDocument: string; recommendation: string;
  basisIds: string[]; humanReviewRequired: true; resolved: boolean; createdAt: string;
}

interface DocumentInconsistency {
  id: string; projectId: string; itemName: string; protocolValue: string;
  consentValue: string; reportValue: string; otherValue: string; finding: string;
  confirmationStatus: "미확인" | "확인 중" | "확인 완료";
}

interface OpinionDraft {
  id: string; projectId: string; tone: OpinionTone; content: string;
  createdBy: string; createdAt: string; updatedAt: string;
}

interface StaffMemo {
  id: string; projectId: string; author: string; content: string; createdAt: string;
}
```

> **참고**: `studyType`은 원 설계(단일값)에서 실사용 피드백에 따라 **배열(다중 선택)**로 변경되었다. Supabase 연동 시 다대다 관계 테이블 또는 배열 컬럼(JSON/text[])로 매핑 필요.

### 4.2 knowledgeBase.ts

```ts
type KnowledgeBaseType = "생명윤리법" | "체외진단의료기기법" | "개인정보 보호 관련 자료"
  | "시행규칙" | "식약처 가이드라인" | "기관 SOP" | "과거 심의사례" | "표준 보완문구" | "기타";

interface KnowledgeBaseItem {
  id: string; title: string; type: KnowledgeBaseType; version: string;
  effectiveDate: string; applicableScope?: string; keywords: string[];
  summary: string; content: string; relatedClause?: string; staffMemo?: string;
  fileUrl?: string; active: boolean; remarks?: string; createdAt: string; updatedAt: string;
}
```

### 4.3 authService.ts (인증, Supabase 연동 전 임시 구조)

```ts
interface AuthUser { id: string; name: string; role: UserRole; }
// Credential = AuthUser + password (하드코딩 + localStorage 재정의값)
```

---

## 5. AI 분석(mock) 로직 상세 — `aiReviewService.ts`

`analyzeDocuments(project, documents, knowledgeBase)`는 실제 LLM 호출 없이 규칙 기반으로 결과를 생성한다. 핵심 원칙: **업로드하지 않은 문서, 존재하지 않는 근거자료를 언급하지 않는다.**

### 5.1 조건부 생성 규칙

각 검토 항목 템플릿은 다음 조건 중 해당하는 것을 만족해야 생성된다.

| 조건 필드 | 의미 |
|---|---|
| `anyOf: DocumentType[]` | 업로드된 문서 중 하나 이상 존재해야 적용 |
| `allOf: DocumentType[]` | 업로드된 문서에 모두 존재해야 적용 (문서 간 비교가 필요한 항목에 사용) |
| `requiresKnowledgeBaseType: KnowledgeBaseType` | 지식베이스에 해당 유형의 **활성** 자료가 하나 이상 있어야 적용 (예: 과거 심의사례 참고 항목) |

미지정 시 해당 조건은 무시된다(항상 통과).

### 5.2 현재 등록된 mock 필수항목/규정 검토 템플릿 (6종)

| 카테고리 | 제목 | 위험도 | 적용 조건 | 근거 후보 |
|---|---|---|---|---|
| 필수항목 누락 | 연구대상자 수 산정 근거 미흡 | 높음 | 연구계획서 또는 임상적 성능시험계획서 | kb-3 |
| 문서 간 불일치 | 검체 보관기간이 연구계획서와 동의서에서 서로 다름 | 높음 | (연구계획서 or 임상적 성능시험계획서) AND 설명문 및 동의서 | kb-1, kb-6 |
| 개인정보 및 검체 관리 | 개인정보 보관 및 폐기 방법 구체화 필요 | 중간 | 설명문 및 동의서 또는 개인정보 관련 문서 | kb-2 |
| 개인정보 및 검체 관리 | 잔여검체 사용 범위 확인 필요 | 중간 | 인체유래물 또는 잔여검체 관련 문서 | kb-5 |
| 연구자 확인 질문 | 이해상충 관련 사항 문구 정리 권고 | 낮음 | 이해상충서약서 | kb-4 |
| 규정 검토 필요사항 | 유사 과거 심의사례 참고 권고 | 참고 | 지식베이스에 활성 "과거 심의사례" 자료 존재 | 실제 매칭된 자료(동적) |

> 원 설계에 있던 "결과보고서 제출 예정 시점 확인 필요" 항목은 실사용 피드백에 따라 **완전히 삭제**되었다.

### 5.3 문서 간 불일치(mock) 템플릿 (2종)

| 항목 | 적용 조건 |
|---|---|
| 검체 보관기간 | (연구계획서 or 임상적 성능시험계획서) AND 설명문 및 동의서 |
| 연구대상자 수 | (연구계획서 or 임상적 성능시험계획서) AND 결과보고서 |

### 5.4 재검토(교체) 동작

`ReviewDataContext.runAiReview(projectId)`는 재실행 시 해당 프로젝트의 **기존 `findings`/`inconsistencies`를 모두 제거한 뒤 새 결과로 교체**한다(중복 누적 방지). 이로 인해 기존에 표시했던 "담당자 확인 완료"/불일치 확인 상태는 초기화된다.

### 5.5 근거 표시(`FindingCard`)

각 검토 항목의 "근거 후보" 영역에는 자료명, 관련 조항/페이지(`relatedClause`), 실제 첨부파일이 있는 경우 첨부파일 열람 링크가 표시된다. 모든 근거는 "근거 후보"로만 표기되며 최종 확정은 담당자가 한다.

### 5.6 `generateOpinionDraft(project, findings, inconsistencies, knowledgeBase, tone)`

행정의견 초안 텍스트를 문체별로 생성하며, 근거 후보 목록에도 관련 조항/페이지 정보를 포함한다.

---

## 6. 인증/보안 사양 (`authService.ts`, `AuthContext.tsx`)

- 계정 목록은 코드에 하드코딩(이메일 ID + 초기 비밀번호), 비밀번호 변경 시 `localStorage`에 재정의값을 저장해 하드코딩 값을 덮어씀.
- 로그인 세션은 `localStorage`에 저장되어 새로고침 후에도 유지되며, 로그아웃 시 제거됨.
- **한계(명시적으로 알려야 하는 사항)**: 서버 검증이 없는 프론트엔드 전용 게이트이므로, 개발자 도구로 소스/로컬스토리지를 열람하면 계정 정보 확인이 가능하다. 실제 보안이 필요한 시점에는 Supabase Auth 등 서버 인증으로 교체해야 하며, 그때는 `authService.ts` 내부만 교체하면 되도록 인터페이스가 고정되어 있다.

---

## 7. 파일 첨부/내보내기 사양

### 7.1 첨부파일

- 지식베이스 근거자료 첨부파일: `public/knowledge-base/*.pdf` (총 11종 실제 법령/가이드라인/SOP성 문서 등록됨)
- 프로젝트 업로드 문서 첨부파일(시드 데이터의 경우): `public/project-documents/*.pdf`
- 사용자가 화면에서 직접 업로드하는 파일은 현재 **파일명만 저장**(`fileUrl: "#"`)되며 실제 파일 바이트는 저장되지 않음 — Supabase Storage 등 실제 저장소 연동 전까지의 임시 동작.

### 7.2 내보내기 (`exportService.ts`)

- `exportAsWord()`: HTML을 `.doc` MIME 타입으로 감싸 다운로드 (Word에서 열람 가능한 임시 구현, 실제 `.docx` 생성 라이브러리 아님)
- `exportAsPdf()` / `printCurrentView()`: 브라우저 인쇄 대화상자 호출 (사용자가 "PDF로 저장" 선택)
- `copyTextToClipboard()`: 클립보드 복사

---

## 8. 비기능 요구사항

- **디자인**: 흰색/회색/남색/청록색 중심의 업무용 톤, 표/카드/배지/탭/검색창/필터가 명확히 구분되는 스타일
- **레이아웃**: 사이드바·헤더 고정, 본문만 스크롤. 인쇄 시 사이드바/헤더 숨김 및 본문 자연스러운 흐름 보장
- **표 가독성**: 지식베이스 표는 문서명/버전 등 긴 텍스트가 단어 단위로 줄바꿈(`break-keep`)되도록 처리, 좁은 열의 버튼/배지는 줄바꿈 방지(`whitespace-nowrap`) 처리
- **행정의견 편집 글꼴**: 나눔고딕(웹폰트) 적용
- **반응형**: `sm/md/lg` 브레이크포인트 기준 그리드 재배치 (모바일 전용 최적화는 범위 외)

---

## 9. 알려진 제한사항 (Known Limitations)

- 브라우저 새로고침 시, 세션 중 새로 등록/업로드/변경한 데이터 중 소스 시드로 반영되지 않은 항목은 초기화된다 (백엔드 미연동 상태의 구조적 한계).
- 로그인은 서버 인증이 아니다 (6장 참고).
- AI 분석은 문서 "종류"만 근거로 하며 문서 내용 자체를 읽지 않는다 (실제 LLM 연동 전까지의 의도된 mock 동작).
- 사용자가 화면에서 업로드한 파일은 실제로 저장/열람되지 않는다(파일명만 기록).
- 사용자 권한(관리자/행정간사/검토자/조회 전용)에 따른 기능 제한은 설정 화면에 설명만 있고 실제 접근 제어 로직은 없다.
- Word/PDF 출력은 정식 문서 생성이 아닌 브라우저 인쇄/HTML 기반 mock이다.

---

## 10. 향후 연동 지점 요약

| 영역 | 교체 대상 파일 | 비고 |
|---|---|---|
| 데이터 저장소 | `src/context/ReviewDataContext.tsx` | CRUD 함수 내부만 Supabase 호출로 교체, 타입은 `src/types`와 1:1 대응 설계됨 |
| 인증 | `src/services/authService.ts` | Supabase Auth 등으로 교체 |
| AI 분석 | `src/services/aiReviewService.ts`의 `analyzeDocuments()`, `generateOpinionDraft()` | 입출력 타입 고정, 내부 구현만 교체 |
| 파일 저장소 | 업로드 처리부(`FileUploadPanel`→`addDocument`), 지식베이스 첨부 | Supabase Storage 등으로 교체 |
| 문서 생성 | `src/services/exportService.ts` | 실제 Word/PDF 생성 라이브러리로 교체 |

---

## 11. 부록: 파일 구조

```
src/
  components/  Badge, DashboardCards, FileUploadPanel, FindingCard, InconsistencyTable,
               KnowledgeBaseTable, Layout, OpinionEditor, ProjectTable, ReviewResultTabs,
               SafetyNotice
  context/     AuthContext, ReviewDataContext
  pages/       Login, Dashboard, DocumentReview, ReviewResults, OpinionDraft,
               KnowledgeBaseSearch, KnowledgeBaseManage, Settings
  services/    authService, aiReviewService, exportService, mockData
  types/       review, knowledgeBase
  utils/       formatting, severity
  App.tsx, main.tsx, index.css
public/
  knowledge-base/       실제 근거자료 첨부파일(11종)
  project-documents/    시드 검토 건 첨부파일
```
