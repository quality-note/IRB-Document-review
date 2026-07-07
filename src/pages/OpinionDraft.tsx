import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useReviewData } from "../context/ReviewDataContext";
import { generateOpinionDraft } from "../services/aiReviewService";
import { copyTextToClipboard, exportAsWord, textToSimpleHtml } from "../services/exportService";
import OpinionEditor from "../components/OpinionEditor";
import SafetyNotice from "../components/SafetyNotice";
import type { OpinionTone } from "../types/review";
import { formatDateTime } from "../utils/formatting";

export default function OpinionDraft() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    projects,
    getFindingsByProject,
    getInconsistenciesByProject,
    getOpinionDraftsByProject,
    knowledgeBase,
    saveOpinionDraft,
  } = useReviewData();

  const projectId = searchParams.get("projectId") || projects[0]?.id || "";
  const project = projects.find((p) => p.id === projectId);

  const [tone, setTone] = useState<OpinionTone>("공식적으로");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const findings = project ? getFindingsByProject(project.id) : [];
  const inconsistencies = project ? getInconsistenciesByProject(project.id) : [];
  const history = project ? getOpinionDraftsByProject(project.id) : [];

  const regenerate = () => {
    if (!project) return;
    setContent(generateOpinionDraft(project, findings, inconsistencies, knowledgeBase, tone));
    setSaved(false);
  };

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, tone]);

  if (!project) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
        검토 건이 없습니다. 문서 검토 메뉴에서 신규 검토 건을 등록해 주세요.
      </div>
    );
  }

  const handleSave = () => {
    saveOpinionDraft(project.id, tone, content, project.reviewer);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900">행정의견 초안</h1>
          <p className="mt-1 text-sm text-slate-500">검토 결과를 바탕으로 연구자 회신용 행정의견 초안을 작성하고 수정하세요.</p>
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

      <div className="rounded-lg border border-navy-200 bg-navy-50 px-4 py-3 text-xs text-navy-800">
        본 초안은 담당자가 검토·수정 후 확정하는 참고용 자료입니다. 연구자에게 자동으로 발송되지 않으며, 별도 절차를 통해 회신해 주세요.
      </div>

      <OpinionEditor
        tone={tone}
        onToneChange={setTone}
        content={content}
        onContentChange={setContent}
        onGenerate={regenerate}
        onCopy={() => copyTextToClipboard(content)}
        onSave={handleSave}
        onExportWord={() =>
          exportAsWord(`행정의견초안_${project.receiptNo}`, textToSimpleHtml(content), `행정의견초안_${project.receiptNo}`)
        }
        onExportPdf={() => window.print()}
        saved={saved}
      />

      {history.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-navy-800">저장 이력</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-slate-600 last:border-0">
                <span>{h.tone} · {h.createdBy}</span>
                <span className="text-xs text-slate-400">{formatDateTime(h.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SafetyNotice type="default" />
    </div>
  );
}
