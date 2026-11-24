"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { firebaseEnabled, auth } from "@/lib/firebase/config";
import { getInitials } from "@/lib/format";
import { MOCK_USER } from "@/lib/seed";

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// En modo mock no hay login: el usuario es siempre MOCK_USER.
const mockUser: AuthUser = {
  uid: MOCK_USER.id,
  name: MOCK_USER.name,
  email: MOCK_USER.email,
  initials: MOCK_USER.initials,
};

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-email": "Email inválido",
  "auth/user-not-found": "Cuenta inexistente",
  "auth/wrong-password": "Contraseña incorrecta",
  "auth/email-already-in-use": "Email ya registrado",
  "auth/weak-password": "Mínimo 6 caracteres",
  "auth/too-many-requests": "Demasiados intentos, espera un momento",
  "auth/invalid-credential": "Credenciales incorrectas",
};

export function translateAuthError(code: string): string {
  return AUTH_ERRORS[code] ?? "No se pudo completar la operación";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(firebaseEnabled ? null : mockUser);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled || !auth) return;
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const name = fbUser.displayName ?? fbUser.email ?? "Terapeuta";
        setUser({
          uid: fbUser.uid,
          name,
          email: fbUser.email ?? "",
          initials: getInitials(name) || "TC",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!firebaseEnabled || !auth) return;
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!firebaseEnabled || !auth) return;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
  }, []);

  const logout = useCallback(async () => {
    if (!firebaseEnabled || !auth) return;
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
