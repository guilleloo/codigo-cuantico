"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Toast, useToast } from "@/components/Toast";
import { MailIcon, SearchIcon, EditIcon, TrashIcon } from "@/components/icons";
import { db } from "@/lib/data";
import { PALETTE } from "@/lib/constants";
import { getInitials, fmtRel } from "@/lib/format";
import type { Patient } from "@/lib/types";

interface Row extends Patient {
  sessionCount: number;
  lastDate: string | null;
}

type Form = { name: string; age: string; email: string; phone: string; notes: string; color: string };
const EMPTY_FORM: Form = { name: "", age: "", email: "", phone: "", notes: "", color: PALETTE[0] };

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ patient?: Patient } | null>(null);
  const [confirm, setConfirm] = useState<Patient | null>(null);
  const { message, flash } = useToast();

  const refresh = useCallback(async () => {
    const patients = await db.listPatients();
    const withMeta = await Promise.all(
      patients.map(async (p) => {
        const sessions = await db.listSessions(p.id);
        return { ...p, sessionCount: sessions.length, lastDate: sessions[0]?.date ?? null };
      })
    );
    setRows(withMeta);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const handleSave = async (form: Form) => {
    if (modal?.patient) {
      await db.updatePatient(modal.patient.id, form);
      flash("Paciente actualizado");
    } else {
      await db.addPatient(form);
      flash("Paciente creado");
    }
    setModal(null);
    refresh();
  };

  const handleDelete = async () => {
    if (!confirm) return;
    await db.removePatient(confirm.id);
    flash("Paciente eliminado");
    setConfirm(null);
    refresh();
  };

  return (
    <div className="app">
      <Sidebar active="patients" patientCount={rows.length} />

      <main className="main">
        <div className="topbar">
          <div className="title-block">
            <span className="title-eyebrow">Panel</span>
            <h1 className="title">
              Mis <span className="accent">Pacientes</span>
            </h1>
          </div>
          <div className="topbar-spacer" />
          <div className="search">
            <SearchIcon />
            <input
              placeholder="Buscar por nombre o email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <span className="search-kbd" style={{ cursor: "pointer" }} onClick={() => setQuery("")}>
                ✕
              </span>
            )}
          </div>
          <button className="btn-primary" onClick={() => setModal({})}>
            <span className="plus">+</span> Nuevo paciente
          </button>
        </div>

        <div className="content">
          <div className="meta-row">
            <div className="count-pill">
              Mostrando <b>{filtered.length}</b> de <b>{rows.length}</b> pacientes
            </div>
          </div>

          <div className="grid">
            {loading ? (
              <div className="empty">
                <div className="e-title">Cargando…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="e-title">Sin resultados</div>
                <div>Ningún paciente coincide con tu búsqueda.</div>
              </div>
            ) : (
              filtered.map((p) => (
                <PatientCard
                  key={p.id}
                  p={p}
                  onEdit={() => setModal({ patient: p })}
                  onDelete={() => setConfirm(p)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {modal && (
        <PatientModal
          initial={modal.patient}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {confirm && (
        <ConfirmModal name={confirm.name} onClose={() => setConfirm(null)} onConfirm={handleDelete} />
      )}
      <Toast message={message} />
    </div>
  );
}

function PatientCard({ p, onEdit, onDelete }: { p: Row; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="avatar" style={{ background: p.color }}>
          {getInitials(p.name)}
        </div>
        <div className="card-id">
          <div className="name">{p.name}</div>
          <div className="sub-line">
            <span className="age-pill">{p.age ? p.age + " años" : "Edad —"}</span>
          </div>
        </div>
        <div className="actions">
          <div className="act" title="Editar" onClick={onEdit}>
            <EditIcon />
          </div>
          <div className="act del" title="Eliminar" onClick={onDelete}>
            <TrashIcon />
          </div>
        </div>
      </div>

      <div className="email">
        <MailIcon /> {p.email || "sin correo"}
      </div>

      <div className="notes">
        <span className="tag">— </span>
        {p.notes || "Sin notas todavía."}
      </div>

      <div className="card-meta">
        <div className="meta">
          <span className="meta-k">Sesiones</span>
          <span className="meta-v">{p.sessionCount}</span>
        </div>
        <div className="meta">
          <span className="meta-k">Última</span>
          <span className="meta-v">{p.lastDate ? fmtRel(p.lastDate) : "—"}</span>
        </div>
      </div>

      <div className="card-foot">
        <Link href={`/patients/${p.id}`} className="history">
          Ver historial <span className="arr">→</span>
        </Link>
      </div>
    </div>
  );
}

function PatientModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Patient;
  onClose: () => void;
  onSave: (f: Form) => void;
}) {
  const [f, setF] = useState<Form>(
    initial
      ? {
          name: initial.name,
          age: initial.age,
          email: initial.email,
          phone: initial.phone,
          notes: initial.notes,
          color: initial.color,
        }
      : EMPTY_FORM
  );
  const set = (k: keyof Form, v: string) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim().length > 1;
  const isEdit = !!initial;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">
            {isEdit ? "Editar " : "Nuevo "}
            <span className="accent">paciente</span>
          </span>
          <button className="modal-x" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="mfield full">
            <label>Nombre completo</label>
            <input
              className="minput"
              autoFocus
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nombre y apellidos"
            />
          </div>
          <div className="mrow">
            <div className="mfield">
              <label>Edad</label>
              <input
                className="minput"
                type="number"
                value={f.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="mfield">
              <label>Teléfono</label>
              <input
                className="minput"
                value={f.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+34 …"
              />
            </div>
          </div>
          <div className="mfield full">
            <label>Correo</label>
            <input
              className="minput"
              value={f.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="correo@dominio.com"
            />
          </div>
          <div className="mfield full">
            <label>Color</label>
            <div className="swatches">
              {PALETTE.map((c) => (
                <span
                  key={c}
                  className={`swatch${f.color === c ? " sel" : ""}`}
                  style={{ background: c }}
                  onClick={() => set("color", c)}
                />
              ))}
            </div>
          </div>
          <div className="mfield full">
            <label>Notas</label>
            <textarea
              className="minput"
              value={f.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Observaciones de la primera consulta…"
            />
          </div>
        </div>
        <div className="modal-foot">
          <div className="spacer" />
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            style={{ opacity: valid ? 1 : 0.5, pointerEvents: valid ? "auto" : "none" }}
            onClick={() => onSave(f)}
          >
            <span className="plus">{isEdit ? "✓" : "+"}</span>{" "}
            {isEdit ? "Guardar cambios" : "Crear paciente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  name,
  onClose,
  onConfirm,
}: {
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal sm">
        <div className="modal-head">
          <span className="modal-title">
            Eliminar <span className="accent">paciente</span>
          </span>
          <button className="modal-x" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body text">
          Se eliminará <b style={{ color: "var(--text-primary)" }}>{name}</b> y todo su historial de
          sesiones. Esta acción no se puede deshacer.
        </div>
        <div className="modal-foot">
          <div className="spacer" />
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-ghost danger" onClick={onConfirm}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
