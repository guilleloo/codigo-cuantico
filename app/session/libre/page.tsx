"use client";

import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";

export default function FreeSessionPage() {
  return (
    <div className="app">
      <Sidebar active="free" />
      <main className="main">
        <div className="topbar">
          <div className="title-block">
            <span className="title-eyebrow">Espacio</span>
            <h1 className="title">
              Sesión <span className="accent">libre</span>
            </h1>
          </div>
        </div>
        <div className="content">
          <div className="empty">
            <div className="e-title">Próximamente</div>
            <div>
              La sesión libre (sin paciente) se implementará en una próxima fase.{" "}
              <Link href="/dashboard" style={{ color: "var(--gold-light)" }}>
                Volver a pacientes
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
