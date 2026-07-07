import { Eye, Pencil, Trash2 } from "lucide-react";
import type { KnowledgeBaseItem } from "../types/knowledgeBase";
import { formatDate } from "../utils/formatting";

interface Props {
  items: KnowledgeBaseItem[];
  onView?: (item: KnowledgeBaseItem) => void;
  onEdit?: (item: KnowledgeBaseItem) => void;
  onDelete?: (item: KnowledgeBaseItem) => void;
  onToggleActive?: (item: KnowledgeBaseItem) => void;
  showActiveToggle?: boolean;
}

export default function KnowledgeBaseTable({ items, onView, onEdit, onDelete, onToggleActive, showActiveToggle }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1000px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
            <th className="whitespace-nowrap px-4 py-3">문서명</th>
            <th className="w-[130px] whitespace-nowrap px-4 py-3">자료 유형</th>
            <th className="w-[150px] px-4 py-3">버전</th>
            <th className="whitespace-nowrap px-4 py-3">시행일/개정일</th>
            <th className="whitespace-nowrap px-4 py-3">관련 키워드</th>
            <th className="whitespace-nowrap px-4 py-3">요약</th>
            {showActiveToggle && <th className="whitespace-nowrap px-4 py-3 text-center">상태</th>}
            <th className="whitespace-nowrap px-4 py-3 text-center">비고</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={showActiveToggle ? 8 : 7} className="px-4 py-8 text-center text-slate-400">
                검색 결과가 없습니다.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100 align-top last:border-0 hover:bg-slate-50">
              <td className="w-[260px] break-keep px-4 py-3 font-medium text-navy-700">{item.title}</td>
              <td className="w-[130px] whitespace-nowrap px-4 py-3">
                <span className="inline-block whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-center text-xs text-slate-500">
                  {item.type}
                </span>
              </td>
              <td className="w-[150px] break-keep px-4 py-3 text-slate-500">{item.version}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(item.effectiveDate)}</td>
              <td className="max-w-[200px] px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.keywords.map((k) => (
                    <span key={k} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      #{k}
                    </span>
                  ))}
                </div>
              </td>
              <td className="max-w-[226px] px-4 py-3 text-slate-600">{item.summary}</td>
              {showActiveToggle && (
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleActive?.(item)}
                    className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
                      item.active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.active ? "활성" : "비활성"}
                  </button>
                </td>
              )}
              <td className="whitespace-nowrap px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  {onView && (
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      보기
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      수정
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="flex items-center gap-1 whitespace-nowrap rounded-md border border-rose-200 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
