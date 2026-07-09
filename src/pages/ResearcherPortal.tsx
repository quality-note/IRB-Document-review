import { useMemo, useState } from "react";
import { ShieldCheck, LogOut, CheckCircle2, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useReviewData } from "../context/ReviewDataContext";
import FindingCard from "../components/FindingCard";
import InconsistencyTable from "../components/InconsistencyTable";
import FileUploadPanel from "../components/FileUploadPanel";
import SafetyNotice from "../components/SafetyNotice";
import { StatusBadge } from "../components/Badge";
import { formatDate, formatDateTime } from "../utils/formatting";
import type { DocumentType, ReviewProject } from "../types/review";

export default function ResearcherPortal() {
  const { user, logout } = useAuth();
  const {
    getProjectsByResearcher,
    getFindingsByProject,
    getInconsistenciesByProject,
    getDocumentsByProject,
    knowledgeBase,
    addDocument,
    updateFindingResponse,
    updateInconsistencyResponse,
    submitResearcherResponse,
  } = useReviewData();

  const myProjects = useMemo(() => (user ? getProjectsByResearcher(user.id) : []), [user, getProjectsByResearcher]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(myProjects[0]?.id ?? "");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const project: ReviewProject | undefined =
    myProjects.find((p) => p.id === selectedProjectId) ?? myProjects[0];

  const findings = useMemo(
    () => (project ? getFindingsByProject(project.id) : []),
    [project, getFindingsByProject]
  );
  const inconsistencies = useMemo(
    () => (project ? getInconsistenciesByProject(project.id) : []),
    [project, getInconsistenciesByProject]
  );
  const documents = useMemo(
    () => (project ? getDocumentsByProject(project.id) : []),
    [project, getDocumentsByProject]
  );

  const isOpenForResponse = project?.status === "담당자 확인 중";
  const notYetSent = project && (project.status === "임시저장" || project.status === "검토 중" || project.status === "보완 권고");
  const isClosed = project && (project.status === "완료" || project.status === "보류");

  const handleUpload = (documentType: DocumentType, fileName: string) => {
    if (!project) return;
    addDocument(project.id, documentType, fileName, user?.name);
  };

  const handleSubmit = () => {
    if (!project) return;
    submitResearcherResponse(project.id);
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <span className="text-sm font-semibold text-navy-900">임상연구 심의문서 검토 지원 시스템 — 연구담당자 화면</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {user?.name} (연구담당자)
          </span>
          <button type="button" onClick={logout} className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600">
            <LogOut className="h-3.5 w-3.5" />
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6">
        {myProjects.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            현재 계정에 할당된 연구과제가 없습니다. IRB 행정간사에게 문의해 주세요.
          </div>
        )}

        {myProjects.length > 1 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">연구과제 선택</span>
              <select
                value={project?.id ?? ""}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="input"
              >
                {myProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.receiptNo}] {p.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {project && (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{project.receiptNo}</p>
                  <h2 className="text-lg font-semibold text-navy-900">{project.title}</h2>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <p><span className="text-slate-400">연구책임자</span> {project.principalInvestigator}</p>
                <p><span className="text-slate-400">연구 유형</span> {project.studyType.join(", ")}</p>
                <p><span className="text-slate-400">접수일</span> {formatDate(project.receivedDate)}</p>
              </div>
            </div>

            <SafetyNotice type="severity" />

            {notYetSent && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
                아직 행정간사의 사전 검토가 진행 중입니다. 확인이 필요한 사항이 있으면 이 화면으로 전달됩니다.
              </div>
            )}

            {isClosed && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {project.status === "완료"
                  ? "이 연구과제는 최종 접수가 완료되었습니다. 아래에서 그동안의 답변 내용을 확인할 수 있습니다."
                  : "이 연구과제는 현재 보류 상태입니다. 문의사항은 IRB 행정간사에게 연락해 주세요."}
              </div>
            )}

            {(isOpenForResponse || isClosed) && (
              <>
                {findings.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-navy-800">확인 필요사항</h3>
                    <div className="space-y-3">
                      {findings.map((f) => (
                        <FindingCard
                          key={f.id}
                          finding={f}
                          knowledgeBase={knowledgeBase}
                          onResponseChange={isOpenForResponse ? updateFindingResponse : undefined}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {inconsistencies.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-navy-800">문서 간 불일치 확인</h3>
                    <InconsistencyTable
                      items={inconsistencies}
                      onResponseChange={isOpenForResponse ? updateInconsistencyResponse : undefined}
                    />
                  </section>
                )}

                {findings.length === 0 && inconsistencies.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                    확인이 필요한 사항이 없습니다.
                  </p>
                )}

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-navy-800">자료 제출</h3>
                  <FileUploadPanel
                    documents={documents}
                    onUpload={handleUpload}
                    disabled={!isOpenForResponse}
                    title="수정자료 업로드"
                    description="확인 필요사항을 반영한 수정 문서를 업로드해 주세요."
                  />
                </section>

                {isOpenForResponse && (
                  <div className="flex items-center justify-end gap-3">
                    {justSubmitted && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> 제출되었습니다
                      </span>
                    )}
                    {project.researcherSubmittedAt && !justSubmitted && (
                      <span className="text-xs text-slate-400">
                        마지막 제출: {formatDateTime(project.researcherSubmittedAt)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex items-center gap-1.5 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800"
                    >
                      <Send className="h-4 w-4" />
                      답변 및 자료 제출
                    </button>
                  </div>
                )}
              </>
            )}

            <SafetyNotice type="default" />
          </>
        )}
      </main>
    </div>
  );
}
