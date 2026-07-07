import { useMemo, useState } from "react";
import { Search, X, Paperclip } from "lucide-react";
import { useReviewData } from "../context/ReviewDataContext";
import KnowledgeBaseTable from "../components/KnowledgeBaseTable";
import { Badge } from "../components/Badge";
import { formatDate, formatDateTime } from "../utils/formatting";
import type { KnowledgeBaseItem, KnowledgeBaseType } from "../types/knowledgeBase";

type FilterKey = "전체" | "법령" | "시행규칙" | "식약처 가이드라인" | "기관 SOP" | "과거 심의사례" | "표준 보완문구";

const FILTERS: FilterKey[] = ["전체", "법령", "시행규칙", "식약처 가이드라인", "기관 SOP", "과거 심의사례", "표준 보완문구"];

const FILTER_TYPE_MAP: Record<FilterKey, KnowledgeBaseType[] | null> = {
  전체: null,
  법령: ["생명윤리법", "체외진단의료기기법", "개인정보 보호 관련 자료"],
  시행규칙: ["시행규칙"],
  "식약처 가이드라인": ["식약처 가이드라인"],
  "기관 SOP": ["기관 SOP"],
  "과거 심의사례": ["과거 심의사례"],
  "표준 보완문구": ["표준 보완문구"],
};

export default function KnowledgeBaseSearch() {
  const { knowledgeBase } = useReviewData();
  const [filter, setFilter] = useState<FilterKey>("전체");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<KnowledgeBaseItem | null>(null);

  const results = useMemo(() => {
    const allowedTypes = FILTER_TYPE_MAP[filter];
    const q = query.trim().toLowerCase();
    return knowledgeBase
      .filter((item) => item.active)
      .filter((item) => !allowedTypes || allowedTypes.includes(item.type))
      .filter((item) => {
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q))
        );
      });
  }, [knowledgeBase, filter, query]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-navy-900">근거자료 검색</h1>
        <p className="mt-1 text-sm text-slate-500">법령, 시행규칙, 식약처 가이드라인, 기관 SOP, 과거 심의사례, 표준 보완문구를 검색하세요.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="문서명, 키워드, 요약 내용을 검색하세요"
            className="input pl-9"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <KnowledgeBaseTable items={results} onView={setSelected} />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <Badge>{selected.type}</Badge>
                <h2 className="mt-2 text-lg font-semibold text-navy-900">{selected.title}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Detail label="버전" value={selected.version} />
              <Detail label="시행일" value={formatDate(selected.effectiveDate)} />
              <Detail label="적용 대상" value={selected.applicableScope || "-"} />
              <Detail label="관련 조항 또는 페이지" value={selected.relatedClause || "-"} />
            </dl>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500">관련 키워드</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selected.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    #{k}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500">주요 내용 요약</p>
              <p className="mt-1.5 text-sm text-slate-700">{selected.summary}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500">본문 내용</p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{selected.content}</p>
            </div>

            {selected.staffMemo && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500">담당자 메모</p>
                <p className="mt-1.5 text-sm text-slate-600">{selected.staffMemo}</p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
              {selected.fileUrl && selected.fileUrl !== "#" ? (
                <a
                  href={selected.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-teal-700 hover:underline"
                >
                  <Paperclip className="h-4 w-4" />
                  첨부파일 열기
                </a>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Paperclip className="h-4 w-4" />
                  첨부파일 없음
                </span>
              )}
              <span className="text-xs text-slate-400">최종 수정: {formatDateTime(selected.updatedAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-700">{value}</dd>
    </div>
  );
}
