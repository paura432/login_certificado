import fs from 'fs';
import https from 'https';
import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/login', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');

  const cert = (req.socket as any).getPeerCertificate(true);

  if (!cert || Object.keys(cert).length === 0) {
    return res.status(401).json({ error: 'Certificado requerido o inválido.' });
  }

  const subject = cert.subject || {};
  const issuer = cert.issuer || {};

  const mappedSubject = {
    "Common Name (CN)": subject.CN,
    "Organization (O)": subject.O,
    "Organizational Unit (OU)": subject.OU,
    "Country (C)": subject.C,
    "Locality (L)": subject.L,
    "State/Province (ST)": subject.ST,
    "Email Address": subject.emailAddress,
  };

  const mappedIssuer = {
    "Issuer Common Name (CN)": issuer.CN,
    "Issuer Organization (O)": issuer.O,
    "Issuer Organizational Unit (OU)": issuer.OU,
    "Issuer Country (C)": issuer.C,
    "Issuer Locality (L)": issuer.L,
    "Issuer State/Province (ST)": issuer.ST,
  };

  const otherFields = {
    "Valid From": cert.valid_from,
    "Valid To": cert.valid_to,
    "Serial Number": cert.serialNumber,
  };

  const safeCert = {
    ...mappedSubject,
    ...mappedIssuer,
    ...otherFields,
  };

  res.json(safeCert);
  req.socket.destroy();
});

const certPath = process.env.CERT_PATH || path.resolve(__dirname, '../certs');

const options = {
  key: fs.readFileSync(`${certPath}/localhost-key.pem`),
  cert: fs.readFileSync(`${certPath}/localhost.pem`),
  requestCert: true,
  rejectUnauthorized: false,
};

const PORT = parseInt(process.env.PORT || '4430', 10);

https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Backend TLS corriendo en https://localhost:${PORT}`);
});
