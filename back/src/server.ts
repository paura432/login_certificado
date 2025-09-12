import express from "express";
import cors from "cors";

const app = express();

// Detrás de ALB/NGINX para que req.secure respete X-Forwarded-Proto
app.set("trust proxy", 1);

// Como front y back van por el mismo dominio, esto basta:
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const h = (req: express.Request, name: string) =>
  (req.headers[name.toLowerCase()] as string | undefined) || "";

function parseDN(dn: string) {
  return dn
    .split("/")
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, kv) => {
      const [k, ...rest] = kv.split("=");
      acc[k] = rest.join("=");
      return acc;
    }, {});
}

app.post("/api/handshake", (req, res) => {
  console.log("[handshake] headers:", req.headers);
  res.status(204).end();
});

app.get("/api/certinfo", (req, res) => {
  console.log("[certinfo] headers:", req.headers);

  const verify = h(req, "x-ssl-client-verify");
  const serial = h(req, "x-ssl-client-serial");
  const sDN = h(req, "x-ssl-client-s-dn");
  const iDN = h(req, "x-ssl-client-i-dn");
  const notBefore = h(req, "x-ssl-client-notbefore");
  const notAfter = h(req, "x-ssl-client-notafter");
  const certPEM = h(req, "x-ssl-client-cert");
  const protocol = h(req, "x-ssl-protocol");
  const cipher = h(req, "x-ssl-cipher");

  const subject = parseDN(sDN);
  const issuer = parseDN(iDN);

  res.json({
    ok: true,
    verify: verify || "NONE",
    subject: {
      CN: subject.CN || "",
      O: subject.O || "",
      OU: subject.OU || "",
      raw: sDN,
    },
    issuer: {
      CN: issuer.CN || "",
      O: issuer.O || "",
      OU: issuer.OU || "",
      raw: iDN,
    },
    serial,
    notBefore,
    notAfter,
    tls: { protocol, cipher },
    certPEM,
  });
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`[back] escuchando en http://localhost:${PORT}`);
});
