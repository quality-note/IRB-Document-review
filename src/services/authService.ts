// 로그인/인증 서비스 (현재는 브라우저 저장소 기반 mock 인증, 추후 Supabase Auth 연동 예정)
//
// 주의: 백엔드가 없는 현재 단계에서는 자격 증명이 프론트엔드 코드/브라우저 저장소에 존재하므로
// 이 로그인은 "타 직원의 접근을 막는 1차 확인 절차" 수준이며, 암호학적으로 안전한 인증이 아니다.
// 추후 Supabase Auth 등 실제 인증 서버 연동 시 이 파일 내부만 교체하면 되도록 인터페이스를 유지한다.

import type { UserRole } from "../types/review";

export interface AuthUser {
  id: string; // 로그인 ID (사번/이메일)
  name: string;
  role: UserRole;
}

interface Credential extends AuthUser {
  password: string;
}

const DEFAULT_CREDENTIALS: Credential[] = [
  { id: "l15057@mf.seegene.com", password: "1234", name: "백주환", role: "행정간사" },
  { id: "waoeh@mf.seegene.com", password: "5678", name: "오은하", role: "행정간사" },
];

const SESSION_KEY = "irb-review-auth-session";
const PASSWORD_OVERRIDE_KEY = "irb-review-auth-password-overrides";

function loadPasswordOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORD_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePasswordOverrides(overrides: Record<string, string>): void {
  localStorage.setItem(PASSWORD_OVERRIDE_KEY, JSON.stringify(overrides));
}

function currentPasswordFor(id: string): string | undefined {
  const overrides = loadPasswordOverrides();
  if (overrides[id]) return overrides[id];
  return DEFAULT_CREDENTIALS.find((c) => c.id === id)?.password;
}

export function login(id: string, password: string): AuthUser | null {
  const credential = DEFAULT_CREDENTIALS.find((c) => c.id === id);
  if (!credential) return null;
  if (currentPasswordFor(id) !== password) return null;

  const user: AuthUser = { id: credential.id, name: credential.name, role: credential.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function changePassword(id: string, currentPassword: string, newPassword: string): boolean {
  if (currentPasswordFor(id) !== currentPassword) return false;
  const overrides = loadPasswordOverrides();
  overrides[id] = newPassword;
  savePasswordOverrides(overrides);
  return true;
}
