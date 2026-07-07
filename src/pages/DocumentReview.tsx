import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CheckCircle2, Check } from "lucide-react";
import { useReviewData } from "../context/ReviewDataContext";
import { STUDY_TYPES, type StudyType, type DocumentType } from "../types/review";
import FileUploadPanel from "../components/FileUploadPanel";
import SafetyNotice from "../components/SafetyNotice";

const REVIEWERS = ["백주환", "오은하"];

export default function DocumentReview() {
  const { projects, getDocumentsByProject, createProject, addDocument, runAiReview, aiAnalysisEnabled } =
    useReviewData();
  const navigate = useNavigate();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

  const [form, setForm] = useState({
    receiptNo: "",
    title: "",
    principalInvestigator: "",
    department: "",
    studyType: [] as StudyType[],
    reviewer: REVIEWERS[0],
    receivedDate: new Date().toISOString().slice(0, 10),
    memo: "",
  });
  const [justCreated, setJustCreated] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedDocuments = selectedProjectId ? getDocumentsByProject(selectedProjectId) : [];

  const toggleStudyType = (t: StudyType) => {
    setForm((prev) => ({
      ...prev,
      studyType: prev.studyType.includes(t)
        ? prev.studyType.filter((x) => x !== t)
        : [...prev.studyType, t],
    }));
  };

  const handleCreate = () => {
    if (!form.receiptNo || !form.title || !form.principalInvestigator) {
      alert("접수번호, 연구명, 연구책임자는 필수 입력 항목입니다.");
      return;
    }
    if (form.studyType.length === 0) {
      alert("연구 유형을 하나 이상 선택해 주세요.");
      return;
    }
    const project = createProject(form);
    setSelectedProjectId(project.id);
    setJustCreated(true);
    setTimeout(() => setJustCreated(false), 2000);
    setForm({
      receiptNo: "",
      title: "",
      principalInvestigator: "",
      department: "",
      studyType: [],
      reviewer: REVIEWERS[0],
      receivedDate: new Date().toISOString().slice(0, 10),
      memo: "",
    });
  };

  const handleUpload = (documentType: DocumentType, fileName: string) => {
    if (!selectedProjectId) return;
    addDocument(selectedProjectId, documentType, fileName);
  };

  const handleRunReview = async () => {
    if (!selectedProjectId) return;
    setIsRunning(true);
    try {
      const result = await runAiReview(selectedProjectId);
      navigate(`/review-results?projectId=${selectedProjectId}`);
      // 결과 요약은 검토 결과 화면에서 확인 (mock 분석 결과, 담당자 확인 필요)
      void result;
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900">문서 검토</h1>
        <p className="mt-1 text-sm text-slate-500">신규 검토 건을 등록하거나 기존 검토 건에 심의서류를 업로드하고 AI 사전 검토를 실행하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-navy-800">신규 검토 건 등록</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="접수번호" required>
              <input
                value={form.receiptNo}
                onChange={(e) => setForm({ ...form, receiptNo: e.target.value })}
                placeholder="예: IRB-2026-0040"
                className="input"
              />
            </Field>
            <Field label="접수일" required>
              <input
                type="date"
                value={form.receivedDate}
                onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="연구명" required className="sm:col-span-2">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="연구 제목을 입력하세요"
                className="input"
              />
            </Field>
            <Field label="연구책임자" required>
              <input
                value={form.principalInvestigator}
                onChange={(e) => setForm({ ...form, principalInvestigator: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="소속부서">
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="연구 유형 (중복 선택 가능)" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {STUDY_TYPES.map((t) => {
                  const checked = form.studyType.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleStudyType(t)}
                      aria-pressed={checked}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        checked
                          ? "border-teal-600 bg-teal-50 text-teal-700"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5" />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="검토 담당자">
              <select
                value={form.reviewer}
                onChange={(e) => setForm({ ...form, reviewer: e.target.value })}
                className="input"
              >
                {REVIEWERS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="비고" className="sm:col-span-2">
              <textarea
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                rows={2}
                className="input resize-none"
              />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            {justCreated && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> 등록 완료
              </span>
            )}
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800"
            >
              <PlusCircle className="h-4 w-4" />
              신규 검토 건 등록
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-navy-800">검토 건 선택</h3>
          <p className="mt-1 text-xs text-slate-500">문서를 업로드할 검토 건을 선택하세요.</p>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="input mt-3"
          >
            <option value="">선택하세요</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.receiptNo}] {p.title}
              </option>
            ))}
          </select>

          {selectedProject && (
            <div className="mt-4 space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              <p>
                <span className="font-medium text-slate-600">연구책임자</span> {selectedProject.principalInvestigator} ·{" "}
                <span className="font-medium text-slate-600">연구 유형</span> {selectedProject.studyType.join(", ")}
              </p>
              <p>
                <span className="font-medium text-slate-600">담당자</span> {selectedProject.reviewer} ·{" "}
                <span className="font-medium text-slate-600">상태</span> {selectedProject.status}
              </p>
            </div>
          )}

          {!aiAnalysisEnabled && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              현재 설정에서 AI 분석 기능이 비활성화되어 있습니다. 설정 메뉴에서 활성화할 수 있습니다.
            </p>
          )}
        </div>
      </div>

      {selectedProjectId ? (
        <FileUploadPanel
          documents={selectedDocuments}
          onUpload={handleUpload}
          onRunReview={handleRunReview}
          isRunning={isRunning}
          disabled={!aiAnalysisEnabled}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          문서를 업로드하려면 먼저 검토 건을 등록하거나 선택해 주세요.
        </div>
      )}

      <SafetyNotice type="default" />
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}
