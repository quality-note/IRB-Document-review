import { useRef, useState } from "react";
import { UploadCloud, FileText, Sparkles, Loader2 } from "lucide-react";
import { DOCUMENT_TYPES, type DocumentType, type UploadedDocument } from "../types/review";
import { formatDateTime } from "../utils/formatting";
import SafetyNotice from "./SafetyNotice";

interface Props {
  documents: UploadedDocument[];
  onUpload: (documentType: DocumentType, fileName: string) => void;
  onRunReview: () => void;
  isRunning: boolean;
  disabled?: boolean;
}

export default function FileUploadPanel({ documents, onUpload, onRunReview, isRunning, disabled }: Props) {
  const [documentType, setDocumentType] = useState<DocumentType>(DOCUMENT_TYPES[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => onUpload(documentType, file.name));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-navy-800">심의서류 업로드</h3>
      <p className="mt-1 text-xs text-slate-500">업로드 후 문서 목록에서 확인하고, AI 검토 실행 버튼을 눌러 사전 검토를 진행해 주세요.</p>

      <SafetyNotice type="uploadPrivacy" className="mt-3" />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 hover:border-teal-400 hover:text-teal-600">
          <UploadCloud className="h-4 w-4" />
          파일을 선택하거나 이곳에 드래그하세요
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      <div className="mt-4 space-y-2">
        {documents.length === 0 && (
          <p className="rounded-md bg-slate-50 px-3 py-4 text-center text-sm text-slate-400">
            업로드된 문서가 없습니다.
          </p>
        )}
        {documents.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
            <div className="flex items-center gap-2 truncate">
              <FileText className="h-4 w-4 shrink-0 text-navy-400" />
              {d.fileUrl && d.fileUrl !== "#" ? (
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-teal-700 hover:underline"
                >
                  {d.fileName}
                </a>
              ) : (
                <span className="truncate text-slate-700">{d.fileName}</span>
              )}
              <span className="shrink-0 rounded-full bg-navy-50 px-2 py-0.5 text-xs text-navy-600">{d.documentType}</span>
            </div>
            <span className="shrink-0 pl-2 text-xs text-slate-400">{formatDateTime(d.uploadedAt)}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onRunReview}
          disabled={disabled || isRunning || documents.length === 0}
          className="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isRunning ? "AI 검토 실행 중..." : "AI 검토 실행"}
        </button>
      </div>
    </div>
  );
}
