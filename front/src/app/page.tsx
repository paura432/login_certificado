'use client';
import { useState, type ReactElement } from 'react';

type CertInfo = {
  ok: boolean;
  verify: string;
  subject: { CN: string; O: string; OU: string; raw: string };
  issuer: { CN: string; O: string; OU: string; raw: string };
  serial: string;
  notBefore: string;
  notAfter: string;
  tls: { protocol: string; cipher: string };
};

const fieldLabels: Record<string, string> = {
  CN: 'Nombre común (CN)',
  O: 'Organización (O)',
  OU: 'Unidad organizativa (OU)',
  C: 'País (C)',
  L: 'Localidad (L)',
  ST: 'Provincia/Estado (ST)',
  EMAIL: 'Correo electrónico',
};

function formatDN(raw?: string): ReactElement {
  if (!raw) return <span>—</span>;
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  return (
    <dl className="ml-4">
      {parts.map((p, i) => {
        const [kRaw, ...rest] = p.split('=');
        const k = (kRaw || '').trim();
        const v = rest.join('=').trim(); // por si el valor contiene '='
        const label = fieldLabels[k] || k || 'Desconocido';
        return (
          <div key={`${k}-${i}`} className="flex">
            <dt className="w-48 font-medium text-gray-700">{label}:</dt>
            <dd className="text-gray-900">{v || '—'}</dd>
          </div>
        );
      })}
    </dl>
  );
}

export default function Home() {
  const [info, setInfo] = useState<CertInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doHandshake = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/handshake', { method: 'POST' });
      const res = await fetch('/api/certinfo');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as CertInfo;
      setInfo(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Login con Certificado Digital
      </h1>

      <button
        onClick={doHandshake}
        disabled={loading}
        className="mb-10 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow disabled:opacity-60"
      >
        {loading ? 'Verificando…' : 'Iniciar sesión con certificado'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {info && (
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-blue-700">
            ✅ Este es tu certificado
          </h3>

          <div className="space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-gray-600">Verificación:</dt>
              <dd>{info.verify}</dd>
            </div>

            <div>
              <dt className="font-semibold text-gray-600">Datos del sujeto:</dt>
              <dd>{formatDN(info.subject?.raw)}</dd>
            </div>

            <div>
              <dt className="font-semibold text-gray-600">Datos del emisor:</dt>
              <dd>{formatDN(info.issuer?.raw)}</dd>
            </div>

            <div>
              <dt className="font-semibold text-gray-600">Número de serie:</dt>
              <dd>{info.serial || '—'}</dd>
            </div>

            <div>
              <dt className="font-semibold text-gray-600">Validez:</dt>
              <dd>
                {info.notBefore || '—'} → {info.notAfter || '—'}
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-gray-600">Sesión TLS:</dt>
              <dd>
                {info.tls?.protocol} · {info.tls?.cipher}
              </dd>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
