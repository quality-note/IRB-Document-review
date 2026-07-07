import { FileClock, FileWarning, FileCheck2, FolderOpen, Upload, TrendingUp, History, DatabaseZap } from "lucide-react";
import type { UploadedDocument, ReviewProject } from "../types/review";
import { formatDate, formatDateTime } from "../utils/formatting";

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof FolderOpen;
  accent: string;
}

function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-navy-800">{value.toLocaleString()}건</p>
    </div>
  );
}

export function StatCardsRow({
  total,
  inProgress,
  recommended,
  completed,
}: {
  total: number;
  inProgress: number;
  recommended: number;
  completed: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="전체 검토 건수" value={total} icon={FolderOpen} accent="bg-navy-50 text-navy-600" />
      <StatCard label="검토 중 건수" value={inProgress} icon={FileClock} accent="bg-teal-50 text-teal-600" />
      <StatCard label="보완 권고 건수" value={recommended} icon={FileWarning} accent="bg-amber-50 text-amber-600" />
      <StatCard label="완료 건수" value={completed} icon={FileCheck2} accent="bg-emerald-50 text-emerald-600" />
    </div>
  );
}

export function RecentUploadsCard({ documents }: { documents: UploadedDocument[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Upload className="h-4 w-4 text-navy-500" />
        <h3 className="text-sm font-semibold text-navy-800">최근 업로드 문서</h3>
      </div>
      <ul className="space-y-2">
        {documents.length === 0 && <li className="text-sm text-slate-400">업로드된 문서가 없습니다.</li>}
        {documents.map((d) => (
          <li key={d.id} className="flex items-center justify-between text-sm">
            <span className="truncate text-slate-700">{d.fileName}</span>
            <span className="shrink-0 pl-2 text-xs text-slate-400">{formatDate(d.uploadedAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopFindingsCard({ items }: { items: { title: string; count: number }[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-navy-500" />
        <h3 className="text-sm font-semibold text-navy-800">자주 발생한 보완 항목 TOP 5</h3>
      </div>
      <ol className="space-y-2">
        {items.length === 0 && <li className="text-sm text-slate-400">데이터가 없습니다.</li>}
        {items.map((item, idx) => (
          <li key={item.title} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 truncate text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-50 text-xs font-medium text-navy-600">
                {idx + 1}
              </span>
              <span className="truncate">{item.title}</span>
            </span>
            <span className="shrink-0 pl-2 text-xs text-slate-400">{item.count}건</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RecentHistoryCard({ projects }: { projects: ReviewProject[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-navy-500" />
        <h3 className="text-sm font-semibold text-navy-800">최근 검토 이력</h3>
      </div>
      <ul className="space-y-2">
        {projects.length === 0 && <li className="text-sm text-slate-400">이력이 없습니다.</li>}
        {projects.map((p) => (
          <li key={p.id} className="text-sm">
            <p className="truncate text-slate-700">{p.title}</p>
            <p className="text-xs text-slate-400">
              {p.receiptNo} · {formatDateTime(p.updatedAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KnowledgeBaseUpdateCard({ date, count }: { date: string; count: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <DatabaseZap className="h-4 w-4 text-navy-500" />
        <h3 className="text-sm font-semibold text-navy-800">지식베이스 최신 업데이트</h3>
      </div>
      <p className="text-2xl font-semibold text-navy-800">{formatDate(date)}</p>
      <p className="mt-1 text-xs text-slate-400">활성 근거자료 {count}건 보유</p>
    </div>
  );
}
