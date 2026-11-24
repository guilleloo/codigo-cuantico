// Datos maestros. En producción estos vivirán en Firestore (colecciones
// blockTypes / blockOrigins, editables desde el Panel Admin). Por ahora se
// siembran aquí como valores predefinidos.

export const PALETTE = [
  "#2c4a6e",
  "#3a5a3a",
  "#6b2d2d",
  "#5a3a6b",
  "#5a4a1a",
  "#1a5a5a",
  "#4a2c1a",
  "#1a3a5a",
  "#5a1a3a",
  "#2c2c2a",
] as const;

export const BLOCK_TYPES = [
  "Simple",
  "Raíz",
  "Sistema de creencias",
  "Creencia profunda",
  "Bloqueo físico",
  "Bloqueo del alma",
  "Bloqueo del espíritu",
  "Bloqueo vibracional",
  "Bloqueo del corazón",
  "Ataque energético",
  "Ataque espiritual",
  "Conexión negativa",
  "Personalidad negativa",
  "Memoria",
  "Entidades",
] as const;

export const BLOCK_ORIGINS = [
  "Heredado",
  "Absorbido",
  "Vida pasada",
  "Compartido",
  "Prenatal",
] as const;

// Las 5 categorías de bloqueo. La key es la usada en el modelo (Firestore);
// el label es lo que se muestra en la UI.
export const CATEGORIES = [
  { key: "simpleEmotions", label: "Emociones simples" },
  { key: "combinedEmotions", label: "Emociones combinadas" },
  { key: "beliefs", label: "Creencias" },
  { key: "trauma", label: "Trauma" },
  { key: "limitingPhrases", label: "Frases limitantes" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export const SESSION_DEFAULT_TITLE = "Sesión de Código Cuántico";
