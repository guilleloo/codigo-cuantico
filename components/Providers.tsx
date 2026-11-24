"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { firebaseEnabled } from "@/lib/firebase/config";

// Puerta de autenticación. En modo mock deja pasar todo (no hay login).
// En modo Firebase: redirige a /login si no hay sesión, y fuera de /login si la hay.
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (!firebaseEnabled || loading) return;
    if (!user && !isLogin) router.replace("/login");
    if (user && isLogin) router.replace("/dashboard");
  }, [user, loading, isLogin, router]);

  if (firebaseEnabled && loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "var(--text-secondary)" }}>
        Cargando…
      </div>
    );
  }
  // Evita un flash de contenido protegido antes de redirigir.
  if (firebaseEnabled && !user && !isLogin) return null;
  if (firebaseEnabled && user && isLogin) return null;

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
