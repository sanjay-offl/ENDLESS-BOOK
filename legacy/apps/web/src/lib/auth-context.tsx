"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, onAuthStateChanged, type User } from "./firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  token: string | null;
  role: "founder" | "member" | null;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, token: null, role: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, token: null, role: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const decoded = await user.getIdTokenResult();
        const role = (decoded.claims.role as "founder" | "member") || "member";
        setState({ user, loading: false, token, role });
      } else {
        setState({ user: null, loading: false, token: null, role: null });
      }
    });
    return unsub;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
