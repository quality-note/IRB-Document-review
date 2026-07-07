import { useState, type FormEvent } from "react";
import { ShieldCheck, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = login(id.trim(), password);
    if (!ok) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900">
            <ShieldCheck className="h-6 w-6 text-teal-400" />
          </div>
          <h1 className="mt-4 text-base font-semibold text-navy-900">임상연구 심의문서</h1>
          <h1 className="text-base font-semibold text-navy-900">검토 지원 시스템</h1>
          <p className="mt-1.5 text-xs text-slate-500">담당 직원만 접근할 수 있는 내부 업무 시스템입니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">아이디</span>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="사번 또는 이메일"
              autoComplete="username"
              className="input"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="input"
            />
          </label>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800"
          >
            <LogIn className="h-4 w-4" />
            로그인
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          본 시스템은 심의서류 행정검토를 지원하는 참고 도구이며, 최종 판단은 담당자·심의위원회가 수행합니다.
        </p>
      </div>
    </div>
  );
}
