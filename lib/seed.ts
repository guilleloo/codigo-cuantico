import type { Patient, Session } from "./types";

// userId mock (un único terapeuta) hasta conectar Firebase Auth.
export const MOCK_USER = {
  id: "therapist-1",
  name: "Aurora Velasco",
  email: "aurora@codigocuantico.app",
  initials: "AV",
};

interface SeedShape {
  patients: Patient[];
  sessions: Record<string, Session[]>; // patientId -> sessions
}

export function buildSeed(): SeedShape {
  const u = MOCK_USER.id;
  const now = Date.now();
  const day = 86400000;

  const patients: Patient[] = [
    { id: "p1", userId: u, name: "María García", age: "34", phone: "+34 612 345 678", email: "maria@mail.com", notes: "Ansiedad y bloqueos emocionales. Trabajo con trauma de infancia y creencias limitantes.", color: "#2c4a6e", createdAt: now - 120 * day, updatedAt: now - 3 * day },
    { id: "p2", userId: u, name: "Carlos López", age: "28", phone: "+34 600 111 222", email: "carlos@mail.com", notes: "Trauma de infancia, creencias limitantes heredadas.", color: "#3a5a3a", createdAt: now - 90 * day, updatedAt: now - 10 * day },
    { id: "p3", userId: u, name: "Ana Martínez", age: "45", phone: "+34 633 444 555", email: "ana@mail.com", notes: "Dolor crónico, liberación energética.", color: "#6b2d2d", createdAt: now - 200 * day, updatedAt: now - 1 * day },
    { id: "p4", userId: u, name: "Roberto Silva", age: "52", phone: "+34 655 666 777", email: "roberto@mail.com", notes: "Depresión, bloqueos del corazón.", color: "#5a3a6b", createdAt: now - 60 * day, updatedAt: now - 20 * day },
    { id: "p5", userId: u, name: "Laura Pérez", age: "31", phone: "+34 688 999 000", email: "laura@mail.com", notes: "Relaciones, frases limitantes heredadas.", color: "#5a4a1a", createdAt: now - 45 * day, updatedAt: now - 5 * day },
    { id: "p6", userId: u, name: "Diego Torres", age: "39", phone: "+34 611 222 333", email: "diego@mail.com", notes: "Estrés laboral, trauma absorbido.", color: "#1a5a5a", createdAt: now - 30 * day, updatedAt: now - 2 * day },
  ];

  const sessions: Record<string, Session[]> = {
    p1: [
      {
        id: "s1", patientId: "p1", title: "Sesión de Código Cuántico", date: "2025-04-15", updatedAt: now - 3 * day,
        subjects: [
          { id: "su1", name: "Ansiedad general", color: "#2c4a6e", intensityBefore: 7, intensityAfter: 3 },
          { id: "su2", name: "Trauma de infancia", color: "#6b2d2d", intensityBefore: 9, intensityAfter: 5 },
          { id: "su3", name: "Relaciones", color: "#5a3a6b", intensityBefore: 6, intensityAfter: 4 },
        ],
        blocks: [
          { id: "b1", subjectId: "su1", type: "Sistema de creencias", origin: "Heredado", age: "12", releaseDays: "14", categories: ["simpleEmotions", "beliefs"], observations: "El paciente muestra resistencia al trabajar el bloqueo de raíz." },
          { id: "b2", subjectId: "su2", type: "Raíz", origin: "Vida pasada", age: "7", releaseDays: "21", categories: ["trauma", "limitingPhrases", "beliefs"], observations: "" },
        ],
      },
      { id: "s2", patientId: "p1", title: "Sesión de Código Cuántico", date: "2025-03-28", updatedAt: now - 30 * day, subjects: [{ id: "su4", name: "Estrés", color: "#5a4a1a", intensityBefore: 8, intensityAfter: 4 }, { id: "su5", name: "Sueño", color: "#1a5a5a", intensityBefore: 6, intensityAfter: 2 }], blocks: [{ id: "b3", subjectId: "su4", type: "Simple", origin: "Absorbido", age: "30", releaseDays: "7", categories: ["simpleEmotions"], observations: "" }] },
      { id: "s3", patientId: "p1", title: "Sesión de Código Cuántico", date: "2025-03-10", updatedAt: now - 50 * day, subjects: [{ id: "su6", name: "Miedo", color: "#6b2d2d", intensityBefore: 9, intensityAfter: 5 }], blocks: [] },
    ],
    p2: [
      { id: "s4", patientId: "p2", title: "Sesión de Código Cuántico", date: "2025-04-02", updatedAt: now - 10 * day, subjects: [{ id: "su7", name: "Autoestima", color: "#3a5a3a", intensityBefore: 8, intensityAfter: 3 }], blocks: [{ id: "b4", subjectId: "su7", type: "Creencia profunda", origin: "Heredado", age: "10", releaseDays: "14", categories: ["beliefs"], observations: "" }] },
    ],
    p3: [],
    p4: [],
    p5: [],
    p6: [],
  };

  return { patients, sessions };
}
