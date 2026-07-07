import { useState } from "react";
import { PlusCircle, Save, X } from "lucide-react";
import { useReviewData } from "../context/ReviewDataContext";
import { KNOWLEDGE_BASE_TYPES, type KnowledgeBaseItem, type KnowledgeBaseType } from "../types/knowledgeBase";
import KnowledgeBaseTable from "../components/KnowledgeBaseTable";
import SafetyNotice from "../components/SafetyNotice";

const emptyForm = {
  title: "",
  type: KNOWLEDGE_BASE_TYPES[0] as KnowledgeBaseType,
  version: "",
  effectiveDate: new Date().toISOString().slice(0, 10),
  applicableScope: "",
  keywords: "",
  summary: "",
  content: "",
  fileName: "",
  active: true,
  remarks: "",
};

type FormState = typeof emptyForm;

function toFormState(item: KnowledgeBaseItem): FormState {
  return {
    title: item.title,
    type: item.type,
    version: item.version,
    effectiveDate: item.effectiveDate,
    applicableScope: item.applicableScope || "",
    keywords: item.keywords.join(", "),
    summary: item.summary,
    content: item.content,
    fileName: item.fileUrl ? "첨부파일 유지됨 (교체하려면 다시 선택)" : "",
    active: item.active,
    remarks: item.remarks || "",
  };
}

function toPayload(form: FormState) {
  return {
    title: form.title,
    type: form.type,
    version: form.version,
    effectiveDate: form.effectiveDate,
    applicableScope: form.applicableScope,
    keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    summary: form.summary,
    content: form.content || form.summary,
    fileUrl: form.fileName ? "#" : undefined,
    active: form.active,
    remarks: form.remarks,
  };
}

function KnowledgeBaseFormFields({ form, onChange }: { form: FormState; onChange: (patch: Partial<FormState>) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-slate-600">자료명 *</span>
        <input value={form.title} onChange={(e) => onChange({ title: e.target.value })} className="input" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-slate-600">자료 유형</span>
        <select
          value={form.type}
          onChange={(e) => onChange({ type: e.target.value as KnowledgeBaseType })}
          className="input"
        >
          {KNOWLEDGE_BASE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-slate-600">버전 *</span>
        <input value={form.version} onChange={(e) => onChange({ version: e.target.value })} className="input" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-slate-600">시행일 또는 개정일</span>
        <input type="date" value={form.effectiveDate} onChange={(e) => onChange({ effectiveDate: e.target.value })} className="input" />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-slate-600">적용 대상</span>
        <input
          value={form.applicableScope}
          onChange={(e) => onChange({ applicableScope: e.target.value })}
          placeholder="예: 인체유래물연구, 잔여검체 사용 연구"
          className="input"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-slate-600">관련 키워드 (쉼표로 구분)</span>
        <input
          value={form.keywords}
          onChange={(e) => onChange({ keywords: e.target.value })}
          placeholder="예: 개인정보, 보관기간, 동의"
          className="input"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-slate-600">요약</span>
        <textarea value={form.summary} onChange={(e) => onChange({ summary: e.target.value })} rows={2} className="input resize-none" />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-slate-600">주요 내용</span>
        <textarea value={form.content} onChange={(e) => onChange({ content: e.target.value })} rows={3} className="input resize-none" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-slate-600">첨부파일</span>
        <input type="file" onChange={(e) => onChange({ fileName: e.target.files?.[0]?.name || "" })} className="input" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-slate-600">비고</span>
        <input value={form.remarks} onChange={(e) => onChange({ remarks: e.target.value })} className="input" />
      </label>
    </div>
  );
}

export default function KnowledgeBaseManage() {
  const { knowledgeBase, addKnowledgeBaseItem, updateKnowledgeBaseItem, deleteKnowledgeBaseItem } = useReviewData();
  const [form, setForm] = useState<FormState>(emptyForm);

  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  const isPastCase = form.type === "과거 심의사례";

  const handleSubmit = () => {
    if (!form.title || !form.version) {
      alert("자료명과 버전은 필수 입력 항목입니다.");
      return;
    }
    addKnowledgeBaseItem(toPayload(form));
    setForm(emptyForm);
  };

  const openEdit = (item: KnowledgeBaseItem) => {
    setEditingItem(item);
    setEditForm(toFormState(item));
  };

  const closeEdit = () => {
    setEditingItem(null);
    setEditForm(emptyForm);
  };

  const handleEditSave = () => {
    if (!editingItem) return;
    if (!editForm.title || !editForm.version) {
      alert("자료명과 버전은 필수 입력 항목입니다.");
      return;
    }
    updateKnowledgeBaseItem(editingItem.id, toPayload(editForm));
    closeEdit();
  };

  const handleDelete = (item: KnowledgeBaseItem) => {
    const confirmed = window.confirm(`"${item.title}" 자료를 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.`);
    if (!confirmed) return;
    deleteKnowledgeBaseItem(item.id);
    if (editingItem?.id === item.id) closeEdit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900">지식베이스 관리</h1>
        <p className="mt-1 text-sm text-slate-500">법령, SOP, 가이드라인, 과거 심의사례 등 근거자료를 등록하고 관리하세요.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-navy-800">신규 근거자료 등록</h3>

        {isPastCase && <SafetyNotice type="deidentify" className="mt-3" />}
        <SafetyNotice type="uploadPrivacy" className="mt-3" />

        <div className="mt-4">
          <KnowledgeBaseFormFields form={form} onChange={(patch) => setForm({ ...form, ...patch })} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            등록 즉시 활성 상태로 설정
          </label>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800"
          >
            <PlusCircle className="h-4 w-4" />
            근거자료 등록
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-navy-800">등록된 근거자료 ({knowledgeBase.length}건)</h3>
        <KnowledgeBaseTable
          items={knowledgeBase}
          showActiveToggle
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleActive={(item) => updateKnowledgeBaseItem(item.id, { active: !item.active })}
        />
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-900">근거자료 수정</h2>
              <button type="button" onClick={closeEdit} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {editForm.type === "과거 심의사례" && <SafetyNotice type="deidentify" className="mt-3" />}

            <div className="mt-4">
              <KnowledgeBaseFormFields form={editForm} onChange={(patch) => setEditForm({ ...editForm, ...patch })} />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                활성 상태로 설정
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleEditSave}
                  className="flex items-center gap-1.5 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800"
                >
                  <Save className="h-4 w-4" />
                  수정 내용 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
