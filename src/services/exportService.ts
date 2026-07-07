// 출력/내보내기 서비스
// 실제 서버사이드 PDF/Word 생성 전까지 브라우저 print 및 mock 다운로드로 구현한다.

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function printCurrentView(): void {
  window.print();
}

function buildHtmlDocument(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8" />
<title>${title}</title>
<style>
  body { font-family: "Malgun Gothic", "Noto Sans KR", sans-serif; color: #1f2937; line-height: 1.6; padding: 24px; }
  h1 { font-size: 20px; border-bottom: 2px solid #1f3350; padding-bottom: 8px; }
  h2 { font-size: 16px; color: #1f3350; margin-top: 20px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #d1d5db; padding: 6px 8px; font-size: 13px; text-align: left; }
  th { background: #eef2f8; }
  .notice { font-size: 12px; color: #4b5563; margin-top: 24px; border-top: 1px solid #d1d5db; padding-top: 12px; }
  pre { white-space: pre-wrap; font-family: inherit; }
</style>
</head><body>${bodyHtml}</body></html>`;
}

function downloadBlob(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Word에서 열람 가능한 형태(HTML 기반 .doc)로 내보낸다.
 * 실제 .docx 생성 라이브러리 연동 전까지의 임시 구현이다.
 */
export function exportAsWord(title: string, bodyHtml: string, fileName: string): void {
  const html = buildHtmlDocument(title, bodyHtml);
  downloadBlob(html, fileName.endsWith(".doc") ? fileName : `${fileName}.doc`, "application/msword");
}

/**
 * 브라우저 인쇄 기능을 통한 PDF 저장 안내(인쇄 대화상자에서 "PDF로 저장" 선택).
 * 실제 서버사이드 PDF 생성 라이브러리 연동 전까지의 임시 구현이다.
 */
export function exportAsPdf(): void {
  window.print();
}

export function textToSimpleHtml(text: string): string {
  return `<pre>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
}
