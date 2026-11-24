"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { firebaseEnabled } from "@/lib/firebase/config";

type NavKey = "patients" | "free";

// Sidebar compartido. Solo dos items según el plan: Pacientes y Sesión libre.
export function Sidebar({ active, patientCount }: { active: NavKey; patientCount?: number }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-row">
          <div className="brand-mark" />
          <div className="brand-text">
            <span className="top">Código</span>
            <span className="bot">Cuántico</span>
          </div>
        </div>
        <div className="brand-sub">Terapia · Energética</div>
      </div>

      <div className="nav-section-label">Espacio</div>
      <nav className="nav">
        <Link href="/dashboard" className={`nav-item${active === "patients" ? " active" : ""}`}>
          <span className="ico">◉</span>
          <span>Pacientes</span>
          {patientCount !== undefined && (
            <span className="count">{String(patientCount).padStart(2, "0")}</span>
          )}
        </Link>
        <Link href="/session/libre" className={`nav-item${active === "free" ? " active" : ""}`}>
          <span className="ico">✦</span>
          <span>Sesión libre</span>
        </Link>
      </nav>

      <div className="sidebar-spacer" />

      <div className="user">
        <div className="user-avatar">{user?.initials ?? "··"}</div>
        <div className="user-meta">
          <span className="user-name">{user?.name ?? "Terapeuta"}</span>
          <span className="user-role">Terapeuta</span>
        </div>
        {firebaseEnabled && (
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer",
              fontSize: 15,
              padding: 4,
            }}
          >
            ⏻
          </button>
        )}
      </div>
    </aside>
  );
}
