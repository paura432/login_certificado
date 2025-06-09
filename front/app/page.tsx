'use client';

import { useEffect, useState,  } from 'react';
import React from 'react';

export default function Home() {
  const [cert, setCert] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginPort, setLoginPort] = useState(4430);

  useEffect(() => {
    const stored = localStorage.getItem('cert');
    if (stored) {
      try {
        setCert(JSON.parse(stored));
      } catch {
        localStorage.removeItem('cert');
      }
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Mensaje recibido:', event.origin, event.data);
  
      if (event.origin !== 'http://localhost:3000') return;
  
      if (event.data?.cert) {
        setCert(event.data.cert);
        localStorage.setItem('cert', JSON.stringify(event.data.cert));
        setError(null);
      } else if (event.data?.error) {
        setError(event.data.error);
        setCert(null);
      }
    };
  
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = () => {
    setError(null);
    setCert(null);

    const popupUrl = `http://localhost:3000/popup?port=${loginPort}&ts=${Date.now()}`;
    const popup = window.open(
      popupUrl,
      `cert-popup-${loginPort}`,
      'width=600,height=700,left=100,top=100'
    );

    if (!popup) {
      setError('El navegador bloqueó el popup. Permite ventanas emergentes.');
    }
  };

  const logout = () => {
    setCert(null);
    setError(null);
    localStorage.removeItem('cert');

    const nextPort = loginPort + 1;
    setLoginPort(nextPort);
    login();
  };
  const renderCertAsSections = (cert: any) => {
    const subjectFields = Object.entries(cert.subject || {}).map(([k, v]) => [
      k.toUpperCase(),
      String(v),
    ]);
  
    const flatCert = {
      ...cert,
      ...Object.fromEntries(subjectFields),
    };
  
    const entries = Object.entries(flatCert).filter(
      ([key]) =>
        key !== 'subject' &&
        key !== 'issuer' &&
        key !== 'raw' &&
        key !== 'pubkey' &&
        typeof flatCert[key] !== 'function'
    );
  
    const maxLabelLength = Math.max(...entries.map(([key]) => key.length));
  
    const lines = entries.map(([key, val]) => {
      const label = key.replace(/_/g, ' ').toUpperCase().padEnd(maxLabelLength + 2);
      const value = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `${label}→ ${value}`;
    });
  
    return (
      <pre style={{ fontFamily: 'monospace', fontSize: '14px' }}>
        {lines.join('\n')}
      </pre>
    );
  };
  
  
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Login con Certificado Digital</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        {!cert && (
          <button
            onClick={login}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Iniciar sesión (puerto {loginPort})
          </button>
        )}
        {cert && (
          <button
            onClick={logout}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            cambiar certificado
          </button>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {cert && (
        <div className="bg-gray-100 p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">Datos del Certificado</h2>
          <div className="text-sm">{renderCertAsSections(cert)}</div>
        </div>
      )}
    </main>
  );
}
