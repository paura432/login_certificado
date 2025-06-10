'use client';

export default function LogoutPopup() {
  return (
    <main className="h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-300 text-center">
        <div className="text-green-600 text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold mb-2">Sesión cerrada correctamente</h2>
        <p className="text-gray-700 mb-4">
          Para completar el cierre de sesión, es necesario cerrar todas las pestañas abiertas del navegador.
        </p>
        <p className="text-sm text-gray-500">
          Esto se debe a que algunos navegadores mantienen el certificado en memoria hasta que todas las sesiones son finalizadas.
        </p>
      </div>
    </main>
  );
}
