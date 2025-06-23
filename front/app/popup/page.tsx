'use client';

import { useEffect, useState } from 'react';

export default function Popup() {
  const [msg, setMsg] = useState('Procesando certificado...');
  const [close, setClose] = useState(false);

  useEffect(() => {
    const port = new URLSearchParams(window.location.search).get('port') ?? '4430';

    if (port === '4433') {
      setMsg('🔒 Puerto 4433 deshabilitado.\nPor favor, reinicia sesión desde el inicio (puerto 4430).');
      setClose(true);
      return;
    }

    (async () => {
      try {
        const res  = await fetch(`https://localhost:${port}/login`, {
          cache: 'no-store',
          mode: 'cors',
        });
        const data = await res.json();

        if (window.opener) {
          if (res.ok) {
            setMsg('✅ Certificado recibido. Cerrando...');
            window.opener.postMessage({ cert: data }, '*');
          } else {
            setMsg('❌ Error: ' + data.error);
            window.opener.postMessage({ error: data.error }, '*');
          }
        }
      } catch (e) {
        const err = (e as Error).message;
        setMsg('⚠ Error de red: ' + err);
        window.opener?.postMessage({ error: err }, '*');
      } finally {
        setClose(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (close) setTimeout(() => window.close(), 2000);
  }, [close]);

  return (
    <main className="p-4 text-center">
      <p className="text-lg whitespace-pre-wrap">{msg}</p>
    </main>
  );
}
