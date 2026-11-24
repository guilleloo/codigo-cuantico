import type { DataProvider } from "./provider";
import type { Patient, Session, Subject } from "../types";
import { buildSeed, MOCK_USER } from "../seed";
import { uid } from "../format";
import { PALETTE, SESSION_DEFAULT_TITLE } from "../constants";

const KEY = "cc_mock_db_v1";

interface DB {
  patients: Patient[];
  sessions: Record<string, Session[]>;
}

function load(): DB {
  if (typeof window === "undefined") return { patients: [], sessions: {} };
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DB;
    } catch {
      /* fall through to reseed */
    }
  }
  const seed = buildSeed();
  window.localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function save(db: DB): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
}

// Simula latencia async para igualar el contrato de Firebase.
const ok = <T>(v: T): Promise<T> => Promise.resolve(v);

export class MockProvider implements DataProvider {
  async listPatients(): Promise<Patient[]> {
    const db = load();
    return ok([...db.patients].sort((a, b) => b.updatedAt - a.updatedAt));
  }

  async getPatient(id: string): Promise<Patient | null> {
    const db = load();
    return ok(db.patients.find((p) => p.id === id) ?? null);
  }

  async addPatient(data: Partial<Patient>): Promise<Patient> {
    const db = load();
    const now = Date.now();
    const patient: Patient = {
      id: uid("p"),
      userId: MOCK_USER.id,
      name: data.name ?? "",
      age: data.age ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      notes: data.notes ?? "",
      color: data.color ?? PALETTE[db.patients.length % PALETTE.length],
      createdAt: now,
      updatedAt: now,
    };
    db.patients.push(patient);
    db.sessions[patient.id] = [];
    save(db);
    return ok(patient);
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    const db = load();
    const i = db.patients.findIndex((p) => p.id === id);
    if (i >= 0) {
      db.patients[i] = { ...db.patients[i], ...data, updatedAt: Date.now() };
      save(db);
    }
    return ok(undefined);
  }

  async removePatient(id: string): Promise<void> {
    const db = load();
    db.patients = db.patients.filter((p) => p.id !== id);
    delete db.sessions[id];
    save(db);
    return ok(undefined);
  }

  async listSessions(patientId: string): Promise<Session[]> {
    const db = load();
    const list = db.sessions[patientId] ?? [];
    return ok([...list].sort((a, b) => b.date.localeCompare(a.date)));
  }

  async getSession(patientId: string, sessionId: string): Promise<Session | null> {
    const db = load();
    return ok((db.sessions[patientId] ?? []).find((s) => s.id === sessionId) ?? null);
  }

  async addSession(patientId: string): Promise<Session> {
    const db = load();
    const firstSubject: Subject = {
      id: uid("su"),
      name: "Tema principal",
      color: PALETTE[0],
      intensityBefore: 5,
      intensityAfter: 5,
    };
    const session: Session = {
      id: uid("s"),
      patientId,
      title: SESSION_DEFAULT_TITLE,
      date: new Date().toISOString().slice(0, 10),
      subjects: [firstSubject],
      blocks: [],
      updatedAt: Date.now(),
    };
    if (!db.sessions[patientId]) db.sessions[patientId] = [];
    db.sessions[patientId].unshift(session);
    save(db);
    return ok(session);
  }

  async updateSession(patientId: string, sessionId: string, data: Partial<Session>): Promise<void> {
    const db = load();
    const list = db.sessions[patientId] ?? [];
    const i = list.findIndex((s) => s.id === sessionId);
    if (i >= 0) {
      list[i] = { ...list[i], ...data, updatedAt: Date.now() };
      save(db);
    }
    return ok(undefined);
  }

  async removeSession(patientId: string, sessionId: string): Promise<void> {
    const db = load();
    db.sessions[patientId] = (db.sessions[patientId] ?? []).filter((s) => s.id !== sessionId);
    save(db);
    return ok(undefined);
  }
}
