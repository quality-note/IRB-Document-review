import { useState } from "react";
import { Plus, X } from "lucide-react";
import { FINDING_CATEGORIES, SEVERITIES, type FindingCategory, type Severity } from "../types/review";
import type { KnowledgeBaseItem } from "../types/knowledgeBase";

type ItemType = "finding" | "inconsistency" | "memo";

interface Props {
  knowledgeBase: KnowledgeBaseItem[];
  onAddFinding: (input: {
    category: FindingCategory;
    severity: Severity;
    title: string;
    description: string;
    sourceDocument: string;
    recommendation: string;
    basisIds: string[];
  }) => void;
  onAddInconsistency: (input: {
    itemName: string;
    protocolValue: string;
    consentValue: string;
    reportValue: string;
    otherValue: string;
    finding: string;
  }) => void;
  onAddMemo: (content: string) => void;
}

const TYPE_LABELS: Record<ItemType, string> = {
  finding: "확인 필요사항",
  inconsistency: "문서 간 불일치",
  memo: "담당자 메모",
};

const emptyFindingForm = {
  category: FINDING_CATEGORIES[0],
  severity: "중간" as Severity,
  title: "",
  description: "",
  sourceDocument: "",
  recommendation: "",
  basisIds: [] as string[],
};

const emptyInconsistencyForm = {
  itemName: "",
  protocolValue: "",
  consentValue: "",
  reportValue: "",
  otherValue: "",
  finding: "",
};

export default function AddReviewItemForm({ knowledgeBase, onAddFinding, onAddInconsistency, onAddMemo }: Props) {
  const [open, setOpen] = useState(false);
  const [itemType, setItemType] = useState<ItemType>("finding");
  const [findingForm, setFindingForm] = useState(emptyFindingForm);
  const [inconsistencyForm, setInconsistencyForm] = useState(emptyInconsistencyForm);
  const [memoText, setMemoText] = useState("");

  const toggleBasis = (id: string) => {
    setFindingForm((prev) => ({
      ...prev,
      basisIds: prev.basisIds.includes(id) ? prev.basisIds.filter((x) => x !== id) : [...prev.basisIds, id],
    }));
  };

  const handleSubmit = () => {
    if (itemType === "finding") {
      if (!findingForm.title.trim()) {
        alert("제목을 입력해 주세요.");
        return;
      }
      onAddFinding(findingForm);
      setFindingForm(emptyFindingForm);
    } else if (itemType === "inconsistency") {
      if (!inconsistencyForm.itemName.trim() || !inconsistencyForm.finding.trim()) {
        alert("검토 항목과 검토 결과는 필수 입력 항목입니다.");
        return;
      }
      onAddInconsistency(inconsistencyForm);
      setInconsistencyForm(emptyInconsistencyForm);
    } else {
      if (!memoText.trim()) {
        alert("메모 내용을 입력해 주세요.");
        return;
      }
      onAddMemo(memoText.trim());
      setMemoText("");
    }
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-500 hover:border-teal-400 hover:text-teal-600"
      >
        <Plus className="h-4 w-4" />
        검토 항목 수기 추가
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-navy-800">검토 항목 수기 추가</p>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {(Object.keys(TYPE_LABELS) as ItemType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setItemType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              itemType === t ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {itemType === "finding" && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">분류</span>
            <select
              value={findingForm.category}
              onChange={(e) => setFindingForm({ ...findingForm, category: e.target.value as FindingCategory })}
              className="input"
            >
              {FINDING_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">위험도(행정검토 우선순위)</span>
            <select
              value={findingForm.severity}
              onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value as Severity })}
              className="input"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-600">제목 *</span>
            <input
              value={findingForm.title}
              onChange={(e) => setFindingForm({ ...findingForm, title: e.target.value })}
              className="input"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">관련 문서</span>
            <input
              value={findingForm.sourceDocument}
              onChange={(e) => setFindingForm({ ...findingForm, sourceDocument: e.target.value })}
              placeholder="예: 연구계획서"
              className="input"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-600">설명</span>
            <textarea
              value={findingForm.description}
              onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })}
              rows={2}
              className="input resize-none"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-600">권고사항 (초안)</span>
            <textarea
              value={findingForm.recommendation}
              onChange={(e) => setFindingForm({ ...findingForm, recommendation: e.target.value })}
              rows={2}
              className="input resize-none"
            />
          </label>
          {knowledgeBase.length > 0 && (
            <div className="text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">근거 후보 (선택, 담당자 최종 확인 필요)</span>
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-slate-200 p-2">
                {knowledgeBase
                  .filter((kb) => kb.active)
                  .map((kb) => {
                    const checked = findingForm.basisIds.includes(kb.id);
                    return (
                      <button
                        key={kb.id}
                        type="button"
                        onClick={() => toggleBasis(kb.id)}
                        className={`rounded-full border px-2 py-1 text-xs ${
                          checked ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-500"
                        }`}
                      >
                        {kb.title}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {itemType === "inconsistency" && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-600">검토 항목 *</span>
            <input
              value={inconsistencyForm.itemName}
              onChange={(e) => setInconsistencyForm({ ...inconsistencyForm, itemName: e.target.value })}
              placeholder="예: 연구 제목 불일치"
              className="input"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">연구계획서 내용</span>
            <input
              value={inconsistencyForm.protocolValue}
              onChange={(e) => setInconsistencyForm({ ...inconsistencyForm, protocolValue: e.target.value })}
              className="input"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">동의서 내용</span>
            <input
              value={inconsistencyForm.consentValue}
              onChange={(e) => setInconsistencyForm({ ...inconsistencyForm, consentValue: e.target.value })}
              className="input"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">결과보고서 내용</span>
            <input
              value={inconsistencyForm.reportValue}
              onChange={(e) => setInconsistencyForm({ ...inconsistencyForm, reportValue: e.target.value })}
              className="input"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">기타 문서 내용</span>
            <input
              value={inconsistencyForm.otherValue}
              onChange={(e) => setInconsistencyForm({ ...inconsistencyForm, otherValue: e.target.value })}
              className="input"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-600">검토 결과 *</span>
            <textarea
              value={inconsistencyForm.finding}
              onChange={(e) => setInconsistencyForm({ ...inconsistencyForm, finding: e.target.value })}
              rows={2}
              className="input resize-none"
            />
          </label>
        </div>
      )}

      {itemType === "memo" && (
        <div className="mt-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">메모 내용 *</span>
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              rows={3}
              placeholder="내부 참고용 메모를 입력하세요."
              className="input resize-none"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-1.5 rounded-md bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" />
          추가
        </button>
      </div>
    </div>
  );
}
