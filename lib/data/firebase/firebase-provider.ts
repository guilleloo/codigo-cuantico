import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { Auth } from "firebase/auth";
import type { DataProvider } from "../provider";
import type { Patient, Session, Subject } from "@/lib/types";
import { uid as genId } from "@/lib/format";
import { PALETTE, SESSION_DEFAULT_TITLE } from "@/lib/constants";
import { patientConverter, sessionConverter } from "./converters";

// Implementación de DataProvider sobre Firestore. Estructura (igual a la POC):
//   /patients/{patientId}           (con campo userId del terapeuta dueño)
//     /sessions/{sessionId}         (subcolección; subjects[]/blocks[] embebidos)
export class FirebaseProvider implements DataProvider {
  constructor(private db: Firestore, private auth: Auth) {}

  private get uid(): string {
    return this.auth.currentUser?.uid ?? "";
  }

  private patientsCol() {
    return collection(this.db, "patients").withConverter(patientConverter);
  }
  private patientRef(id: string) {
    return doc(this.db, "patients", id).withConverter(patientConverter);
  }
  private sessionsCol(patientId: string) {
    return collection(this.db, "patients", patientId, "sessions").withConverter(sessionConverter);
  }
  private sessionRef(patientId: string, sessionId: string) {
    return doc(this.db, "patients", patientId, "sessions", sessionId).withConverter(sessionConverter);
  }

  // ----- Pacientes -----
  async listPatients(): Promise<Patient[]> {
    const q = query(this.patientsCol(), where("userId", "==", this.uid), orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  }

  async getPatient(id: string): Promise<Patient | null> {
    const snap = await getDoc(this.patientRef(id));
    return snap.exists() ? snap.data() : null;
  }

  async addPatient(data: Partial<Patient>): Promise<Patient> {
    const now = Date.now();
    const patient: Patient = {
      id: "",
      userId: this.uid,
      name: data.name ?? "",
      age: data.age ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      notes: data.notes ?? "",
      color: data.color ?? PALETTE[0],
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(this.patientsCol(), patient);
    return { ...patient, id: ref.id };
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    const { id: _omit, createdAt: _c, ...rest } = data;
    await updateDoc(doc(this.db, "patients", id), { ...rest, updatedAt: serverTimestamp() });
  }

  async removePatient(id: string): Promise<void> {
    // Borra primero las sesiones de la subcolección, luego el paciente.
    const sessions = await getDocs(this.sessionsCol(id));
    await Promise.all(sessions.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(this.db, "patients", id));
  }

  // ----- Sesiones -----
  async listSessions(patientId: string): Promise<Session[]> {
    const q = query(this.sessionsCol(patientId), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  }

  async getSession(patientId: string, sessionId: string): Promise<Session | null> {
    const snap = await getDoc(this.sessionRef(patientId, sessionId));
    return snap.exists() ? snap.data() : null;
  }

  async addSession(patientId: string): Promise<Session> {
    const firstSubject: Subject = {
      id: genId("su"),
      name: "Tema principal",
      color: PALETTE[0],
      intensityBefore: 5,
      intensityAfter: 5,
    };
    const session: Session = {
      id: genId("s"),
      patientId,
      title: SESSION_DEFAULT_TITLE,
      date: new Date().toISOString().slice(0, 10),
      subjects: [firstSubject],
      blocks: [],
      updatedAt: Date.now(),
    };
    // id propio como id de documento para mantener referencias estables.
    await setDoc(this.sessionRef(patientId, session.id), session);
    return session;
  }

  async updateSession(patientId: string, sessionId: string, data: Partial<Session>): Promise<void> {
    const { id: _omit, patientId: _p, ...rest } = data;
    await updateDoc(doc(this.db, "patients", patientId, "sessions", sessionId), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  }

  async removeSession(patientId: string, sessionId: string): Promise<void> {
    await deleteDoc(doc(this.db, "patients", patientId, "sessions", sessionId));
  }
}
