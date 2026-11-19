import { Resend } from "resend";
import { validateContact, type ContactInput } from "@/lib/contact";

export async function POST(request: Request) {
  let body: Partial<ContactInput>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return Response.json({ ok: false, fields: ["name", "email", "msg"] }, { status: 400 });
    }
    body = parsed as Partial<ContactInput>;
  } catch {
    return Response.json({ ok: false, fields: ["name", "email", "msg"] }, { status: 400 });
  }

  // Honeypot: los bots lo rellenan. Respondemos éxito sin enviar nada.
  if (typeof body.website === "string" && body.website.length > 0) {
    return Response.json({ ok: true });
  }

  const fields = validateContact(body);
  if (fields.length > 0) {
    return Response.json({ ok: false, fields }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  const name = (body.name as string).trim();
  const email = (body.email as string).trim();
  const msg = (body.msg as string).trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name.replace(/[\r\n]+/g, " ")}`,
      text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${msg}\n`,
    });
    if (error) {
      return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } catch {
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
