// AI 분석 모듈 (현재는 mock, 추후 실제 LLM API 연동 예정)
//
// 주의: 본 모듈의 분석 결과는 심의서류 행정검토를 지원하기 위한 참고자료이며,
// 연구의 승인 여부·규제 적합 여부·IRB 심의 대상 여부·식약처 승인 대상 여부를
// 최종 판단하지 않는다. 모든 결과 항목에는 담당자 확인이 필요함을 명시한다.
//
// 실제 LLM API 연동 시 이 파일의 analyzeDocuments() 내부 구현만 교체하면 되도록
// 입출력 타입을 고정해 둔다.

import type {
  ReviewProject,
  UploadedDocument,
  ReviewFinding,
  DocumentInconsistency,
  DocumentType,
  FindingCategory,
  Severity,
  OpinionTone,
} from "../types/review";
import type { KnowledgeBaseItem, KnowledgeBaseType } from "../types/knowledgeBase";
import { generateId } from "../utils/formatting";

export interface AnalysisResult {
  findings: ReviewFinding[];
  inconsistencies: DocumentInconsistency[];
  summary: string;
}

interface MockFindingTemplate {
  category: FindingCategory;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  // 이 항목의 근거 후보가 되는 지식베이스 자료 id (KnowledgeBaseItem.id) — 담당자가 화면에서 최종 확인해야 함
  // requiresKnowledgeBaseType이 지정된 항목은 이 값 대신 실제 매칭된 자료 id로 대체된다.
  basisIds: string[];
  // 업로드된 문서 중 하나 이상 존재해야 적용됨 (미지정 시 문서 종류와 무관하게 항상 적용)
  anyOf?: DocumentType[];
  // 업로드된 문서에 모두 존재해야 적용됨 (anyOf와 함께 지정 시 둘 다 충족해야 함)
  allOf?: DocumentType[];
  // 지정 시, 지식베이스에 해당 유형의 활성 자료가 하나 이상 있어야만 적용됨
  // (예: "유사 과거 심의사례" 안내는 실제로 등록된 과거 심의사례가 있을 때만 유효함)
  requiresKnowledgeBaseType?: KnowledgeBaseType;
}

const MOCK_FINDING_TEMPLATES: MockFindingTemplate[] = [
  {
    category: "필수항목 누락",
    severity: "높음",
    title: "연구대상자 수 산정 근거 미흡",
    description: "제출된 연구계획서(또는 임상적 성능시험계획서)에 목표 대상자 수 산정에 대한 통계적 근거 또는 참고문헌이 확인되지 않습니다.",
    recommendation: "대상자 수 산정 근거(통계적 방법, 참고문헌 등)를 보완하도록 요청하는 것을 검토해 주세요.",
    basisIds: ["kb-3"],
    anyOf: ["연구계획서", "임상적 성능시험계획서"],
  },
  {
    category: "문서 간 불일치",
    severity: "높음",
    title: "검체 보관기간이 연구계획서와 동의서에서 서로 다름",
    description: "연구계획서와 설명문 및 동의서 간 검체 보관기간 기재 내용이 상이한 것으로 확인됩니다.",
    recommendation: "두 문서 간 검체 보관기간을 일치시키거나 상이한 사유를 확인하도록 요청하는 것을 검토해 주세요.",
    basisIds: ["kb-1", "kb-6"],
    anyOf: ["연구계획서", "임상적 성능시험계획서"],
    allOf: ["설명문 및 동의서"],
  },
  {
    category: "개인정보 및 검체 관리",
    severity: "중간",
    title: "개인정보 보관 및 폐기 방법 구체화 필요",
    description: "개인정보 수집·이용 항목은 확인되나, 보관 장소·접근 권한·폐기 방법에 대한 구체적 서술이 확인되지 않습니다.",
    recommendation: "개인정보 보관·폐기 절차를 구체적으로 기재하도록 요청하는 것을 검토해 주세요.",
    basisIds: ["kb-2"],
    anyOf: ["설명문 및 동의서", "개인정보 관련 문서"],
  },
  {
    category: "개인정보 및 검체 관리",
    severity: "중간",
    title: "잔여검체 사용 범위 확인 필요",
    description: "잔여검체 또는 인체유래물 사용 범위가 포괄적으로 기재되어 있어 구체화가 필요할 수 있습니다.",
    recommendation: "잔여검체 사용 범위(본 연구 한정 여부, 후속연구 포함 여부)를 구체화하도록 요청하는 것을 검토해 주세요.",
    basisIds: ["kb-5"],
    anyOf: ["인체유래물 또는 잔여검체 관련 문서"],
  },
  {
    category: "연구자 확인 질문",
    severity: "낮음",
    title: "이해상충 관련 사항 문구 정리 권고",
    description: "이해상충서약서 서식이 최신 기관 서식과 다를 수 있습니다.",
    recommendation: "최신 기관 서식 사용 여부를 확인하도록 요청하는 것을 검토해 주세요.",
    basisIds: ["kb-4"],
    anyOf: ["이해상충서약서"],
  },
  {
    category: "규정 검토 필요사항",
    severity: "참고",
    title: "유사 과거 심의사례 참고 권고",
    description: "동일 또는 유사한 검체 유형·연구 유형을 다룬 과거 심의사례가 지식베이스에 존재합니다.",
    recommendation: "관련 과거 심의사례를 참고 자료로 활용하는 것을 검토해 주세요.",
    basisIds: [],
    requiresKnowledgeBaseType: "과거 심의사례",
  },
];

interface MockInconsistencyTemplate extends Omit<DocumentInconsistency, "id" | "projectId"> {
  anyOf?: DocumentType[];
  allOf?: DocumentType[];
}

const MOCK_INCONSISTENCY_TEMPLATES: MockInconsistencyTemplate[] = [
  {
    itemName: "검체 보관기간",
    protocolValue: "연구 종료 후 3년",
    consentValue: "연구 종료 후 5년",
    reportValue: "-",
    otherValue: "-",
    finding: "연구계획서와 동의서 간 검체 보관기간이 상이함 (담당자 확인 필요)",
    confirmationStatus: "미확인",
    anyOf: ["연구계획서", "임상적 성능시험계획서"],
    allOf: ["설명문 및 동의서"],
  },
  {
    itemName: "연구대상자 수",
    protocolValue: "150명",
    consentValue: "150명",
    reportValue: "142명",
    otherValue: "-",
    finding: "결과보고서상 최종 대상자 수가 계획서와 상이함 (담당자 확인 필요)",
    confirmationStatus: "미확인",
    anyOf: ["연구계획서", "임상적 성능시험계획서"],
    allOf: ["결과보고서"],
  },
];

function isApplicable(uploadedTypes: Set<DocumentType>, rule: { anyOf?: DocumentType[]; allOf?: DocumentType[] }): boolean {
  if (rule.anyOf && !rule.anyOf.some((t) => uploadedTypes.has(t))) return false;
  if (rule.allOf && !rule.allOf.every((t) => uploadedTypes.has(t))) return false;
  return true;
}

function matchedSourceDocument(uploadedTypes: Set<DocumentType>, rule: { anyOf?: DocumentType[]; allOf?: DocumentType[] }): string {
  const matched = [...(rule.anyOf ?? []).filter((t) => uploadedTypes.has(t)), ...(rule.allOf ?? [])];
  return matched.length > 0 ? matched.join(" / ") : "-";
}

/**
 * 업로드된 문서를 분석하여 검토 필요사항(mock)을 생성한다.
 * 실제로 업로드된 문서 종류에 해당하는 항목만 생성하며, 업로드되지 않은 문서를 언급하지 않는다.
 * 지식베이스 존재 여부에 의존하는 항목(예: 과거 심의사례 참고)은 실제 등록된 자료가 있을 때만 생성한다.
 * 추후 실제 LLM API 연동 시 이 함수 내부만 교체한다. (입출력 타입은 유지)
 */
export async function analyzeDocuments(
  project: ReviewProject,
  documents: UploadedDocument[],
  knowledgeBase: KnowledgeBaseItem[] = []
): Promise<AnalysisResult> {
  // 실제 API 연동 전까지 네트워크 호출을 흉내내는 지연
  await new Promise((resolve) => setTimeout(resolve, 900));

  const uploadedTypes = new Set(documents.map((d) => d.documentType));

  const findings: ReviewFinding[] = MOCK_FINDING_TEMPLATES.filter((tpl) => isApplicable(uploadedTypes, tpl))
    .map((tpl) => {
      if (!tpl.requiresKnowledgeBaseType) return { tpl, basisIds: tpl.basisIds };
      const matched = knowledgeBase.filter((kb) => kb.type === tpl.requiresKnowledgeBaseType && kb.active);
      if (matched.length === 0) return null;
      return { tpl, basisIds: matched.map((kb) => kb.id) };
    })
    .filter((entry): entry is { tpl: MockFindingTemplate; basisIds: string[] } => entry !== null)
    .map(({ tpl, basisIds }) => ({
      id: generateId("find"),
      projectId: project.id,
      category: tpl.category,
      severity: tpl.severity,
      title: tpl.title,
      description: tpl.description,
      sourceDocument: matchedSourceDocument(uploadedTypes, tpl),
      recommendation: tpl.recommendation,
      basisIds,
      humanReviewRequired: true,
      resolved: false,
      createdAt: new Date().toISOString(),
    }));

  const inconsistencies: DocumentInconsistency[] = MOCK_INCONSISTENCY_TEMPLATES.filter((tpl) =>
    isApplicable(uploadedTypes, tpl)
  ).map(({ anyOf: _anyOf, allOf: _allOf, ...tpl }) => ({
    id: generateId("incon"),
    projectId: project.id,
    ...tpl,
  }));

  const summary = `제출된 문서 ${documents.length}건을 사전 검토한 결과, 확인 필요사항 ${findings.length}건과 문서 간 불일치 후보 ${inconsistencies.length}건이 확인되었습니다. 본 결과는 행정검토 지원을 위한 참고 의견이며, 최종 판단은 담당자 확인이 필요합니다.`;

  return { findings, inconsistencies, summary };
}

const TONE_OPENING: Record<OpinionTone, string> = {
  공식적으로:
    "제출하신 심의서류를 사전 검토한 결과, 아래 사항에 대한 확인 및 보완이 필요할 수 있습니다. 본 의견은 심의 진행 전 행정검토 지원을 위한 참고 의견이며, 최종 검토 및 판단은 기관의 공식 절차에 따라 이루어집니다.",
  부드럽게:
    "제출해 주신 심의서류를 사전에 살펴보았습니다. 아래 내용을 확인해 주시면 이후 심의 절차 진행에 도움이 될 것 같습니다. 참고 의견이며, 최종 판단은 기관의 공식 절차를 따릅니다.",
  간단하게: "사전 검토 결과, 아래 사항에 대한 확인/보완이 필요합니다. (참고 의견, 최종 판단은 공식 절차에 따름)",
  상세하게:
    "제출하신 심의서류를 항목별로 사전 검토하였으며, 그 결과 아래와 같이 확인 및 보완이 필요할 수 있는 사항을 정리하였습니다. 본 의견은 심의위원회의 공식 심의 전 행정검토를 지원하기 위한 참고 자료이며, 서류의 승인 여부나 규제상 적합성을 최종적으로 판단하는 것이 아닙니다. 최종 검토 및 판단은 담당자, 심의위원회, 책임자 및 기관의 공식 절차에 따라 이루어짐을 알려드립니다.",
};

const TONE_CLOSING: Record<OpinionTone, string> = {
  공식적으로: "상기 사항에 대한 확인 또는 보완 자료를 회신하여 주시기 바랍니다. 문의사항은 IRB 행정간사에게 연락 부탁드립니다.",
  부드럽게: "확인해 주시고, 궁금하신 점이 있으면 언제든지 행정간사에게 편하게 연락 주세요. 감사합니다.",
  간단하게: "위 사항 확인 후 회신 부탁드립니다. 문의: IRB 행정간사.",
  상세하게:
    "상기 보완 권고사항 및 문서 간 불일치 확인 요청사항에 대한 회신 자료를 기한 내 제출하여 주시기 바라며, 회신 시 각 항목별 수정 여부를 함께 명시하여 주시면 검토에 도움이 됩니다. 추가 문의사항은 IRB 행정간사에게 연락하여 주시기 바랍니다.",
};

function bulletList(lines: string[], tone: OpinionTone): string {
  if (lines.length === 0) return tone === "간단하게" ? "- 해당 사항 없음" : "- 확인된 사항이 없습니다.";
  return lines.map((l) => `- ${l}`).join("\n");
}

export function generateOpinionDraft(
  project: ReviewProject,
  findings: ReviewFinding[],
  inconsistencies: DocumentInconsistency[],
  knowledgeBase: KnowledgeBaseItem[],
  tone: OpinionTone
): string {
  const recommendationLines = findings
    .filter((f) => f.category !== "연구자 확인 질문")
    .map((f) => (tone === "상세하게" ? `${f.title} — ${f.recommendation}` : f.title));

  const inconsistencyLines = inconsistencies.map(
    (i) => `${i.itemName}: ${i.finding}${tone === "상세하게" ? ` (담당자 확인 상태: ${i.confirmationStatus})` : ""}`
  );

  const questionLines = findings
    .filter((f) => f.category === "연구자 확인 질문")
    .map((f) => f.title);

  const basisIds = new Set(findings.flatMap((f) => f.basisIds));
  const basisLines = knowledgeBase
    .filter((kb) => basisIds.has(kb.id))
    .map((kb) => {
      const clause = kb.relatedClause && kb.relatedClause !== "-" ? ` - ${kb.relatedClause}` : "";
      return `${kb.title}${clause} (근거 후보, 담당자 최종 확인 필요)`;
    });

  const overview =
    tone === "간단하게"
      ? `접수번호 ${project.receiptNo} (${project.title}) 사전 검토 결과입니다.`
      : `접수번호 ${project.receiptNo} (${project.title})에 대해 제출하신 심의서류를 사전 검토하였습니다.`;

  return `[검토 개요]
${overview}

${TONE_OPENING[tone]}

[주요 보완 권고사항]
${bulletList(recommendationLines, tone)}

[문서 간 불일치 확인 요청사항]
${bulletList(inconsistencyLines, tone)}

[추가 확인이 필요한 사항]
${bulletList(questionLines, tone)}

[관련 근거 후보]
${bulletList(basisLines, tone)}

[회신 요청 문구]
${TONE_CLOSING[tone]}`;
}
