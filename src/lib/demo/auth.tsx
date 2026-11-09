"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { DEMO_USER } from "./data";

const STORAGE_KEY = "sending-demo-auth";

type DemoUser = typeof DEMO_USER;
type StoredAuth = boolean | "pending";

type AuthContextValue = {
  user: DemoUser | null;
  ready: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readSignedIn(): StoredAuth {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const signedIn = useSyncExternalStore<StoredAuth>(subscribe, readSignedIn, () => "pending");
  const user = signedIn === true ? DEMO_USER : null;

  const login = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    emit();
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    emit();
  }, []);

  const value = useMemo(
    () => ({ user, ready: signedIn !== "pending", login, logout }),
    [user, signedIn, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useDemoAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useDemoAuth must be used within DemoAuthProvider");
  }
  return context;
}
