// Production server for Render (or any Node host).
//
// Does two things:
//   1. Serves the built SPA from /dist, falling back to index.html for any
//      unknown path (so /admin, /product/xyz, etc. all work on refresh).
//   2. Exposes POST /api/send-email, a small relay that sends through
//      Resend's SMTP endpoint (smtp.resend.com) using nodemailer.
//
// The SMTP host/port/API key can come from two places:
//   - Admin → Website content → Integrations (stored with the rest of the
//     shop's content, sent up with each request). Convenient, but this
//     content is stored in a publicly-readable table (see
//     supabase-schema.sql) — anyone who inspects network requests or
//     queries Supabase directly could read the API key from there.
//   - The RESEND_API_KEY (and optional RESEND_SMTP_HOST / RESEND_SMTP_PORT)
//     environment variables on this server. Never exposed to the browser.
//     If set, this always takes priority over whatever's in Admin →
//     Integrations, so the real secret can stay private.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "1mb" }));

const DEFAULT_SMTP_HOST = "smtp.resend.com";
const DEFAULT_SMTP_PORT = 465;

app.post("/api/send-email", async (req, res) => {
  const { to, subject, html, from, smtpHost, smtpPort, apiKey } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields: to, subject, html." });
  }

  // Env vars win when set — keeps the real API key off the browser/database
  // entirely for anyone who prefers that over the Admin-panel fields.
  const host = process.env.RESEND_SMTP_HOST || smtpHost || DEFAULT_SMTP_HOST;
  const port = Number(process.env.RESEND_SMTP_PORT || smtpPort || DEFAULT_SMTP_PORT);
  const key = process.env.RESEND_API_KEY || apiKey;

  if (!key) {
    return res.status(500).json({ error: "No Resend API key configured — set it in Admin → Website content → Integrations, or as RESEND_API_KEY on the server." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Resend: 465 = implicit TLS, 587/2587 = STARTTLS
      auth: { user: "resend", pass: key },
    });

    const info = await transporter.sendMail({
      from: from || "Store <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    return res.json({ sent: true, id: info?.messageId });
  } catch (err) {
    console.error("Failed to send email via Resend SMTP:", err);
    return res.status(500).json({ error: err?.message || "Failed to send email." });
  }
});

// Serve the built frontend.
const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));

// SPA fallback — send every other route to index.html (client-side router
// handles /admin, product pages, etc.).
app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
