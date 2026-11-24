"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, translateAuthError } from "@/lib/auth/AuthContext";
import { firebaseEnabled } from "@/lib/firebase/config";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // En modo mock no hay login: entrar directo.
  if (!firebaseEnabled) {
    if (typeof window !== "undefined") router.replace("/dashboard");
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && name.trim().length < 2) {
      setError("Introduce tu nombre");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      router.replace("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setError(translateAuthError(code));
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand" style={{ borderBottom: "none", marginBottom: 8, paddingBottom: 8 }}>
          <div className="brand-row">
            <div className="brand-mark" />
            <div className="brand-text">
              <span className="top">Código</span>
              <span className="bot">Cuántico</span>
            </div>
          </div>
          <div className="brand-sub">Terapia · Energética</div>
        </div>

        <h1 className="auth-title">
          {mode === "login" ? "Bienvenida de nuevo" : "Crea tu cuenta"}
        </h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Accede para gestionar a tus pacientes."
            : "Empieza a registrar tus sesiones."}
        </p>

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <div className="mfield full">
              <label>Nombre</label>
              <input className="minput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoFocus />
            </div>
          )}
          <div className="mfield full">
            <label>Correo</label>
            <input className="minput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@dominio.com" autoFocus={mode === "login"} />
          </div>
          <div className="mfield full">
            <label>Contraseña</label>
            <input className="minput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: busy ? 0.6 : 1, pointerEvents: busy ? "none" : "auto" }}>
            {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button onClick={() => { setMode("register"); setError(""); }}>Regístrate</button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button onClick={() => { setMode("login"); setError(""); }}>Inicia sesión</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
