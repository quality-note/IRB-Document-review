import type { ReactNode } from "react";
import type { ReviewStatus, Severity, FindingCategory } from "../types/review";
import { STATUS_BADGE_CLASS, SEVERITY_BADGE_CLASS, CATEGORY_BADGE_CLASS, SEVERITY_DOT_CLASS } from "../utils/severity";

export function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${SEVERITY_BADGE_CLASS[severity]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT_CLASS[severity]}`} />
      {severity}
    </span>
  );
}

export function CategoryBadge({ category }: { category: FindingCategory }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_BADGE_CLASS[category]}`}>
      {category}
    </span>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ${className}`}>
      {children}
    </span>
  );
}
