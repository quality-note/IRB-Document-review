import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { useReviewData } from "../context/ReviewDataContext";
import ReviewResultTabs, { type ReviewResultTab } from "../components/ReviewResultTabs";
import FindingCard from "../components/FindingCard";
import InconsistencyTable from "../components/InconsistencyTable";
import SafetyNotice from "../components/SafetyNotice";
import { StatusBadge, SeverityBadge } from "../components/Badge";
import { formatDate, formatDateTime } from "../utils/formatting";
import type { FindingCategory } from "../types/review";

const TAB_KEYS = [
  "summary",
  "missing",
  "inconsistency",
  "regulatory",
  "privacy",
  "questions",
  "memo",
] as const;
type TabKey = (typeof TAB_KEYS)[number];

const CATEGORY_BY_TAB: Partial<Record<TabKey, FindingCategory>> = {
  missing: "필수항목 누락",
  regulatory: "규정 검토 필요사항",
  privacy: "개인정보 및 검체 관리",
  questions: "연구자 확인 질문",
};

export default function ReviewResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    projects,
    getFindingsByProject,
    getInconsistenciesByProject,
    getStaffMemosByProject,
    getDocumentsByProject,
    toggleFindingResolved,
    updateInconsistencyStatus,
    addStaffMemo,
    knowledgeBase,
    runAiReview,
    aiAnalysisEnabled,
  } = useReviewData();

  const projectId = searchParams.get("projectId") || projects[0]?.id || "";
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [memoText, setMemoText] = useState("");
  const [isRerunning, setIsRerunning] = useState(false);
  const [rerunDone, setRerunDone] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const findings = useMemo(() => (project ? getFindingsByProject(project.id) : []), [project, getFindingsByProject]);
  const inconsistencies = useMemo(
    () => (project ? getInconsistenciesByProject(project.id) : []),
    [project, getInconsistenciesByProject]
  );
  const staffMemos = useMemo(() => (project ? getStaffMemosByProject(project.id) : []), [project, getStaffMemosByProject]);
  const documents = useMemo(() => (project ? getDocumentsByProject(project.id) : []), [project, getDocumentsByProject]);

  const tabs: ReviewResultTab[] = [
    { key: "summary", label: "요약" },
    { key: "missing", label: "필수항목 누락", count: findings.filter((f) => f.category === "필수항목 누락").length },
    { key: "inconsistency", label: "문서 간 불일치", count: inconsistencies.length },
    { key: "regulatory", label: "규정 검토 필요사항", count: findings.filter((f) => f.category === "규정 검토 필요사항").length },
    { key: "privacy", label: "개인정보 및 검체 관리", count: findings.filter((f) => f.category === "개인정보 및 검체 관리").length },
    { key: "questions", label: "연구자 확인 질문", count: findings.filter((f) => f.category === "연구자 확인 질문").length },
    { key: "memo", label: "담당자 메모", count: staffMemos.length },
  ];

  if (!project) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
        검토 건이 없습니다. 문서 검토 메뉴에서 신규 검토 건을 등록해 주세요.
      </div>
    );
  }

  const handleRerun = async () => {
    if (documents.length === 0) {
      alert("재검토를 실행하려면 먼저 문서 검토 화면에서 심의서류를 업로드해 주세요.");
      return;
    }
    setIsRerunning(true);
    try {
      await runAiReview(project.id);
      setRerunDone(true);
      setTimeout(() => setRerunDone(false), 2000);
    } finally {
      setIsRerunning(false);
    }
  };

  const severityCounts = {
    높음: findings.filter((f) => f.severity === "높음").length,
    중간: findings.filter((f) => f.severity === "중간").length,
    낮음: findings.filter((f) => f.severity === "낮음").length,
    참고: findings.filter((f) => f.severity === "참고").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900">검토 결과</h1>
          <p className="mt-1 text-sm text-slate-500">사전 검토 결과를 항목별로 확인하고 담당자 확인 여부를 관리하세요.</p>
        </div>
        <select
          value={projectId}
          onChange={(e) => setSearchParams({ projectId: e.target.value })}
          className="input max-w-xs"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.receiptNo}] {p.title}
            </option>
          ))}
        </select>
      </div>

      <SafetyNotice type="severity" />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{project.receiptNo}</p>
            <h2 className="text-lg font-semibold text-navy-900">{project.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {rerunDone && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> 재검토 완료
              </span>
            )}
            <button
              type="button"
              onClick={handleRerun}
              disabled={isRerunning || !aiAnalysisEnabled}
              title="지식베이스 변경 등으로 검토 결과를 다시 생성합니다. 기존 검토 결과는 새 결과로 교체되며, 담당자 확인 표시는 초기화됩니다."
              className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRerunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {isRerunning ? "재검토 중..." : "재검토"}
            </button>
            <StatusBadge status={project.status} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
          <p><span className="text-slate-400">연구책임자</span> {project.principalInvestigator}</p>
          <p><span className="text-slate-400">연구 유형</span> {project.studyType.join(", ")}</p>
          <p><span className="text-slate-400">담당자</span> {project.reviewer}</p>
          <p><span className="text-slate-400">접수일</span> {formatDate(project.receivedDate)}</p>
        </div>
      </div>

      <ReviewResultTabs tabs={tabs} active={activeTab} onChange={(k) => setActiveTab(k as TabKey)} />

      <div>
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["높음", "중간", "낮음", "참고"] as const).map((s) => (
                <div key={s} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <SeverityBadge severity={s} />
                  <p className="mt-2 text-2xl font-semibold text-navy-800">{severityCounts[s]}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800">업로드 문서</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {documents.length === 0 && <li className="text-slate-400">업로드된 문서가 없습니다.</li>}
                {documents.map((d) => (
                  <li key={d.id} className="flex justify-between gap-3">
                    <span className="truncate">
                      {d.documentType} —{" "}
                      {d.fileUrl && d.fileUrl !== "#" ? (
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                          {d.fileName}
                        </a>
                      ) : (
                        d.fileName
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">{formatDateTime(d.uploadedAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {findings.slice(0, 4).map((f) => (
                <FindingCard key={f.id} finding={f} knowledgeBase={knowledgeBase} onToggleResolved={toggleFindingResolved} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "inconsistency" && (
          <InconsistencyTable items={inconsistencies} onStatusChange={updateInconsistencyStatus} />
        )}

        {activeTab === "memo" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <textarea
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                placeholder="담당자 메모를 입력하세요 (내부 참고용)"
                rows={3}
                className="input resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!memoText.trim()) return;
                    addStaffMemo(project.id, project.reviewer, memoText.trim());
                    setMemoText("");
                  }}
                  className="rounded-md bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
                >
                  메모 추가
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {staffMemos.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                  등록된 담당자 메모가 없습니다.
                </p>
              )}
              {staffMemos.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{m.author}</span>
                    <span>{formatDateTime(m.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-slate-700">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {CATEGORY_BY_TAB[activeTab] && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {findings.filter((f) => f.category === CATEGORY_BY_TAB[activeTab]).length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                해당 항목에 확인된 사항이 없습니다.
              </p>
            )}
            {findings
              .filter((f) => f.category === CATEGORY_BY_TAB[activeTab])
              .map((f) => (
                <FindingCard key={f.id} finding={f} knowledgeBase={knowledgeBase} onToggleResolved={toggleFindingResolved} />
              ))}
          </div>
        )}
      </div>

      <SafetyNotice type="default" />
    </div>
  );
}
