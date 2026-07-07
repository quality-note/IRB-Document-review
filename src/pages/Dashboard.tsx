import { useMemo } from "react";
import { useReviewData } from "../context/ReviewDataContext";
import {
  StatCardsRow,
  RecentUploadsCard,
  TopFindingsCard,
  RecentHistoryCard,
  KnowledgeBaseUpdateCard,
} from "../components/DashboardCards";
import ProjectTable from "../components/ProjectTable";

export default function Dashboard() {
  const { projects, documents, findings, knowledgeBase } = useReviewData();

  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === "검토 중").length;
    const recommended = projects.filter((p) => p.status === "보완 권고").length;
    const completed = projects.filter((p) => p.status === "완료").length;
    return { total, inProgress, recommended, completed };
  }, [projects]);

  const recentDocuments = useMemo(
    () => [...documents].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 5),
    [documents]
  );

  const topFindings = useMemo(() => {
    const counter = new Map<string, number>();
    findings.forEach((f) => counter.set(f.title, (counter.get(f.title) ?? 0) + 1));
    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));
  }, [findings]);

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [projects]
  );

  const kbLatestDate = useMemo(() => {
    if (knowledgeBase.length === 0) return "";
    return knowledgeBase.reduce((latest, item) => (item.updatedAt > latest ? item.updatedAt : latest), knowledgeBase[0].updatedAt);
  }, [knowledgeBase]);

  const activeKbCount = knowledgeBase.filter((k) => k.active).length;

  const findingCountByProject = useMemo(() => {
    const map: Record<string, number> = {};
    findings.forEach((f) => {
      if (!f.resolved) map[f.projectId] = (map[f.projectId] ?? 0) + 1;
    });
    return map;
  }, [findings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900">대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">
          IRB 심의문서 사전 검토 현황을 한눈에 확인하고, 검토가 필요한 과제를 관리하세요.
        </p>
      </div>

      <StatCardsRow {...stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <RecentUploadsCard documents={recentDocuments} />
        <TopFindingsCard items={topFindings} />
        <RecentHistoryCard projects={recentProjects} />
        <KnowledgeBaseUpdateCard date={kbLatestDate} count={activeKbCount} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-navy-800">최근 검토 과제</h2>
        <ProjectTable projects={[...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))} findingCountByProject={findingCountByProject} />
      </div>
    </div>
  );
}
