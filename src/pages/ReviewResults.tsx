import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, Loader2, CheckCircle2, Send, Stamp, StickyNote } from "lucide-react";
import { useReviewData } from "../context/ReviewDataContext";
import FindingCard from "../components/FindingCard";
import InconsistencyCard from "../components/InconsistencyCard";
import AddReviewItemForm from "../components/AddReviewItemForm";
import ResearcherAssignPanel from "../components/ResearcherAssignPanel";
import SafetyNotice from "../components/SafetyNotice";
import { StatusBadge } from "../components/Badge";
import { formatDate, formatDateTime } from "../utils/formatting";
import { SEVERITY_ORDER } from "../utils/severity";
import type { ReviewFinding, DocumentInconsistency, StaffMemo } from "../types/review";

type FeedEntry =
  | { kind: "finding"; rank: number; date: string; data: ReviewFinding }
  | { kind: "inconsistency"; rank: number; date: string; data: DocumentInconsistency }
  | { kind: "memo"; rank: number; date: string; data: StaffMemo };

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
    sendToResearcher,
    finalizeProject,
    addManualFinding,
    addManualInconsistency,
    assignResearcher,
  } = useReviewData();

  const projectId = searchParams.get("projectId") || projects[0]?.id || "";
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

  const feed: FeedEntry[] = useMemo(() => {
    const entries: FeedEntry[] = [
      ...findings.map((f) => ({ kind: "finding" as const, rank: SEVERITY_ORDER[f.severity], date: f.createdAt, data: f })),
      ...inconsistencies.map((i) => ({ kind: "inconsistency" as const, rank: SEVERITY_ORDER["높음"], date: i.createdAt, data: i })),
      ...staffMemos.map((m) => ({ kind: "memo" as const, rank: 4, date: m.createdAt, data: m })),
    ];
    return entries.sort((a, b) => a.rank - b.rank || b.date.localeCompare(a.date));
  }, [findings, inconsistencies, staffMemos]);

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

  const canSendToResearcher = project.status === "검토 중" || project.status === "보완 권고";
  const canFinalize = Boolean(project.researcherSubmittedAt) && project.status !== "완료";

  const handleSendToResearcher = () => {
    if (!project.researcherId) {
      alert("이 검토 건에는 지정된 연구담당자 계정이 없습니다. 아래 \"연구담당자 계정\" 항목에서 지정해 주세요.");
      return;
    }
    if (findings.length === 0 && inconsistencies.length === 0) {
      alert("먼저 AI 검토를 실행해 확인 필요사항을 생성해 주세요.");
      return;
    }
    sendToResearcher(project.id);
  };

  const handleFinalize = () => {
    finalizeProject(project.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900">검토 결과</h1>
          <p className="mt-1 text-sm text-slate-500">
            모든 검토 항목({feed.length}건)이 한 곳에 모여 있습니다. 위험도가 높은 항목부터 정렬됩니다.
          </p>
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
            {canSendToResearcher && (
              <button
                type="button"
                onClick={handleSendToResearcher}
                title="검토 결과를 연구담당자에게 공개하여 답변·수정자료 제출을 요청합니다."
                className="flex items-center gap-1.5 rounded-md border border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
              >
                <Send className="h-3.5 w-3.5" />
                담당자에게 전달
              </button>
            )}
            {project.status === "담당자 확인 중" && (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={!canFinalize}
                title={canFinalize ? "담당자 제출 내용을 확인했다면 최종 접수 처리합니다." : "담당자가 아직 답변/자료를 제출하지 않았습니다."}
                className="flex items-center gap-1.5 rounded-md border border-navy-300 bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Stamp className="h-3.5 w-3.5" />
                최종 접수
              </button>
            )}
            <StatusBadge status={project.status} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
          <p><span className="text-slate-400">연구책임자</span> {project.principalInvestigator}</p>
          <p><span className="text-slate-400">연구 유형</span> {project.studyType.join(", ")}</p>
          <p><span className="text-slate-400">담당자(행정간사)</span> {project.reviewer}</p>
          <p><span className="text-slate-400">접수일</span> {formatDate(project.receivedDate)}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <ResearcherAssignPanel
            currentResearcherId={project.researcherId}
            onAssign={(researcherId) => assignResearcher(project.id, researcherId)}
          />
          <p className="text-sm text-slate-600">
            <span className="text-slate-400">담당자 제출</span>{" "}
            {project.researcherSubmittedAt ? (
              <span className="text-emerald-600">완료 · {formatDateTime(project.researcherSubmittedAt)}</span>
            ) : (
              <span className="text-slate-400">미제출</span>
            )}
          </p>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <h3 className="text-sm font-semibold text-navy-800">업로드 문서</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
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
                  {d.uploadedBy && (
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                      {d.uploadedBy} 업로드
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-slate-400">{formatDateTime(d.uploadedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AddReviewItemForm
        knowledgeBase={knowledgeBase}
        onAddFinding={(input) => addManualFinding({ projectId: project.id, ...input })}
        onAddInconsistency={(input) => addManualInconsistency({ projectId: project.id, ...input })}
        onAddMemo={(content) => addStaffMemo(project.id, project.reviewer, content)}
      />

      <div className="space-y-3">
        {feed.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            아직 확인된 검토 항목이 없습니다. AI 검토를 실행하거나 위에서 수기로 추가해 주세요.
          </p>
        )}
        {feed.map((entry) => {
          if (entry.kind === "finding") {
            return (
              <FindingCard
                key={entry.data.id}
                finding={entry.data}
                knowledgeBase={knowledgeBase}
                onToggleResolved={toggleFindingResolved}
              />
            );
          }
          if (entry.kind === "inconsistency") {
            return (
              <InconsistencyCard
                key={entry.data.id}
                item={entry.data}
                onStatusChange={updateInconsistencyStatus}
              />
            );
          }
          return (
            <div key={entry.data.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <StickyNote className="h-3.5 w-3.5" />
                담당자 메모
                <span className="ml-auto text-slate-400">
                  {entry.data.author} · {formatDateTime(entry.data.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{entry.data.content}</p>
            </div>
          );
        })}
      </div>

      <SafetyNotice type="default" />
    </div>
  );
}
