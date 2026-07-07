import type { Severity, ReviewStatus, FindingCategory } from "../types/review";

// 위험도는 "행정검토 우선순위"를 뜻하며, 연구의 법적 적합성이나 승인 가능성을 의미하지 않는다.
export const SEVERITY_DESCRIPTIONS: Record<Severity, string> = {
  높음: "심의 진행 전 담당자 확인 및 보완 검토 필요",
  중간: "심의위원 검토 전 확인 권고",
  낮음: "문구 정리 또는 행정 보완 권고",
  참고: "관련 근거 또는 과거 사례 확인용",
};

export const SEVERITY_BADGE_CLASS: Record<Severity, string> = {
  높음: "bg-rose-50 text-rose-700 border border-rose-200",
  중간: "bg-amber-50 text-amber-700 border border-amber-200",
  낮음: "bg-sky-50 text-sky-700 border border-sky-200",
  참고: "bg-slate-100 text-slate-600 border border-slate-200",
};

export const SEVERITY_DOT_CLASS: Record<Severity, string> = {
  높음: "bg-rose-500",
  중간: "bg-amber-500",
  낮음: "bg-sky-500",
  참고: "bg-slate-400",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  높음: 0,
  중간: 1,
  낮음: 2,
  참고: 3,
};

export const STATUS_BADGE_CLASS: Record<ReviewStatus, string> = {
  임시저장: "bg-slate-100 text-slate-600 border border-slate-200",
  "검토 중": "bg-teal-50 text-teal-700 border border-teal-200",
  "보완 권고": "bg-amber-50 text-amber-700 border border-amber-200",
  "담당자 확인 중": "bg-navy-50 text-navy-700 border border-navy-200",
  완료: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  보류: "bg-rose-50 text-rose-600 border border-rose-200",
};

export const CATEGORY_BADGE_CLASS: Record<FindingCategory, string> = {
  "필수항목 누락": "bg-navy-50 text-navy-700 border border-navy-200",
  "문서 간 불일치": "bg-amber-50 text-amber-700 border border-amber-200",
  "규정 검토 필요사항": "bg-teal-50 text-teal-700 border border-teal-200",
  "개인정보 및 검체 관리": "bg-rose-50 text-rose-700 border border-rose-200",
  "연구자 확인 질문": "bg-slate-100 text-slate-600 border border-slate-200",
};

export function sortBySeverity<T extends { severity: Severity }>(items: T[]): T[] {
  return [...items].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
