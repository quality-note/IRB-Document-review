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

// 행정간사 기본 계정 (고정)
const DEFAULT_CREDENTIALS: Credential[] = [
  { id: "l15057@mf.seegene.com", password: "1234", name: "백주환", role: "행정간사" },
  { id: "waoeh@mf.seegene.com", password: "5678", name: "오은하", role: "행정간사" },
];

const SESSION_KEY = "irb-review-auth-session";
const PASSWORD_OVERRIDE_KEY = "irb-review-auth-password-overrides";
// 행정간사가 연구과제 등록 시 발급하는 연구담당자 계정 (localStorage에 동적으로 누적)
const DYNAMIC_USERS_KEY = "irb-review-auth-dynamic-users";

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

function loadDynamicUsers(): Credential[] {
  try {
    const raw = localStorage.getItem(DYNAMIC_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDynamicUsers(users: Credential[]): void {
  localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(users));
}

function findCredential(id: string): Credential | undefined {
  return DEFAULT_CREDENTIALS.find((c) => c.id === id) ?? loadDynamicUsers().find((c) => c.id === id);
}

function currentPasswordFor(id: string): string | undefined {
  const overrides = loadPasswordOverrides();
  if (overrides[id]) return overrides[id];
  return findCredential(id)?.password;
}

export function login(id: string, password: string): AuthUser | null {
  const credential = findCredential(id);
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

/**
 * 연구담당자(또는 그 외 역할) 계정을 발급한다. 행정간사가 검토 건 등록 시 사용.
 * 이미 존재하는 id면 이름/역할만 갱신하고 비밀번호는 그대로 둔다 (기존 계정 재사용 시나리오).
 * 반환값: 실제 로그인 가능한 AuthUser
 */
export function createUser(id: string, password: string, name: string, role: UserRole): AuthUser {
  if (DEFAULT_CREDENTIALS.some((c) => c.id === id)) {
    throw new Error("이미 기본 계정으로 등록된 ID입니다.");
  }
  const users = loadDynamicUsers();
  const existing = users.find((c) => c.id === id);
  if (existing) {
    existing.name = name;
    existing.role = role;
  } else {
    users.push({ id, password, name, role });
  }
  saveDynamicUsers(users);
  return { id, name, role };
}

export function findUserById(id: string): AuthUser | null {
  const credential = findCredential(id);
  return credential ? { id: credential.id, name: credential.name, role: credential.role } : null;
}

export function listUsersByRole(role: UserRole): AuthUser[] {
  return loadDynamicUsers()
    .filter((c) => c.role === role)
    .map((c) => ({ id: c.id, name: c.name, role: c.role }));
}
