// 전역 데이터 저장소 (현재는 메모리 상태, 추후 Supabase 연동 시 각 함수 내부만 교체)
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  ReviewProject,
  UploadedDocument,
  ReviewFinding,
  DocumentInconsistency,
  OpinionDraft,
  StaffMemo,
  OpinionTone,
  DocumentType,
  FindingCategory,
  Severity,
} from "../types/review";
import type { KnowledgeBaseItem } from "../types/knowledgeBase";
import {
  mockProjects,
  mockDocuments,
  mockFindings,
  mockInconsistencies,
  mockOpinionDrafts,
  mockStaffMemos,
  mockKnowledgeBase,
} from "../services/mockData";
import { analyzeDocuments } from "../services/aiReviewService";
import { generateId } from "../utils/formatting";

interface NewProjectInput {
  receiptNo: string;
  title: string;
  principalInvestigator: string;
  department: string;
  studyType: ReviewProject["studyType"];
  reviewer: string;
  receivedDate: string;
  memo: string;
  researcherId?: string;
}

interface ReviewDataContextValue {
  projects: ReviewProject[];
  documents: UploadedDocument[];
  findings: ReviewFinding[];
  inconsistencies: DocumentInconsistency[];
  opinionDrafts: OpinionDraft[];
  staffMemos: StaffMemo[];
  knowledgeBase: KnowledgeBaseItem[];
  aiAnalysisEnabled: boolean;
  setAiAnalysisEnabled: (v: boolean) => void;

  getProject: (id: string) => ReviewProject | undefined;
  getProjectsByResearcher: (researcherId: string) => ReviewProject[];
  getDocumentsByProject: (id: string) => UploadedDocument[];
  getFindingsByProject: (id: string) => ReviewFinding[];
  getInconsistenciesByProject: (id: string) => DocumentInconsistency[];
  getOpinionDraftsByProject: (id: string) => OpinionDraft[];
  getStaffMemosByProject: (id: string) => StaffMemo[];

  createProject: (input: NewProjectInput) => ReviewProject;
  updateProjectStatus: (id: string, status: ReviewProject["status"]) => void;
  assignResearcher: (id: string, researcherId: string) => void;
  addDocument: (projectId: string, documentType: DocumentType, fileName: string, uploadedBy?: string) => void;
  runAiReview: (projectId: string) => Promise<{ findingsCount: number; inconsistenciesCount: number; summary: string }>;

  // 행정간사가 근거자료 기반 AI 검토 외에 수기로 직접 추가하는 검토 항목
  addManualFinding: (input: {
    projectId: string;
    category: FindingCategory;
    severity: Severity;
    title: string;
    description: string;
    sourceDocument: string;
    recommendation: string;
    basisIds: string[];
  }) => void;
  addManualInconsistency: (input: {
    projectId: string;
    itemName: string;
    protocolValue: string;
    consentValue: string;
    reportValue: string;
    otherValue: string;
    finding: string;
  }) => void;

  toggleFindingResolved: (findingId: string) => void;
  updateInconsistencyStatus: (id: string, status: DocumentInconsistency["confirmationStatus"]) => void;
  updateFindingResponse: (findingId: string, response: string) => void;
  updateInconsistencyResponse: (id: string, response: string) => void;

  // 담당자 워크플로우: 행정간사가 담당자에게 전달 → 담당자가 답변 제출 → 행정간사가 최종 접수
  sendToResearcher: (projectId: string) => void;
  submitResearcherResponse: (projectId: string) => void;
  finalizeProject: (projectId: string) => void;

  saveOpinionDraft: (projectId: string, tone: OpinionTone, content: string, createdBy: string) => OpinionDraft;
  addStaffMemo: (projectId: string, author: string, content: string) => void;

  addKnowledgeBaseItem: (item: Omit<KnowledgeBaseItem, "id" | "createdAt" | "updatedAt">) => void;
  updateKnowledgeBaseItem: (id: string, patch: Partial<KnowledgeBaseItem>) => void;
  deleteKnowledgeBaseItem: (id: string) => void;
}

const ReviewDataContext = createContext<ReviewDataContextValue | null>(null);

export function ReviewDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ReviewProject[]>(mockProjects);
  const [documents, setDocuments] = useState<UploadedDocument[]>(mockDocuments);
  const [findings, setFindings] = useState<ReviewFinding[]>(mockFindings);
  const [inconsistencies, setInconsistencies] = useState<DocumentInconsistency[]>(mockInconsistencies);
  const [opinionDrafts, setOpinionDrafts] = useState<OpinionDraft[]>(mockOpinionDrafts);
  const [staffMemos, setStaffMemos] = useState<StaffMemo[]>(mockStaffMemos);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>(mockKnowledgeBase);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);

  const value = useMemo<ReviewDataContextValue>(() => {
    const getProject = (id: string) => projects.find((p) => p.id === id);
    const getProjectsByResearcher = (researcherId: string) =>
      projects.filter((p) => p.researcherId === researcherId);
    const getDocumentsByProject = (id: string) => documents.filter((d) => d.projectId === id);
    const getFindingsByProject = (id: string) => findings.filter((f) => f.projectId === id);
    const getInconsistenciesByProject = (id: string) => inconsistencies.filter((i) => i.projectId === id);
    const getOpinionDraftsByProject = (id: string) => opinionDrafts.filter((o) => o.projectId === id);
    const getStaffMemosByProject = (id: string) => staffMemos.filter((m) => m.projectId === id);

    const createProject = (input: NewProjectInput): ReviewProject => {
      const now = new Date().toISOString();
      const project: ReviewProject = {
        id: generateId("proj"),
        ...input,
        status: "임시저장",
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [project, ...prev]);
      return project;
    };

    const assignResearcher = (id: string, researcherId: string) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, researcherId, updatedAt: new Date().toISOString() } : p))
      );
    };

    const updateProjectStatus = (id: string, status: ReviewProject["status"]) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p))
      );
    };

    const addDocument = (projectId: string, documentType: DocumentType, fileName: string, uploadedBy?: string) => {
      const doc: UploadedDocument = {
        id: generateId("doc"),
        projectId,
        documentType,
        fileName,
        fileUrl: "#",
        uploadedAt: new Date().toISOString(),
        uploadedBy,
      };
      setDocuments((prev) => [...prev, doc]);
    };

    const runAiReview = async (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");
      const projectDocs = documents.filter((d) => d.projectId === projectId);
      const result = await analyzeDocuments(project, projectDocs, knowledgeBase);
      // 재검토 시 이전 검토 결과를 새 결과로 교체한다 (중복 누적 방지)
      setFindings((prev) => [...prev.filter((f) => f.projectId !== projectId), ...result.findings]);
      setInconsistencies((prev) => [
        ...prev.filter((i) => i.projectId !== projectId),
        ...result.inconsistencies,
      ]);
      updateProjectStatus(projectId, result.findings.length > 0 ? "보완 권고" : "검토 중");
      return {
        findingsCount: result.findings.length,
        inconsistenciesCount: result.inconsistencies.length,
        summary: result.summary,
      };
    };

    const addManualFinding: ReviewDataContextValue["addManualFinding"] = (input) => {
      const finding: ReviewFinding = {
        id: generateId("find"),
        projectId: input.projectId,
        category: input.category,
        severity: input.severity,
        title: input.title,
        description: input.description,
        sourceDocument: input.sourceDocument || "-",
        recommendation: input.recommendation,
        basisIds: input.basisIds,
        humanReviewRequired: true,
        resolved: false,
        createdAt: new Date().toISOString(),
      };
      setFindings((prev) => [...prev, finding]);
    };

    const addManualInconsistency: ReviewDataContextValue["addManualInconsistency"] = (input) => {
      const inconsistency: DocumentInconsistency = {
        id: generateId("incon"),
        projectId: input.projectId,
        createdAt: new Date().toISOString(),
        itemName: input.itemName,
        protocolValue: input.protocolValue || "-",
        consentValue: input.consentValue || "-",
        reportValue: input.reportValue || "-",
        otherValue: input.otherValue || "-",
        finding: input.finding,
        confirmationStatus: "미확인",
      };
      setInconsistencies((prev) => [...prev, inconsistency]);
    };

    const toggleFindingResolved = (findingId: string) => {
      setFindings((prev) =>
        prev.map((f) => (f.id === findingId ? { ...f, resolved: !f.resolved } : f))
      );
    };

    const updateInconsistencyStatus = (id: string, status: DocumentInconsistency["confirmationStatus"]) => {
      setInconsistencies((prev) => prev.map((i) => (i.id === id ? { ...i, confirmationStatus: status } : i)));
    };

    const updateFindingResponse = (findingId: string, response: string) => {
      setFindings((prev) =>
        prev.map((f) =>
          f.id === findingId
            ? { ...f, researcherResponse: response, researcherRespondedAt: new Date().toISOString() }
            : f
        )
      );
    };

    const updateInconsistencyResponse = (id: string, response: string) => {
      setInconsistencies((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, researcherResponse: response, researcherRespondedAt: new Date().toISOString() }
            : i
        )
      );
    };

    const sendToResearcher = (projectId: string) => {
      updateProjectStatus(projectId, "담당자 확인 중");
    };

    const submitResearcherResponse = (projectId: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, researcherSubmittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : p
        )
      );
    };

    const finalizeProject = (projectId: string) => {
      updateProjectStatus(projectId, "완료");
    };

    const saveOpinionDraft = (projectId: string, tone: OpinionTone, content: string, createdBy: string) => {
      const now = new Date().toISOString();
      const draft: OpinionDraft = {
        id: generateId("opinion"),
        projectId,
        tone,
        content,
        createdBy,
        createdAt: now,
        updatedAt: now,
      };
      setOpinionDrafts((prev) => [draft, ...prev]);
      return draft;
    };

    const addStaffMemo = (projectId: string, author: string, content: string) => {
      const memo: StaffMemo = {
        id: generateId("memo"),
        projectId,
        author,
        content,
        createdAt: new Date().toISOString(),
      };
      setStaffMemos((prev) => [memo, ...prev]);
    };

    const addKnowledgeBaseItem = (item: Omit<KnowledgeBaseItem, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const kbItem: KnowledgeBaseItem = {
        ...item,
        id: generateId("kb"),
        createdAt: now,
        updatedAt: now,
      };
      setKnowledgeBase((prev) => [kbItem, ...prev]);
    };

    const updateKnowledgeBaseItem = (id: string, patch: Partial<KnowledgeBaseItem>) => {
      setKnowledgeBase((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
        )
      );
    };

    const deleteKnowledgeBaseItem = (id: string) => {
      setKnowledgeBase((prev) => prev.filter((item) => item.id !== id));
    };

    return {
      projects,
      documents,
      findings,
      inconsistencies,
      opinionDrafts,
      staffMemos,
      knowledgeBase,
      aiAnalysisEnabled,
      setAiAnalysisEnabled,
      getProject,
      getProjectsByResearcher,
      getDocumentsByProject,
      getFindingsByProject,
      getInconsistenciesByProject,
      getOpinionDraftsByProject,
      getStaffMemosByProject,
      createProject,
      updateProjectStatus,
      assignResearcher,
      addDocument,
      runAiReview,
      addManualFinding,
      addManualInconsistency,
      toggleFindingResolved,
      updateInconsistencyStatus,
      updateFindingResponse,
      updateInconsistencyResponse,
      sendToResearcher,
      submitResearcherResponse,
      finalizeProject,
      saveOpinionDraft,
      addStaffMemo,
      addKnowledgeBaseItem,
      updateKnowledgeBaseItem,
      deleteKnowledgeBaseItem,
    };
  }, [
    projects,
    documents,
    findings,
    inconsistencies,
    opinionDrafts,
    staffMemos,
    knowledgeBase,
    aiAnalysisEnabled,
  ]);

  return <ReviewDataContext.Provider value={value}>{children}</ReviewDataContext.Provider>;
}

export function useReviewData(): ReviewDataContextValue {
  const ctx = useContext(ReviewDataContext);
  if (!ctx) throw new Error("useReviewData must be used within ReviewDataProvider");
  return ctx;
}
