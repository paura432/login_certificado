'use client';
import { useState } from 'react';

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-10 text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          🔐 Login con Certificado Digital
        </h1>

        <button
          onClick={doHandshake}
          disabled={loading}
          className="mb-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg transition disabled:opacity-60"
        >
          {loading ? '🔄 Verificando…' : '🚀 Iniciar sesión con certificado'}
        </button>

        {error && (
          <p className="text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        {info && (
          <div className="mt-6 text-left bg-gray-50 rounded-xl border p-6 shadow-inner animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              ✅ Tu certificado
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="font-semibold text-gray-600">✔ Verificación</dt>
                <dd className="text-gray-800">{info.verify}</dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600">📌 CN</dt>
                <dd>{info.subject.CN || '—'}</dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600">🏢 Organización</dt>
                <dd>{info.subject.O || '—'}</dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600">📂 Unidad</dt>
                <dd>{info.subject.OU || '—'}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="font-semibold text-gray-600">🔑 Emisor</dt>
                <dd>{info.issuer.CN || info.issuer.raw || '—'}</dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600"># Serie</dt>
                <dd>{info.serial || '—'}</dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600">📅 Validez</dt>
                <dd>
                  {info.notBefore || '—'} → {info.notAfter || '—'}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="font-semibold text-gray-600">🔒 Sesión TLS</dt>
                <dd>
                  {info.tls.protocol} · {info.tls.cipher}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </main>
  );
}
