import { createContext, useContext, useState, type ReactNode } from "react";
import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  changePassword as changePasswordService,
  createUser as createUserService,
  findUserById,
  listUsersByRole,
  type AuthUser,
} from "../services/authService";
import type { UserRole } from "../types/review";

interface AuthContextValue {
  user: AuthUser | null;
  login: (id: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  createUser: (id: string, password: string, name: string, role: UserRole) => AuthUser;
  findUserById: (id: string) => AuthUser | null;
  listResearchers: () => AuthUser[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  const login = (id: string, password: string): boolean => {
    const loggedIn = loginService(id, password);
    if (!loggedIn) return false;
    setUser(loggedIn);
    return true;
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    return changePasswordService(user.id, currentPassword, newPassword);
  };

  const createUser = (id: string, password: string, name: string, role: UserRole): AuthUser =>
    createUserService(id, password, name, role);

  const listResearchers = (): AuthUser[] => listUsersByRole("연구담당자");

  return (
    <AuthContext.Provider
      value={{ user, login, logout, changePassword, createUser, findUserById, listResearchers }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
