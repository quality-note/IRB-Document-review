import { ShieldAlert, Info, Lock } from "lucide-react";

const DEFAULT_NOTICE =
  "본 시스템의 분석 결과는 심의서류 행정검토를 지원하기 위한 참고자료입니다. 연구의 승인 여부, 규제 적합 여부, IRB 심의 대상 여부, 식약처 승인 대상 여부를 최종 판단하지 않습니다. 최종 검토 및 판단은 담당자, 심의위원회, 책임자 및 기관의 공식 절차에 따라 수행해야 합니다.";

const SEVERITY_NOTICE =
  "\"위험도\"는 행정검토 우선순위 구분을 의미하며, 연구 자체의 법적 적합성이나 승인 가능성을 의미하지 않습니다.";

const DEIDENTIFY_NOTICE =
  "과거 심의사례를 등록할 때는 연구대상자 및 연구자 개인을 식별할 수 있는 정보를 반드시 제거한 뒤 등록해 주세요.";

const UPLOAD_PRIVACY_NOTICE =
  "업로드하는 문서에 개인정보가 포함될 수 있습니다. 접근 권한이 있는 담당자만 열람하도록 관리하고, 불필요한 개인정보는 최소화하여 업로드해 주세요.";

type NoticeType = "default" | "severity" | "deidentify" | "uploadPrivacy";

const NOTICE_MAP: Record<NoticeType, { text: string; icon: typeof ShieldAlert }> = {
  default: { text: DEFAULT_NOTICE, icon: ShieldAlert },
  severity: { text: SEVERITY_NOTICE, icon: Info },
  deidentify: { text: DEIDENTIFY_NOTICE, icon: Lock },
  uploadPrivacy: { text: UPLOAD_PRIVACY_NOTICE, icon: Lock },
};

export default function SafetyNotice({
  type = "default",
  className = "",
}: {
  type?: NoticeType;
  className?: string;
}) {
  const { text, icon: Icon } = NOTICE_MAP[type];
  const isPrimary = type === "default";

  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-xs leading-relaxed ${
        isPrimary
          ? "border-navy-200 bg-navy-50 text-navy-800"
          : "border-slate-200 bg-slate-50 text-slate-600"
      } ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isPrimary ? "text-navy-600" : "text-slate-500"}`} />
      <p>{text}</p>
    </div>
  );
}
