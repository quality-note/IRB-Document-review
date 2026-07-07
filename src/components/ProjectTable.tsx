import { useNavigate } from "react-router-dom";
import type { ReviewProject } from "../types/review";
import { StatusBadge } from "./Badge";
import { formatDate } from "../utils/formatting";

interface Props {
  projects: ReviewProject[];
  findingCountByProject: Record<string, number>;
}

export default function ProjectTable({ projects, findingCountByProject }: Props) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
            <th className="px-4 py-3">접수번호</th>
            <th className="px-4 py-3">연구명</th>
            <th className="px-4 py-3">연구 유형</th>
            <th className="px-4 py-3">연구책임자</th>
            <th className="px-4 py-3">검토상태</th>
            <th className="px-4 py-3 text-center">주요 확인 필요사항 수</th>
            <th className="px-4 py-3">최종 수정일</th>
            <th className="px-4 py-3">담당자</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                표시할 검토 과제가 없습니다.
              </td>
            </tr>
          )}
          {projects.map((p) => (
            <tr
              key={p.id}
              onClick={() => navigate(`/review-results?projectId=${p.id}`)}
              className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium text-navy-700">{p.receiptNo}</td>
              <td className="max-w-[280px] truncate px-4 py-3 text-slate-700" title={p.title}>
                {p.title}
              </td>
              <td className="max-w-[160px] truncate px-4 py-3 text-slate-500" title={p.studyType.join(", ")}>
                {p.studyType.join(", ")}
              </td>
              <td className="px-4 py-3 text-slate-500">{p.principalInvestigator}</td>
              <td className="px-4 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-4 py-3 text-center text-slate-700">
                {findingCountByProject[p.id] ?? 0}
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(p.updatedAt)}</td>
              <td className="px-4 py-3 text-slate-500">{p.reviewer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
