import type { CategoryKey } from "./constants";

// Modelo de datos (nombres en inglés, alineado al esquema Firestore del plan).

export interface Patient {
  id: string;
  userId: string;
  name: string;
  age: string;
  phone: string;
  email: string;
  notes: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  intensityBefore: number; // 0-10
  intensityAfter: number; // 0-10
}

export interface Block {
  id: string;
  subjectId: string;
  type: string; // de BLOCK_TYPES
  origin: string; // de BLOCK_ORIGINS
  age: string;
  releaseDays: string;
  // Categorías activas en este bloqueo. Nota: el modelo final asociará a cada
  // categoría una lista de sub-ítems { value, age } (y combinedEmotions un
  // número); por ahora se registra qué categorías están presentes.
  categories: CategoryKey[];
  observations: string;
}

export interface Session {
  id: string;
  patientId: string;
  title: string;
  date: string; // YYYY-MM-DD
  subjects: Subject[];
  blocks: Block[];
  updatedAt: number;
}
