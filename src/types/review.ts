// 임상연구 심의문서 검토 지원 시스템 - 핵심 타입 정의
// 추후 Supabase 테이블 스키마와 1:1 대응 가능하도록 설계

export type StudyType =
  | "인간대상연구"
  | "인체유래물연구"
  | "잔여검체 사용 연구"
  | "후향적 연구"
  | "전향적 연구"
  | "의무기록 연구"
  | "체외진단의료기기 임상적 성능시험"
  | "탐색적 임상적 성능시험"
  | "확증적 임상적 성능시험"
  | "기타";

export const STUDY_TYPES: StudyType[] = [
  "인간대상연구",
  "인체유래물연구",
  "잔여검체 사용 연구",
  "후향적 연구",
  "전향적 연구",
  "의무기록 연구",
  "체외진단의료기기 임상적 성능시험",
  "탐색적 임상적 성능시험",
  "확증적 임상적 성능시험",
  "기타",
];

export type ReviewStatus =
  | "임시저장"
  | "검토 중"
  | "보완 권고"
  | "담당자 확인 중"
  | "완료"
  | "보류";

export const REVIEW_STATUSES: ReviewStatus[] = [
  "임시저장",
  "검토 중",
  "보완 권고",
  "담당자 확인 중",
  "완료",
  "보류",
];

export type UserRole = "관리자" | "행정간사" | "검토자" | "조회 전용" | "연구담당자";

export const USER_ROLES: UserRole[] = ["관리자", "행정간사", "검토자", "조회 전용", "연구담당자"];

// 위험도는 행정검토 우선순위 구분이며, 연구의 법적 적합성·승인 가능성 판단이 아님
export type Severity = "높음" | "중간" | "낮음" | "참고";

export const SEVERITIES: Severity[] = ["높음", "중간", "낮음", "참고"];

export type DocumentType =
  | "연구계획서"
  | "임상적 성능시험계획서"
  | "설명문 및 동의서"
  | "증례기록서"
  | "연구자 이력서"
  | "이해상충서약서"
  | "개인정보 관련 문서"
  | "인체유래물 또는 잔여검체 관련 문서"
  | "결과보고서"
  | "기타 심의서류";

export const DOCUMENT_TYPES: DocumentType[] = [
  "연구계획서",
  "임상적 성능시험계획서",
  "설명문 및 동의서",
  "증례기록서",
  "연구자 이력서",
  "이해상충서약서",
  "개인정보 관련 문서",
  "인체유래물 또는 잔여검체 관련 문서",
  "결과보고서",
  "기타 심의서류",
];

export type FindingCategory =
  | "필수항목 누락"
  | "문서 간 불일치"
  | "규정 검토 필요사항"
  | "개인정보 및 검체 관리"
  | "연구자 확인 질문";

export const FINDING_CATEGORIES: FindingCategory[] = [
  "필수항목 누락",
  "문서 간 불일치",
  "규정 검토 필요사항",
  "개인정보 및 검체 관리",
  "연구자 확인 질문",
];

export type OpinionTone = "공식적으로" | "부드럽게" | "간단하게" | "상세하게";

export const OPINION_TONES: OpinionTone[] = ["공식적으로", "부드럽게", "간단하게", "상세하게"];

export interface ReviewProject {
  id: string;
  receiptNo: string;
  title: string;
  principalInvestigator: string;
  department: string;
  studyType: StudyType[];
  reviewer: string;
  receivedDate: string; // ISO date string
  status: ReviewStatus;
  memo: string;
  // 이 연구과제를 확인·답변할 수 있는 연구담당자 계정 (AuthUser.id). 미지정 시 담당자 화면에 노출되지 않음
  researcherId?: string;
  // 담당자가 답변/수정자료를 제출한 시각. 제출 후 행정간사가 확인하여 최종 접수(완료) 처리
  researcherSubmittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedDocument {
  id: string;
  projectId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  extractedText?: string;
  // 업로드한 사람 이름 (행정간사 또는 연구담당자) — 최종 접수 시 어느 자료가 담당자 제출본인지 구분하기 위함
  uploadedBy?: string;
}

export interface ReviewFinding {
  id: string;
  projectId: string;
  category: FindingCategory;
  severity: Severity;
  title: string;
  description: string;
  sourceDocument: string;
  recommendation: string;
  basisIds: string[]; // KnowledgeBaseItem id 참조 (근거 후보)
  humanReviewRequired: true;
  resolved: boolean;
  createdAt: string;
  // 연구담당자가 남긴 답변 (행정간사 화면에는 읽기 전용으로 표시됨)
  researcherResponse?: string;
  researcherRespondedAt?: string;
}

export interface DocumentInconsistency {
  id: string;
  projectId: string;
  itemName: string;
  protocolValue: string;
  consentValue: string;
  reportValue: string;
  otherValue: string;
  finding: string;
  confirmationStatus: "미확인" | "확인 중" | "확인 완료";
  createdAt: string;
  researcherResponse?: string;
  researcherRespondedAt?: string;
}

export interface OpinionDraft {
  id: string;
  projectId: string;
  tone: OpinionTone;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMemo {
  id: string;
  projectId: string;
  author: string;
  content: string;
  createdAt: string;
}
