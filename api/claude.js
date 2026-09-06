// Serverless proxy → Anthropic. Keeps your API key server-side.
// Env vars needed (set in Vercel): ANTHROPIC_API_KEY, APP_SECRET
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  if ((req.headers["x-app-secret"] || "") !== process.env.APP_SECRET) {
    res.status(401).json({ error: "unauthorized" }); return;
  }
  try {
    const { system, messages, max_tokens } = req.body || {};
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 4000,
        system,
        messages,
      }),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
