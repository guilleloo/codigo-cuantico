"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Toast, useToast } from "@/components/Toast";
import { db } from "@/lib/data";
import { getInitials, fmtDate, fmtRel } from "@/lib/format";
import type { Patient, Session } from "@/lib/types";

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pid = params.id;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<Session | null>(null);
  const { message, flash } = useToast();

  const refresh = useCallback(async () => {
    const p = await db.getPatient(pid);
    const s = await db.listSessions(pid);
    setPatient(p);
    setSessions(s);
    setLoading(false);
  }, [pid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const newSession = async () => {
    const s = await db.addSession(pid);
    router.push(`/patients/${pid}/sessions/${s.id}`);
  };

  const doDelete = async () => {
    if (!confirm) return;
    await db.removeSession(pid, confirm.id);
    setConfirm(null);
    refresh();
    flash("Sesión eliminada");
  };

  return (
    <div className="app">
      <Sidebar active="patients" />

      <main className="main">
        <div className="topbar compact">
          <Link href="/dashboard" className="back">
            <span className="arr">←</span> Volver a pacientes
          </Link>
          <div className="topbar-spacer" />
          <div className="crumb">
            <b>Pacientes</b>
            <span className="sep">/</span>
            <b>{patient ? patient.name : "—"}</b>
          </div>
          {patient && (
            <button className="btn-primary" onClick={newSession}>
              <span className="plus">+</span> Nueva sesión
            </button>
          )}
        </div>

        {loading ? (
          <div className="content narrow">
            <div className="empty-sessions">
              <div className="es-title">Cargando…</div>
            </div>
          </div>
        ) : !patient ? (
          <div className="content narrow">
            <div className="empty-sessions">
              <div className="es-title">Paciente no encontrado</div>
              <Link href="/dashboard" style={{ color: "var(--gold-light)" }}>
                ← Volver a pacientes
              </Link>
            </div>
          </div>
        ) : (
          <div className="content narrow">
            <div className="patient-header">
              <div className="big-avatar" style={{ background: patient.color }}>
                {getInitials(patient.name)}
                <span className="seal">✦</span>
              </div>
              <div className="ph-body">
                <div className="ph-top">
                  <div>
                    <div className="ph-name">{patient.name}</div>
                  </div>
                </div>
                <div className="ph-meta">
                  <span className="meta-item">
                    <span className="mi-ico glyph">◦</span>{" "}
                    {patient.age ? patient.age + " años" : "Edad —"}
                  </span>
                  <span className="meta-item is-email">
                    <span className="mi-ico">✉</span> {patient.email || "sin correo"}
                  </span>
                  <span className="meta-item">
                    <span className="mi-ico glyph">☎</span> {patient.phone || "—"}
                  </span>
                </div>
                {patient.notes && (
                  <div className="ph-notes">
                    <span className="quote">“</span>
                    {patient.notes}
                    <span className="quote">”</span>
                  </div>
                )}
              </div>
            </div>

            <div className="section-head">
              <span className="section-label">Historial de sesiones</span>
              <span className="section-count">
                {sessions.length} {sessions.length === 1 ? "sesión" : "sesiones"}
              </span>
              <div className="section-rule" />
              <div className="section-tools">
                Orden · <b>Más reciente</b> ↓
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="empty-sessions">
                <div className="es-title">Todavía no hay sesiones</div>
                <div>Crea la primera sesión para comenzar el historial.</div>
              </div>
            ) : (
              <div className="sessions">
                {sessions.map((s) => (
                  <SessionRow key={s.id} pid={pid} s={s} onDelete={() => setConfirm(s)} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {confirm && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setConfirm(null)}>
          <div className="modal sm">
            <div className="modal-head">
              <span className="modal-title">
                Eliminar <span className="accent">sesión</span>
              </span>
              <button className="modal-x" onClick={() => setConfirm(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body text">
              Se eliminará la sesión del{" "}
              <b style={{ color: "var(--text-primary)" }}>{fmtDate(confirm.date)}</b>. Esta acción no
              se puede deshacer.
            </div>
            <div className="modal-foot">
              <div className="spacer" />
              <button className="btn-ghost" onClick={() => setConfirm(null)}>
                Cancelar
              </button>
              <button className="btn-ghost danger" onClick={doDelete}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast message={message} />
    </div>
  );
}

function SessionRow({ pid, s, onDelete }: { pid: string; s: Session; onDelete: () => void }) {
  const temas = s.subjects.length;
  const bloqueos = s.blocks.length;
  const band = s.subjects[0]?.color ?? "#5a4a1a";
  return (
    <div className="session">
      <div className="session-band" style={{ background: band }} />
      <div className="session-date">
        <span className="sd-full">{fmtDate(s.date)}</span>
        <span className="sd-rel">{fmtRel(s.date)}</span>
      </div>
      <div className="session-body">
        <div className="session-title">{s.title}</div>
        <div className="session-badges">
          <span className="badge">
            <span className="bd temas" />
            <b>{temas}</b> {temas === 1 ? "tema" : "temas"}
          </span>
          <span className="badge">
            <span className="bd bloqueos" />
            <b>{bloqueos}</b> {bloqueos === 1 ? "bloqueo" : "bloqueos"}
          </span>
        </div>
      </div>
      <div className="session-actions">
        <Link href={`/patients/${pid}/sessions/${s.id}`} className="open-btn">
          Abrir sesión <span className="arr">→</span>
        </Link>
        <button className="del-btn" title="Eliminar sesión" onClick={onDelete}>
          ✕
        </button>
      </div>
    </div>
  );
}
