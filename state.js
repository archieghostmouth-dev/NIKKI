// Serverless diary store → Upstash Redis (REST, zero deps).
// One shared JSON blob so phone + laptop see the same diary.
// Env vars (auto-injected by the Vercel Upstash integration): KV_REST_API_URL, KV_REST_API_TOKEN
// Plus: APP_SECRET (your passphrase gate)
const KEY = "nikki:state";
async function cmd(arr) {
  const r = await fetch(process.env.KV_REST_API_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.KV_REST_API_TOKEN, "content-type": "application/json" },
    body: JSON.stringify(arr),
  });
  return r.json();
}
export default async function handler(req, res) {
  if ((req.headers["x-app-secret"] || "") !== process.env.APP_SECRET) {
    res.status(401).json({ error: "unauthorized" }); return;
  }
  try {
    if (req.method === "GET") {
      const { result } = await cmd(["GET", KEY]);
      res.status(200).json(result ? JSON.parse(result) : {});
      return;
    }
    if (req.method === "PUT" || req.method === "POST") {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      await cmd(["SET", KEY, body]);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: "GET or PUT" });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
