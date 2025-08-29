#!/bin/bash
set -e

CONF="$(pwd)/nginx/nginx.conf"
PREFIX="$(pwd)/nginx"

echo "👉 Probando sintaxis de NGINX..."
sudo nginx -t -c "$CONF" -p "$PREFIX"

echo "🔄 Recargando NGINX..."
sudo nginx -s reload -p "$PREFIX" || {
  echo "⚠️  NGINX no estaba corriendo, arrancando..."
  sudo nginx -c "$CONF" -p "$PREFIX"
}

echo "🧪 Probando /api/health ..."
curl -sk https://localhost/api/health || true

echo "🧪 Probando /api/certinfo (sin certificado) ..."
curl -sk https://localhost/api/certinfo || true

echo "✅ Listo. Ahora prueba en navegador: https://localhost"
