"use client";

import { useEffect, useState, useCallback, type MouseEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Toast, useToast } from "@/components/Toast";
import { db } from "@/lib/data";
import { uid } from "@/lib/format";
import { PALETTE, BLOCK_TYPES, BLOCK_ORIGINS, CATEGORIES, type CategoryKey } from "@/lib/constants";
import type { Session, Subject, Block } from "@/lib/types";

function trackValue(e: MouseEvent<HTMLDivElement>): number {
  const r = e.currentTarget.getBoundingClientRect();
  const ratio = (e.clientX - r.left) / r.width;
  return Math.max(0, Math.min(10, Math.round(ratio * 10)));
}

const catLabel = (key: CategoryKey) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

type BlockForm = {
  subjectId: string;
  type: string;
  origin: string;
  age: string;
  releaseDays: string;
  categories: CategoryKey[];
  observations: string;
};

export default function SessionEditorPage() {
  const params = useParams<{ id: string; sid: string }>();
  const pid = params.id;
  const sid = params.sid;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [subjectModal, setSubjectModal] = useState<Subject | "new" | null>(null);
  const [confirmSubject, setConfirmSubject] = useState<Subject | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<Block | null>(null);
  const [form, setForm] = useState<BlockForm>({
    subjectId: "",
    type: BLOCK_TYPES[2],
    origin: BLOCK_ORIGINS[0],
    age: "",
    releaseDays: "",
    categories: ["simpleEmotions"],
    observations: "",
  });
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const { message, flash } = useToast();

  useEffect(() => {
    (async () => {
      const s = await db.getSession(pid, sid);
      setSession(s);
      if (s) {
        const first = s.subjects[0];
        setActiveSubjectId(first?.id ?? null);
        setForm((f) => ({ ...f, subjectId: first?.id ?? "" }));
      }
      setLoading(false);
    })();
  }, [pid, sid]);

  const persist = useCallback(
    (next: Session) => {
      setSession({ ...next });
      db.updateSession(pid, sid, next);
    },
    [pid, sid]
  );

  if (loading) {
    return (
      <div className="app">
        <Sidebar active="patients" />
        <main className="main flex-main">
          <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "var(--text-secondary)" }}>
            Cargando…
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app">
        <Sidebar active="patients" />
        <main className="main flex-main">
          <div style={{ display: "grid", placeItems: "center", height: "100vh", textAlign: "center" }}>
            <div>
              <div className="serif" style={{ fontStyle: "italic", fontSize: 24, color: "var(--text-secondary)", marginBottom: 10 }}>
                Sesión no encontrada
              </div>
              <Link href="/dashboard" style={{ color: "var(--gold-light)" }}>
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const setField = (k: "title" | "date", v: string) => persist({ ...session, [k]: v });

  // ----- Subjects -----
  const saveSubject = (data: { name: string; color: string; before: number; after: number }) => {
    const subjects = [...session.subjects];
    if (subjectModal && subjectModal !== "new") {
      const i = subjects.findIndex((s) => s.id === subjectModal.id);
      subjects[i] = { ...subjects[i], name: data.name, color: data.color, intensityBefore: data.before, intensityAfter: data.after };
    } else {
      const s: Subject = { id: uid("su"), name: data.name, color: data.color, intensityBefore: data.before, intensityAfter: data.after };
      subjects.unshift(s);
      setActiveSubjectId(s.id);
    }
    persist({ ...session, subjects });
    setSubjectModal(null);
    flash(subjectModal === "new" ? "Tema añadido" : "Tema actualizado");
  };

  const setIntensity = (id: string, field: "intensityBefore" | "intensityAfter", val: number) => {
    const subjects = session.subjects.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    persist({ ...session, subjects });
  };

  const deleteSubject = () => {
    if (!confirmSubject) return;
    persist({ ...session, subjects: session.subjects.filter((s) => s.id !== confirmSubject.id) });
    setConfirmSubject(null);
    flash("Tema eliminado");
  };

  // ----- Blocks -----
  const setF = (k: keyof BlockForm, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const toggleCat = (c: CategoryKey) =>
    setForm((p) => ({
      ...p,
      categories: p.categories.includes(c) ? p.categories.filter((x) => x !== c) : [...p.categories, c],
    }));
  const resetForm = () => {
    setForm({
      subjectId: session.subjects[0]?.id ?? "",
      type: BLOCK_TYPES[2],
      origin: BLOCK_ORIGINS[0],
      age: "",
      releaseDays: "",
      categories: ["simpleEmotions"],
      observations: "",
    });
    setEditingBlock(null);
  };

  const saveBlock = () => {
    if (!form.subjectId) {
      flash("Selecciona un tema primero");
      return;
    }
    const blocks = [...session.blocks];
    const payload = {
      subjectId: form.subjectId,
      type: form.type,
      origin: form.origin,
      age: form.age,
      releaseDays: form.releaseDays,
      categories: form.categories,
      observations: form.observations,
    };
    if (editingBlock) {
      const i = blocks.findIndex((b) => b.id === editingBlock);
      blocks[i] = { ...blocks[i], ...payload };
    } else {
      blocks.unshift({ id: uid("b"), ...payload });
    }
    persist({ ...session, blocks });
    resetForm();
    flash(editingBlock ? "Bloqueo actualizado" : "Bloqueo guardado");
  };

  const editBlock = (b: Block) => {
    setEditingBlock(b.id);
    setForm({
      subjectId: b.subjectId,
      type: b.type,
      origin: b.origin,
      age: b.age,
      releaseDays: b.releaseDays,
      categories: b.categories,
      observations: b.observations,
    });
  };

  const deleteBlock = () => {
    if (!confirmBlock) return;
    persist({ ...session, blocks: session.blocks.filter((b) => b.id !== confirmBlock.id) });
    if (editingBlock === confirmBlock.id) resetForm();
    setConfirmBlock(null);
    flash("Bloqueo eliminado");
  };

  const subjectName = (id: string) => session.subjects.find((s) => s.id === id)?.name ?? "—";
  const subjectColor = (id: string) => session.subjects.find((s) => s.id === id)?.color ?? "#5a4a1a";
  const backUrl = `/patients/${pid}`;

  return (
    <div className="app">
      <Sidebar active="patients" />

      <main className="main flex-main">
        <div className="session-bar">
          <div className="breadcrumb">
            <Link href={backUrl}>Paciente</Link>
            <span className="sep">/</span>
            <span>Sesión</span>
          </div>
          <div className="field-inline">
            <span className="fl">Título</span>
            <input className="title-input" value={session.title} onChange={(e) => setField("title", e.target.value)} />
          </div>
          <div className="field-inline">
            <span className="fl">Fecha</span>
            <input className="date-input" type="date" value={session.date} onChange={(e) => setField("date", e.target.value)} />
          </div>
          <div className="session-bar-spacer" />
          <div className="sb-actions">
            <button className="sb-btn save" onClick={() => flash("Sesión guardada")}>
              <span className="ic">💾</span> Guardar
            </button>
            <button className="sb-btn pdf" onClick={() => flash("Generación de PDF — próximamente")}>
              <span className="ic">📄</span> PDF
            </button>
            <Link href={backUrl} className="sb-btn close" title="Cerrar sesión">
              ✕
            </Link>
          </div>
        </div>

        <div className="editor">
          {/* Temas */}
          <div className="col-temas">
            <div className="col-header">
              <span className="col-title">
                Temas<span className="ct-count">· {session.subjects.length}</span>
              </span>
              <div className="col-header-spacer" />
              <button className="mini-btn" onClick={() => setSubjectModal("new")}>
                <span className="pl">+</span> Tema
              </button>
            </div>
            <div className="col-scroll">
              {session.subjects.length === 0 ? (
                <div className="empty-temas">
                  <div className="et-title">Sin temas</div>
                  <div>Añade un tema para registrar intensidades.</div>
                </div>
              ) : (
                <div className="temas-list">
                  {session.subjects.map((s) => (
                    <SubjectCard
                      key={s.id}
                      s={s}
                      active={s.id === activeSubjectId}
                      onSelect={() => setActiveSubjectId(s.id)}
                      onEdit={() => setSubjectModal(s)}
                      onDelete={() => setConfirmSubject(s)}
                      onSetIntensity={(field, val) => setIntensity(s.id, field, val)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bloqueos */}
          <div className="col-bloqueos col-scroll">
            <div className="bloqueo-panel">
              <div className="panel-head">
                <span className="panel-title">{editingBlock ? "Editar bloqueo" : "Bloqueo activo"}</span>
                <div className="panel-head-spacer" />
                <button className="mini-btn" onClick={saveBlock}>
                  <span className="pl">✓</span> {editingBlock ? "Actualizar" : "Guardar bloqueo"}
                </button>
              </div>

              {editingBlock && (
                <div className="editing-banner">
                  Editando un bloqueo guardado · <button onClick={resetForm}>cancelar</button>
                </div>
              )}

              <div className="form-grid">
                <div className="field">
                  <label>Tema</label>
                  <select className="control" value={form.subjectId} onChange={(e) => setF("subjectId", e.target.value)}>
                    {session.subjects.length === 0 && <option value="">Sin temas</option>}
                    {session.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Tipo de bloqueo</label>
                  <select className="control" value={form.type} onChange={(e) => setF("type", e.target.value)}>
                    {BLOCK_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Origen</label>
                  <select className="control" value={form.origin} onChange={(e) => setF("origin", e.target.value)}>
                    {BLOCK_ORIGINS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Edad</label>
                  <input className="control" type="number" value={form.age} onChange={(e) => setF("age", e.target.value)} placeholder="0" />
                </div>
                <div className="field">
                  <label>Días liberación</label>
                  <input className="control" type="number" value={form.releaseDays} onChange={(e) => setF("releaseDays", e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="block-label">Categorías</div>
              <div className="chips">
                {CATEGORIES.map((c) => (
                  <span
                    key={c.key}
                    className={`cat-chip${form.categories.includes(c.key) ? " active" : ""}`}
                    onClick={() => toggleCat(c.key)}
                  >
                    {c.label}
                  </span>
                ))}
              </div>

              <div className="obs-wrap">
                <div className="block-label">Observaciones</div>
                <textarea
                  className="obs"
                  value={form.observations}
                  onChange={(e) => setF("observations", e.target.value)}
                  placeholder="Describe cómo se manifiesta el bloqueo, su origen y el trabajo realizado…"
                />
              </div>

              <div className="divider">
                <span className="dl">Bloqueos guardados</span>
                <span className="dc">{session.blocks.length}</span>
                <span className="dr" />
              </div>

              {session.blocks.length === 0 ? (
                <div className="empty-saved">Aún no hay bloqueos guardados en esta sesión.</div>
              ) : (
                <div className="saved-list">
                  {session.blocks.map((b) => (
                    <div className="saved" key={b.id}>
                      <span className="saved-band" style={{ background: subjectColor(b.subjectId) }} />
                      <div className="saved-body">
                        <div className="saved-title">
                          {subjectName(b.subjectId)} <span className="type">· {b.type}</span>
                        </div>
                        <div className="saved-sub">
                          <span className="origin">{b.origin}</span>
                          <span className="dot" />
                          <span>{b.categories.length} categorías</span>
                        </div>
                      </div>
                      <div className="saved-acts">
                        <button className="saved-act" title="Editar" onClick={() => editBlock(b)}>
                          ✎
                        </button>
                        <button className="saved-act del" title="Eliminar" onClick={() => setConfirmBlock(b)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {subjectModal && (
        <SubjectModal
          initial={subjectModal === "new" ? null : subjectModal}
          onClose={() => setSubjectModal(null)}
          onSave={saveSubject}
        />
      )}
      {confirmSubject && (
        <ConfirmModal
          title={
            <>
              Eliminar <span style={{ color: "var(--gold-light)", fontStyle: "italic" }}>tema</span>
            </>
          }
          body={
            <>
              Se eliminará el tema <b style={{ color: "var(--text-primary)" }}>{confirmSubject.name}</b> de esta sesión.
            </>
          }
          onClose={() => setConfirmSubject(null)}
          onConfirm={deleteSubject}
        />
      )}
      {confirmBlock && (
        <ConfirmModal
          title={
            <>
              Eliminar <span style={{ color: "var(--gold-light)", fontStyle: "italic" }}>bloqueo</span>
            </>
          }
          body={
            <>
              Se eliminará el bloqueo de{" "}
              <b style={{ color: "var(--text-primary)" }}>{subjectName(confirmBlock.subjectId)}</b>.
            </>
          }
          onClose={() => setConfirmBlock(null)}
          onConfirm={deleteBlock}
        />
      )}
      <Toast message={message} />
    </div>
  );
}

function SubjectCard({
  s,
  active,
  onSelect,
  onEdit,
  onDelete,
  onSetIntensity,
}: {
  s: Subject;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetIntensity: (field: "intensityBefore" | "intensityAfter", val: number) => void;
}) {
  const delta = s.intensityBefore - s.intensityAfter;
  return (
    <div className={`tema${active ? " active" : ""}`} onClick={onSelect}>
      <div className="tema-top">
        <span className="tema-dot" style={{ background: s.color }} />
        <span className="tema-name">{s.name}</span>
        <div className="tema-acts">
          <div className="tema-act" title="Editar" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            ✎
          </div>
          <div className="tema-act del" title="Eliminar" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            ✕
          </div>
        </div>
      </div>
      <div className="intensity">
        <div className="int-row">
          <span className="int-label">Antes</span>
          <div
            className="int-track"
            title="Clic para ajustar"
            onClick={(e) => { e.stopPropagation(); onSetIntensity("intensityBefore", trackValue(e)); }}
          >
            <div className="int-fill before" style={{ width: s.intensityBefore * 10 + "%" }} />
          </div>
          <span className="int-val before">{s.intensityBefore}/10</span>
        </div>
        <div className="int-row">
          <span className="int-label">Después</span>
          <div
            className="int-track"
            title="Clic para ajustar"
            onClick={(e) => { e.stopPropagation(); onSetIntensity("intensityAfter", trackValue(e)); }}
          >
            <div className="int-fill after" style={{ width: s.intensityAfter * 10 + "%" }} />
          </div>
          <span className="int-val after">{s.intensityAfter}/10</span>
        </div>
      </div>
      <div className="tema-delta">
        {delta > 0 ? (
          <span>
            Mejora <b>-{delta}</b> puntos de intensidad
          </span>
        ) : (
          <span>Sin cambio registrado</span>
        )}
      </div>
    </div>
  );
}

function SubjectModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Subject | null;
  onClose: () => void;
  onSave: (d: { name: string; color: string; before: number; after: number }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);
  const [before, setBefore] = useState(initial?.intensityBefore ?? 7);
  const [after, setAfter] = useState(initial?.intensityAfter ?? 3);
  const valid = name.trim().length > 1;
  const isEdit = !!initial;

  const Stepper = ({ value, set, kind }: { value: number; set: (n: number) => void; kind: "before" | "after" }) => (
    <div className="mfield">
      <label>{kind === "before" ? "Intensidad antes" : "Intensidad después"}</label>
      <div className="stepper">
        <div className="stepper-track" onClick={(e) => set(trackValue(e))}>
          <div
            className="stepper-fill"
            style={{
              width: value * 10 + "%",
              background: kind === "before" ? "linear-gradient(90deg,#6a2424,#8a3030)" : "linear-gradient(90deg,#3a5a3a,#5a8a5a)",
            }}
          />
        </div>
        <span className="stepper-val" style={{ color: kind === "before" ? "#c98080" : "#5a8a5a" }}>
          {value}/10
        </span>
      </div>
    </div>
  );

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal sm">
        <div className="modal-head">
          <span className="modal-title">
            {isEdit ? "Editar " : "Nuevo "}
            <span className="accent">tema</span>
          </span>
          <button className="modal-x" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="mfield">
            <label>Nombre del tema</label>
            <input className="control" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="p. ej. Ansiedad general" />
          </div>
          <div className="mfield">
            <label>Color</label>
            <div className="swatches">
              {PALETTE.map((c) => (
                <span key={c} className={`swatch${color === c ? " sel" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>
          <Stepper value={before} set={setBefore} kind="before" />
          <Stepper value={after} set={setAfter} kind="after" />
        </div>
        <div className="modal-foot">
          <div className="spacer" />
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="mini-btn"
            style={{ opacity: valid ? 1 : 0.5, pointerEvents: valid ? "auto" : "none", height: 38, padding: "0 16px" }}
            onClick={() => onSave({ name, color, before, after })}
          >
            <span className="pl">{isEdit ? "✓" : "+"}</span> {isEdit ? "Guardar" : "Crear tema"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  body,
  onClose,
  onConfirm,
}: {
  title: React.ReactNode;
  body: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal sm">
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="modal-x" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body text">{body}</div>
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
