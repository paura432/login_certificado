'use client';
import { useEffect, useState } from 'react';

export default function PopupPage() {
  const [mensaje, setMensaje] = useState('Procesando el certificado...');
  const [cerrar, setCerrar] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const port = params.get('port') || '4430';

    const obtenerCertificado = async () => {
      try {
        const res = await fetch(`https://localhost:${port}/login`, {
          cache: 'no-store',
          mode: 'cors',
        });

        const data = await res.json();

        if (window.opener) {
          if (res.ok) {
            setMensaje('✅ Certificado recibido. Cerrando...');
            window.opener.postMessage({ cert: data }, '*');
            setCerrar(true);
          } else {
            setMensaje('❌ Error: ' + data.error);
            window.opener.postMessage({ error: data.error }, '*');
          }
        }
      } catch (err: any) {
        setMensaje('⚠️ Error de red: ' + err.message);
        window.opener?.postMessage({ error: err.message }, '*');
      }
    };

    obtenerCertificado();
  }, []);

  useEffect(() => {
    if (cerrar) {
      setTimeout(() => window.close(), 1500);
    }
  }, [cerrar]);

  return (
    <main className="p-4 text-center text-gray-700">
      <p className="text-lg">{mensaje}</p>
    </main>
  );
}
