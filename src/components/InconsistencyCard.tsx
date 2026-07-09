import { MessageSquare } from "lucide-react";
import type { DocumentInconsistency } from "../types/review";

const STATUS_OPTIONS: DocumentInconsistency["confirmationStatus"][] = ["미확인", "확인 중", "확인 완료"];

const STATUS_CLASS: Record<DocumentInconsistency["confirmationStatus"], string> = {
  미확인: "bg-rose-50 text-rose-600 border-rose-200",
  "확인 중": "bg-amber-50 text-amber-700 border-amber-200",
  "확인 완료": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface Props {
  item: DocumentInconsistency;
  onStatusChange?: (id: string, status: DocumentInconsistency["confirmationStatus"]) => void;
  onResponseChange?: (id: string, response: string) => void;
}

export default function InconsistencyCard({ item, onStatusChange, onResponseChange }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          문서 간 불일치
        </span>
        {onStatusChange ? (
          <select
            value={item.confirmationStatus}
            onChange={(e) => onStatusChange(item.id, e.target.value as DocumentInconsistency["confirmationStatus"])}
            className={`rounded-full border px-2 py-1 text-xs font-medium focus:outline-none ${STATUS_CLASS[item.confirmationStatus]}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <span className={`rounded-full border px-2 py-1 text-xs font-medium ${STATUS_CLASS[item.confirmationStatus]}`}>
            {item.confirmationStatus}
          </span>
        )}
        <span className="ml-auto inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 border border-rose-200">
          담당자 확인 필요
        </span>
      </div>

      <h4 className="mt-3 text-sm font-semibold text-navy-800">{item.itemName}</h4>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-4">
        <div>
          <p className="font-medium text-slate-500">연구계획서</p>
          <p className="mt-0.5 text-slate-700">{item.protocolValue}</p>
        </div>
        <div>
          <p className="font-medium text-slate-500">동의서</p>
          <p className="mt-0.5 text-slate-700">{item.consentValue}</p>
        </div>
        <div>
          <p className="font-medium text-slate-500">결과보고서</p>
          <p className="mt-0.5 text-slate-700">{item.reportValue}</p>
        </div>
        <div>
          <p className="font-medium text-slate-500">기타 문서</p>
          <p className="mt-0.5 text-slate-700">{item.otherValue}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.finding}</p>

      <div className="mt-3 rounded-lg border border-navy-100 bg-navy-50/50 p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-navy-700">
          <MessageSquare className="h-3.5 w-3.5" />
          연구담당자 답변
        </div>
        {onResponseChange ? (
          <textarea
            value={item.researcherResponse ?? ""}
            onChange={(e) => onResponseChange(item.id, e.target.value)}
            rows={3}
            placeholder="확인 및 조치 내용을 입력해 주세요."
            className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        ) : (
          <p className={`mt-1.5 text-xs ${item.researcherResponse ? "text-slate-700" : "text-slate-400"}`}>
            {item.researcherResponse || "아직 담당자 답변이 없습니다."}
          </p>
        )}
      </div>
    </div>
  );
}
