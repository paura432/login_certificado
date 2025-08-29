export const metadata = {
  title: "Login con Certificado Digital",
  description: "Demo mTLS con NGINX + Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        <div className="min-h-screen flex flex-col">
          <header className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-bold">login-cert</h1>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="p-4 border-t border-gray-200 text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} login-cert demo
          </footer>
        </div>
      </body>
    </html>
  );
}
