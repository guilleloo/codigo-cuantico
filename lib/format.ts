const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// "2025-04-15" -> "15 abr 2025"
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")} ${MESES[m - 1]} ${y}`;
}

// Días relativos desde hoy en lenguaje corto.
export function fmtRel(iso: string): string {
  const then = new Date(iso + "T00:00:00").getTime();
  const days = Math.round((Date.now() - then) / 86400000);
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  const months = Math.round(days / 30);
  if (months < 12) return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.round(months / 12);
  return `hace ${years} ${years === 1 ? "año" : "años"}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
