import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  currentResearcherId?: string;
  onAssign: (researcherId: string) => void;
  // 항상 폼을 펼쳐서 보여줄지 여부 (신규 등록 폼처럼 매번 지정이 필요한 경우 true)
  alwaysOpen?: boolean;
}

export default function ResearcherAssignPanel({ currentResearcherId, onAssign, alwaysOpen }: Props) {
  const { createUser, findUserById, listResearchers } = useAuth();
  const existingResearchers = listResearchers();
  const currentResearcher = currentResearcherId ? findUserById(currentResearcherId) : null;

  const [open, setOpen] = useState(Boolean(alwaysOpen) || !currentResearcherId);
  const [mode, setMode] = useState<"existing" | "new">(existingResearchers.length > 0 ? "existing" : "new");
  const [researcherId, setResearcherId] = useState("");
  const [researcherPassword, setResearcherPassword] = useState("");
  const [researcherName, setResearcherName] = useState("");
  const [selectedExistingId, setSelectedExistingId] = useState(existingResearchers[0]?.id ?? "");

  const handleConfirm = () => {
    if (mode === "new") {
      if (!researcherId || !researcherPassword || !researcherName) {
        alert("담당자 로그인 ID, 초기 비밀번호, 이름을 모두 입력해 주세요.");
        return;
      }
      if (findUserById(researcherId) && !existingResearchers.some((r) => r.id === researcherId)) {
        alert("이미 사용 중인 ID입니다 (행정간사 계정과 겹칠 수 없습니다).");
        return;
      }
      try {
        const created = createUser(researcherId, researcherPassword, researcherName, "연구담당자");
        onAssign(created.id);
        setResearcherId("");
        setResearcherPassword("");
        setResearcherName("");
        if (!alwaysOpen) setOpen(false);
      } catch (e) {
        alert(e instanceof Error ? e.message : "담당자 계정 발급 중 오류가 발생했습니다.");
      }
      return;
    }

    const id = selectedExistingId || existingResearchers[0]?.id;
    if (!id) {
      alert("담당자 계정을 선택해 주세요.");
      return;
    }
    onAssign(id);
    if (!alwaysOpen) setOpen(false);
  };

  if (!open) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className="text-slate-400">연구담당자 계정</span>
        {currentResearcher ? `${currentResearcher.name} (${currentResearcher.id})` : "미지정"}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
        >
          {currentResearcher ? "변경" : "지정"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-600">연구담당자 계정 {currentResearcher ? "변경" : "지정"}</p>
        {!alwaysOpen && (
          <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
            취소
          </button>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            mode === "existing" ? "bg-navy-700 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          기존 계정 선택
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            mode === "new" ? "bg-navy-700 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          신규 계정 발급
        </button>
      </div>

      {mode === "existing" ? (
        existingResearchers.length > 0 ? (
          <select
            value={selectedExistingId || existingResearchers[0]?.id || ""}
            onChange={(e) => setSelectedExistingId(e.target.value)}
            className="input mt-2"
          >
            {existingResearchers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.id})
              </option>
            ))}
          </select>
        ) : (
          <p className="mt-2 text-xs text-amber-600">등록된 담당자 계정이 없습니다. "신규 계정 발급"을 선택해 주세요.</p>
        )
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            value={researcherName}
            onChange={(e) => setResearcherName(e.target.value)}
            placeholder="담당자 이름"
            className="input"
          />
          <input
            value={researcherId}
            onChange={(e) => setResearcherId(e.target.value)}
            placeholder="로그인 ID (이메일 등)"
            className="input"
          />
          <input
            value={researcherPassword}
            onChange={(e) => setResearcherPassword(e.target.value)}
            placeholder="초기 비밀번호"
            className="input"
          />
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-md bg-navy-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-800"
        >
          확인
        </button>
      </div>
    </div>
  );
}
