import { Copy, Save, FileDown, Printer, Check } from "lucide-react";
import { useState } from "react";
import { OPINION_TONES, type OpinionTone } from "../types/review";

interface Props {
  tone: OpinionTone;
  onToneChange: (tone: OpinionTone) => void;
  content: string;
  onContentChange: (content: string) => void;
  onGenerate: () => void;
  onCopy: () => void;
  onSave: () => void;
  onExportWord: () => void;
  onExportPdf: () => void;
  saved?: boolean;
}

export default function OpinionEditor({
  tone,
  onToneChange,
  content,
  onContentChange,
  onGenerate,
  onCopy,
  onSave,
  onExportWord,
  onExportPdf,
  saved,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">문체</span>
          <div className="flex overflow-hidden rounded-md border border-slate-300">
            {OPINION_TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onToneChange(t)}
                className={`px-3 py-1.5 text-sm ${
                  tone === t ? "bg-navy-700 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
        >
          초안 다시 생성
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        rows={22}
        className="mt-4 w-full resize-y rounded-lg border border-slate-300 bg-white p-4 font-nanum text-[14px] leading-relaxed text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "복사됨" : "복사하기"}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <Save className="h-4 w-4" />
          {saved ? "저장됨" : "저장하기"}
        </button>
        <button
          type="button"
          onClick={onExportWord}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <FileDown className="h-4 w-4" />
          Word 출력
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          PDF 출력
        </button>
        <span className="ml-auto text-xs text-slate-400">
          본 초안은 담당자 수정 후 확정하는 구조이며, 연구자에게 자동 발송되지 않습니다.
        </span>
      </div>
    </div>
  );
}
