import { useState, type ReactNode } from "react";
import { USER_ROLES, REVIEW_STATUSES, SEVERITIES } from "../types/review";
import { SEVERITY_DESCRIPTIONS, SEVERITY_BADGE_CLASS } from "../utils/severity";
import { useReviewData } from "../context/ReviewDataContext";
import SafetyNotice from "../components/SafetyNotice";

const ROLE_DESCRIPTIONS: Record<(typeof USER_ROLES)[number], string> = {
  관리자: "지식베이스 및 사용자 권한을 포함한 시스템 전체 설정 관리",
  행정간사: "검토 건 등록, 문서 업로드, AI 검토 실행, 행정의견 초안 작성 및 회신 관리",
  검토자: "검토 결과 확인 및 담당자 메모 작성, 담당자 확인 여부 갱신",
  "조회 전용": "검토 현황 및 결과 조회만 가능 (수정 불가)",
};

const STATUS_DESCRIPTIONS: Record<(typeof REVIEW_STATUSES)[number], string> = {
  임시저장: "검토 건 정보만 등록되고 문서 검토가 시작되지 않은 상태",
  "검토 중": "문서 업로드 및 AI 사전 검토가 진행 중인 상태",
  "보완 권고": "확인 필요사항이 발견되어 보완 검토가 권고된 상태",
  "담당자 확인 중": "발견 사항에 대해 담당자 확인 절차가 진행 중인 상태",
  완료: "행정검토 및 담당자 확인 절차가 종료된 상태",
  보류: "연구자 소명 대기 등의 사유로 검토가 일시 중단된 상태",
};

const RETENTION_OPTIONS = ["1년", "3년", "5년", "영구 보관"];
const TEMPLATE_OPTIONS = ["기관 표준 서식 A", "기관 표준 서식 B", "간이 요약 서식"];

export default function Settings() {
  const { aiAnalysisEnabled, setAiAnalysisEnabled } = useReviewData();
  const [retention, setRetention] = useState(RETENTION_OPTIONS[1]);
  const [template, setTemplate] = useState(TEMPLATE_OPTIONS[0]);
  const [uploadNotice, setUploadNotice] = useState(
    "업로드하는 문서에 개인정보가 포함될 수 있습니다. 접근 권한이 있는 담당자만 열람하도록 관리하고, 불필요한 개인정보는 최소화하여 업로드해 주세요."
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900">설정</h1>
        <p className="mt-1 text-sm text-slate-500">사용자 권한, 상태값, 위험도 기준, 출력 양식 등 시스템 운영 기준을 관리하세요.</p>
      </div>

      <SectionCard title="사용자 권한 관리">
        <div className="space-y-2">
          {USER_ROLES.map((role) => (
            <div key={role} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 px-3 py-2.5">
              <span className="w-28 shrink-0 text-sm font-medium text-navy-700">{role}</span>
              <span className="text-sm text-slate-500">{ROLE_DESCRIPTIONS[role]}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="검토 상태값 관리">
        <div className="space-y-2">
          {REVIEW_STATUSES.map((status) => (
            <div key={status} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 px-3 py-2.5">
              <span className="w-32 shrink-0 text-sm font-medium text-navy-700">{status}</span>
              <span className="text-sm text-slate-500">{STATUS_DESCRIPTIONS[status]}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="위험도 기준 설명">
        <p className="mb-3 text-xs text-slate-500">위험도는 행정검토 우선순위 구분이며, 연구의 법적 적합성이나 승인 가능성을 의미하지 않습니다.</p>
        <div className="space-y-2">
          {SEVERITIES.map((s) => (
            <div key={s} className="flex items-center gap-4 rounded-lg border border-slate-200 px-3 py-2.5">
              <span className={`inline-flex w-16 shrink-0 justify-center rounded-full px-2.5 py-1 text-xs font-medium ${SEVERITY_BADGE_CLASS[s]}`}>
                {s}
              </span>
              <span className="text-sm text-slate-500">{SEVERITY_DESCRIPTIONS[s]}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="출력 양식 설정">
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTemplate(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                template === t ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">선택한 서식은 검토 결과 및 행정의견 초안 출력 시 적용됩니다. (mock 설정)</p>
      </SectionCard>

      <SectionCard title="AI 분석 사용 여부 설정">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700">AI 사전 검토 기능 사용</p>
            <p className="mt-0.5 text-xs text-slate-400">비활성화 시 문서 검토 화면에서 AI 검토 실행이 제한됩니다.</p>
          </div>
          <button
            type="button"
            onClick={() => setAiAnalysisEnabled(!aiAnalysisEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${aiAnalysisEnabled ? "bg-teal-600" : "bg-slate-300"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                aiAnalysisEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </SectionCard>

      <SectionCard title="파일 보관기간 설정">
        <div className="flex flex-wrap gap-2">
          {RETENTION_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRetention(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                retention === r ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">업로드된 심의서류 및 첨부파일의 보관기간입니다. (mock 설정)</p>
      </SectionCard>

      <SectionCard title="개인정보 포함 문서 업로드 주의문 설정">
        <textarea
          value={uploadNotice}
          onChange={(e) => setUploadNotice(e.target.value)}
          rows={3}
          className="input resize-none"
        />
        <p className="mt-2 text-xs text-slate-400">문서 검토 화면 업로드 영역에 표시되는 안내문입니다.</p>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">{uploadNotice}</div>
      </SectionCard>

      <SafetyNotice type="default" />
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-navy-800">{title}</h3>
      {children}
    </div>
  );
}
