// Production server for Render (or any Node host).
//
// Does two things:
//   1. Serves the built SPA from /dist, falling back to index.html for any
//      unknown path (so /admin, /product/xyz, etc. all work on refresh).
//   2. Exposes POST /api/send-email, a small server-side relay to Resend.
//      Resend's secret API key lives only here (as the RESEND_API_KEY
//      environment variable) and is never sent to the browser. The
//      frontend already points at this same-origin endpoint by default
//      (Admin → Website content → Integrations → Email sending endpoint),
//      so nothing else needs to be deployed for transactional email to work.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "1mb" }));

app.post("/api/send-email", async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "RESEND_API_KEY is not set on the server." });
  }

  const { to, subject, html, from } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields: to, subject, html." });
  }

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: from || "Store <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });

    const data = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error("Resend API error:", data);
      return res.status(resendRes.status).json({ error: data?.message || "Resend API error" });
    }
    return res.json({ sent: true, id: data?.id });
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
    return res.status(500).json({ error: "Failed to reach Resend." });
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
