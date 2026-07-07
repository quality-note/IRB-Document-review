import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileSearch,
  ClipboardList,
  FileEdit,
  BookOpen,
  Database,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
  KeyRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "대시보드", icon: LayoutDashboard, end: true },
  { to: "/document-review", label: "문서 검토", icon: FileSearch },
  { to: "/review-results", label: "검토 결과", icon: ClipboardList },
  { to: "/opinion-draft", label: "행정의견 초안", icon: FileEdit },
  { to: "/knowledge-search", label: "근거자료 검색", icon: BookOpen },
  { to: "/knowledge-manage", label: "지식베이스 관리", icon: Database },
  { to: "/settings", label: "설정", icon: SettingsIcon },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-slate-50">
      <aside className="no-print flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-navy-900 text-slate-200">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <ShieldCheck className="h-6 w-6 text-teal-400" />
          <div>
            <p className="text-sm font-semibold text-white leading-tight">임상연구 심의문서</p>
            <p className="text-sm font-semibold text-white leading-tight">검토 지원 시스템</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4 text-xs text-slate-400">
          <p>행정검토 지원 도구</p>
          <p>최종 판단은 담당자·위원회가 수행</p>
        </div>
      </aside>
      <div className="app-main-col flex h-screen flex-1 flex-col overflow-hidden">
        <header className="no-print flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <p className="text-sm text-slate-500">IRB 행정간사 · 연구지원팀 내부 업무 시스템</p>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              로그인: {user?.name} ({user?.role})
            </span>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-navy-700"
            >
              <KeyRound className="h-3.5 w-3.5" />
              비밀번호 변경
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </button>
          </div>
        </header>
        <main className="app-main flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>

      {showPasswordModal && <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}

function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (!newPassword || newPassword.length < 4) {
      setError("새 비밀번호는 4자 이상 입력해 주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    const ok = changePassword(currentPassword, newPassword);
    if (!ok) {
      setError("현재 비밀번호가 올바르지 않습니다.");
      return;
    }
    setError("");
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy-900">비밀번호 변경</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-emerald-600">비밀번호가 변경되었습니다.</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-md bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
            >
              확인
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">현재 비밀번호</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">새 비밀번호</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">새 비밀번호 확인</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
              />
            </label>

            {error && <p className="text-xs text-rose-600">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-md bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
            >
              변경하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
