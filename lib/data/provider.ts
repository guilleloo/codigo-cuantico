import type { Patient, Session } from "../types";

// Contrato de la capa de datos. El proveedor mock (localStorage) y el futuro
// proveedor Firebase implementan esta misma interface, de modo que los
// componentes no cambian al hacer el swap.
export interface DataProvider {
  // Pacientes
  listPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | null>;
  addPatient(data: Partial<Patient>): Promise<Patient>;
  updatePatient(id: string, data: Partial<Patient>): Promise<void>;
  removePatient(id: string): Promise<void>;

  // Sesiones (sub-colección del paciente)
  listSessions(patientId: string): Promise<Session[]>;
  getSession(patientId: string, sessionId: string): Promise<Session | null>;
  addSession(patientId: string): Promise<Session>;
  updateSession(patientId: string, sessionId: string, data: Partial<Session>): Promise<void>;
  removeSession(patientId: string, sessionId: string): Promise<void>;
}
