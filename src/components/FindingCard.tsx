import { CheckCircle2, Circle, FileStack, ExternalLink } from "lucide-react";
import type { ReviewFinding } from "../types/review";
import type { KnowledgeBaseItem } from "../types/knowledgeBase";
import { SeverityBadge, CategoryBadge } from "./Badge";

interface Props {
  finding: ReviewFinding;
  knowledgeBase: KnowledgeBaseItem[];
  onToggleResolved?: (id: string) => void;
}

export default function FindingCard({ finding, knowledgeBase, onToggleResolved }: Props) {
  const basisItems = knowledgeBase.filter((kb) => finding.basisIds.includes(kb.id));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={finding.severity} />
        <CategoryBadge category={finding.category} />
        <span className="ml-auto inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 border border-rose-200">
          담당자 확인 필요
        </span>
      </div>

      <h4 className="mt-3 text-sm font-semibold text-navy-800">{finding.title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{finding.description}</p>

      <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2">
        <div>
          <p className="font-medium text-slate-500">관련 문서</p>
          <p className="mt-0.5 text-slate-700">{finding.sourceDocument}</p>
        </div>
        <div>
          <p className="font-medium text-slate-500">권고사항 (초안)</p>
          <p className="mt-0.5 text-slate-700">{finding.recommendation}</p>
        </div>
      </div>

      {basisItems.length > 0 && (
        <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/60 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-teal-700">
            <FileStack className="h-3.5 w-3.5" />
            근거 후보 (담당자 최종 확인 필요)
          </div>
          <ul className="mt-2 space-y-1.5">
            {basisItems.map((kb) => (
              <li key={kb.id} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-medium text-navy-700">{kb.title}</span>
                {kb.relatedClause && kb.relatedClause !== "-" && (
                  <span className="text-slate-500">{kb.relatedClause}</span>
                )}
                {kb.fileUrl && kb.fileUrl !== "#" && (
                  <a
                    href={kb.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-0.5 text-teal-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    첨부파일에서 확인
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onToggleResolved && (
        <button
          type="button"
          onClick={() => onToggleResolved(finding.id)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-700"
        >
          {finding.resolved ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Circle className="h-4 w-4 text-slate-300" />
          )}
          {finding.resolved ? "담당자 확인 완료" : "담당자 확인 완료로 표시"}
        </button>
      )}
    </div>
  );
}
