// backend/server.ts
import fs from 'fs';
import https from 'https';
import path from 'path';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/login', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const cert = (req.socket as any).getPeerCertificate(true);

  if (!cert || Object.keys(cert).length === 0) {
    return res.status(401).json({ error: 'Certificado requerido o inválido.' });
  }

  const { subject = {}, issuerCertificate, issuer, raw, pubkey, ...rest } = cert;

  const subjectFields = Object.entries(subject).map(([k, v]) => [k.toUpperCase(), v]);

  const otherFields = Object.entries(rest).filter(
    ([key, val]) =>
      key !== 'issuer' &&
      key !== 'issuerCertificate' &&
      key !== 'raw' &&
      key !== 'pubkey' &&
      typeof val !== 'function'
  );

  const safeCert = Object.fromEntries([
    ...subjectFields,
    ...otherFields,
  ]);

  res.json(safeCert);
  req.socket.destroy();
});


const options = {
  key: fs.readFileSync(path.join(__dirname, '../../certs/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../../certs/localhost.pem')),
  requestCert: true,
  rejectUnauthorized: false,
};

const PORT = parseInt(process.env.PORT || '4430', 10);

https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Backend TLS corriendo en https://localhost:${PORT}`);
});
