'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { fromBER } from "asn1js";

type CertificateData = Record<string, unknown>;

// Mapa OID a etiquetas legibles
const oidMap: Record<string, string> = {
  "2.5.4.3": "Common Name (CN)",
  "2.5.4.6": "Country (C)",
  "2.5.4.7": "Locality (L)",
  "2.5.4.8": "State or Province (ST)",
  "2.5.4.10": "Organization (O)",
  "2.5.4.11": "Organizational Unit (OU)",
  "1.2.840.113549.1.9.1": "Email Address",
  // Añade más OIDs si necesitas
};

export default function Home() {
  const [cert,  setCert]  = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginPort, setLoginPort] = useState<number>(4430);

  useEffect(() => {
    localStorage.removeItem('cert');
    setCert(null);
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent<{ cert?: CertificateData; error?: string }>) => {
      if (e.origin !== 'http://localhost:3050') return;
      if (e.data?.cert)  { setCert(e.data.cert);  setError(null); }
      if (e.data?.error) { setError(e.data.error); setCert(null); }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const abrirPopup = (port: number) => {
    const url = `http://localhost:3050/popup?port=${port}&ts=${Date.now()}`;
    const win = window.open(url, `cert-popup-${port}`, 'width=600,height=700,left=100,top=100');
    if (!win) { setError('El navegador bloqueó el popup.'); return; }
    if (port === 4433) setLoginPort(4430);
  };

  const login  = () => { setCert(null); setError(null); abrirPopup(loginPort); };

  const logout = () => {
    setCert(null); setError(null);
    const next = loginPort === 4430 ? 4431 :
                 loginPort === 4431 ? 4432 : 4433;
    setLoginPort(next);
    abrirPopup(next);
  };

  // Helpers para detectar y parsear PEM / DER
  function isPEM(text: string) {
    return /-----BEGIN CERTIFICATE-----/.test(text);
  }

  function pemToArrayBuffer(pem: string) {
    const b64 = pem.replace(/(-----(BEGIN|END)[\w\s]+-----|\s)/g, '');
    const binary = atob(b64);
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  async function parseCertificate(buffer: ArrayBuffer): Promise<CertificateData> {
    const asn1 = fromBER(buffer);
    if (asn1.offset === -1) throw new Error("No se pudo parsear ASN1");

    const cert = new pkijs.Certificate({ schema: asn1.result });

    const subjectObj: Record<string, string> = {};
    cert.subject.typesAndValues.forEach(tav => {
      const label = oidMap[tav.type] || tav.type;
      const value = tav.value.valueBlock.value || "";
      subjectObj[label] = value;
    });

    const issuerObj: Record<string, string> = {};
    cert.issuer.typesAndValues.forEach(tav => {
      const label = oidMap[tav.type] || tav.type;
      const value = tav.value.valueBlock.value || "";
      issuerObj[label] = value;
    });

    return {
      ...subjectObj,
      ...issuerObj,
      "Valid From": cert.notBefore.value.toISOString(),
      "Valid To": cert.notAfter.value.toISOString(),
      "Serial Number": Buffer.from(cert.serialNumber.valueBlock.valueHex).toString('hex'),
      "Signature Algorithm": cert.signatureAlgorithm.algorithmId,
    };
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        if (typeof reader.result === 'string') {
          if (isPEM(reader.result)) {
            const buffer = pemToArrayBuffer(reader.result);
            const certData = await parseCertificate(buffer);
            setCert(certData);
          } else {
            throw new Error("Archivo no tiene formato PEM válido.");
          }
        } else if (reader.result instanceof ArrayBuffer) {
          const certData = await parseCertificate(reader.result);
          setCert(certData);
        } else {
          throw new Error("Formato de archivo desconocido");
        }
      } catch (err) {
        setError("Error parseando certificado: " + (err instanceof Error ? err.message : String(err)));
      }
    };

    reader.readAsText(file);
  };

  const renderCert = (c: CertificateData) => {
    const rows = Object.entries(c).filter(([k,v]) => typeof v !== 'function');
    const pad = Math.max(...rows.map(([k]) => k.length)) + 2;

    return (
      <pre className="text-sm whitespace-pre-wrap font-mono">
        {rows.map(([k,v]) =>
          `${k.padEnd(pad)}→ ${typeof v==='object'?JSON.stringify(v):String(v)}`
        ).join('\n')}
      </pre>
    );
  };

  const nextLabel = loginPort === 4430 ? 4431 :
                    loginPort === 4431 ? 4432 : 'AVISO';

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Login con Certificado Digital</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        {!cert && (
          <button onClick={login}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Iniciar sesión (puerto {loginPort})
          </button>
        )}
        {cert && (
          <button onClick={logout}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Cambiar certificado (siguiente {nextLabel})
          </button>
        )}
        <button onClick={() => { setCert(null); setError(null); }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Cerrar sesión
        </button>
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Subir certificado (.pem, .crt, .cer):</label>
        <input
          type="file"
          accept=".pem,.crt,.cer"
          onChange={handleFileUpload}
          className="border p-2 rounded"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {cert && (
        <div className="bg-gray-100 p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-2">Datos del Certificado</h2>
          {renderCert(cert)}
        </div>
      )}
    </main>
  );
}
