import {
  Timestamp,
  serverTimestamp,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import type { Patient, Session } from "@/lib/types";

// Mapea entre los objetos TS de la app y los documentos Firestore.
// Resuelve la conversión Timestamp <-> number (epoch ms).

export const patientConverter: FirestoreDataConverter<Patient> = {
  toFirestore(p) {
    return {
      userId: p.userId,
      name: p.name,
      age: p.age,
      phone: p.phone,
      email: p.email,
      notes: p.notes,
      color: p.color,
      createdAt: typeof p.createdAt === "number" ? Timestamp.fromMillis(p.createdAt) : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(snap: QueryDocumentSnapshot): Patient {
    const d = snap.data();
    return {
      id: snap.id,
      userId: d.userId ?? "",
      name: d.name ?? "",
      age: d.age ?? "",
      phone: d.phone ?? "",
      email: d.email ?? "",
      notes: d.notes ?? "",
      color: d.color ?? "#2c4a6e",
      createdAt: (d.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
      updatedAt: (d.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
    };
  },
};

export const sessionConverter: FirestoreDataConverter<Session> = {
  toFirestore(s) {
    // subjects[] y blocks[] se guardan embebidos como arrays de objetos planos.
    return {
      patientId: s.patientId,
      title: s.title,
      date: s.date,
      subjects: s.subjects,
      blocks: s.blocks,
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(snap: QueryDocumentSnapshot): Session {
    const d = snap.data();
    return {
      id: snap.id,
      patientId: d.patientId ?? "",
      title: d.title ?? "",
      date: d.date ?? "",
      subjects: d.subjects ?? [],
      blocks: d.blocks ?? [],
      updatedAt: (d.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
    };
  },
};
