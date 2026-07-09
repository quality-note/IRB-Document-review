import type { DocumentInconsistency } from "../types/review";

const STATUS_OPTIONS: DocumentInconsistency["confirmationStatus"][] = ["미확인", "확인 중", "확인 완료"];

const STATUS_CLASS: Record<DocumentInconsistency["confirmationStatus"], string> = {
  미확인: "bg-rose-50 text-rose-600 border-rose-200",
  "확인 중": "bg-amber-50 text-amber-700 border-amber-200",
  "확인 완료": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface Props {
  items: DocumentInconsistency[];
  onStatusChange?: (id: string, status: DocumentInconsistency["confirmationStatus"]) => void;
  // 지정 시 담당자 답변을 편집 가능한 입력창으로 표시 (담당자 화면용). 미지정 시 읽기 전용으로 표시 (행정간사 화면용)
  onResponseChange?: (id: string, response: string) => void;
}

export default function InconsistencyTable({ items, onStatusChange, onResponseChange }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1300px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
            <th className="px-4 py-3">검토 항목</th>
            <th className="px-4 py-3">연구계획서 내용</th>
            <th className="px-4 py-3">동의서 내용</th>
            <th className="px-4 py-3">결과보고서 내용</th>
            <th className="px-4 py-3">기타 문서 내용</th>
            <th className="px-4 py-3">검토 결과</th>
            <th className="px-4 py-3">담당자 확인 여부</th>
            <th className="px-4 py-3">연구담당자 답변</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                확인된 문서 간 불일치 항목이 없습니다.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100 align-top last:border-0">
              <td className="px-4 py-3 font-medium text-navy-700">{item.itemName}</td>
              <td className="px-4 py-3 text-slate-600">{item.protocolValue}</td>
              <td className="px-4 py-3 text-slate-600">{item.consentValue}</td>
              <td className="px-4 py-3 text-slate-600">{item.reportValue}</td>
              <td className="px-4 py-3 text-slate-600">{item.otherValue}</td>
              <td className="max-w-[220px] px-4 py-3 text-slate-600">{item.finding}</td>
              <td className="px-4 py-3">
                {onStatusChange ? (
                  <select
                    value={item.confirmationStatus}
                    onChange={(e) =>
                      onStatusChange(item.id, e.target.value as DocumentInconsistency["confirmationStatus"])
                    }
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
              </td>
              <td className="min-w-[200px] px-4 py-3">
                {onResponseChange ? (
                  <textarea
                    value={item.researcherResponse ?? ""}
                    onChange={(e) => onResponseChange(item.id, e.target.value)}
                    rows={2}
                    placeholder="답변을 입력해 주세요."
                    className="w-full resize-none rounded-md border border-slate-300 bg-white p-1.5 text-xs text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                ) : (
                  <p className={`text-xs ${item.researcherResponse ? "text-slate-700" : "text-slate-400"}`}>
                    {item.researcherResponse || "아직 답변이 없습니다."}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
