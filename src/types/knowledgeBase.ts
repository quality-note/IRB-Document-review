// 근거자료(지식베이스) 타입 정의

export type KnowledgeBaseType =
  | "생명윤리법"
  | "체외진단의료기기법"
  | "개인정보 보호 관련 자료"
  | "시행규칙"
  | "식약처 가이드라인"
  | "기관 SOP"
  | "과거 심의사례"
  | "표준 보완문구"
  | "기타";

export const KNOWLEDGE_BASE_TYPES: KnowledgeBaseType[] = [
  "생명윤리법",
  "체외진단의료기기법",
  "개인정보 보호 관련 자료",
  "시행규칙",
  "식약처 가이드라인",
  "기관 SOP",
  "과거 심의사례",
  "표준 보완문구",
  "기타",
];

// 검색 화면 필터용 ("전체" 포함)
export type KnowledgeBaseFilter = "전체" | KnowledgeBaseType;

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  type: KnowledgeBaseType;
  version: string;
  effectiveDate: string; // ISO date string
  applicableScope?: string;
  keywords: string[];
  summary: string;
  content: string;
  relatedClause?: string;
  staffMemo?: string;
  fileUrl?: string;
  active: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}
