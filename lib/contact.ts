export interface ContactInput {
  name: string; // 1..50 caracteres tras trim
  email: string; // formato válido, máx. 254
  msg: string; // 10..2000 caracteres tras trim
  website?: string; // honeypot: debe llegar vacío
}

export type ContactField = "name" | "email" | "msg";

export const CONTACT_LIMITS = {
  nameMax: 50,
  emailMax: 254,
  msgMin: 10,
  msgMax: 2000,
} as const;

// Formato práctico: algo@dominio.tld, sin espacios ni segundo "@".
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Devuelve los campos inválidos; lista vacía = válido. Sin dependencias, usable en cliente y servidor. */
export function validateContact(input: Partial<ContactInput>): ContactField[] {
  const invalid: ContactField[] = [];

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (name.length < 1 || name.length > CONTACT_LIMITS.nameMax) {
    invalid.push("name");
  }

  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (
    email.length === 0 ||
    email.length > CONTACT_LIMITS.emailMax ||
    !EMAIL_RE.test(email)
  ) {
    invalid.push("email");
  }

  const msg = typeof input.msg === "string" ? input.msg.trim() : "";
  if (msg.length < CONTACT_LIMITS.msgMin || msg.length > CONTACT_LIMITS.msgMax) {
    invalid.push("msg");
  }

  return invalid;
}
