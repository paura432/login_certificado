#!/bin/bash

# Script para generar certificados para testing
# En producción, usa certificados de una CA real

set -e

CERT_DIR="nginx/certs"
mkdir -p $CERT_DIR

echo "🔧 Generando certificados para testing..."

# 1. CA para certificados del servidor
echo "📋 1. Creando CA del servidor..."
openssl genrsa -out $CERT_DIR/ca-server.key 4096
openssl req -new -x509 -days 365 -key $CERT_DIR/ca-server.key -out $CERT_DIR/ca-server.crt -subj "/CN=Server CA/O=Test Org/C=ES"

# 2. Certificado del servidor
echo "📋 2. Creando certificado del servidor..."
openssl genrsa -out $CERT_DIR/server.key 2048
openssl req -new -key $CERT_DIR/server.key -out $CERT_DIR/server.csr -subj "/CN=localhost/O=Test Server/C=ES"

# Crear extensiones para SAN (Subject Alternative Names)
cat > $CERT_DIR/server.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = 10.0.0.0/8
IP.3 = 172.16.0.0/12
IP.4 = 192.168.0.0/16
EOF

openssl x509 -req -in $CERT_DIR/server.csr -CA $CERT_DIR/ca-server.crt -CAkey $CERT_DIR/ca-server.key -CAcreateserial -out $CERT_DIR/server.crt -days 365 -extensions v3_req -extfile $CERT_DIR/server.ext

# 3. CA para certificados cliente
echo "📋 3. Creando CA para certificados cliente..."
openssl genrsa -out $CERT_DIR/ca-clients.key 4096
openssl req -new -x509 -days 365 -key $CERT_DIR/ca-clients.key -out $CERT_DIR/ca-clients.crt -subj "/CN=Client CA/O=Test Client CA/C=ES"

# 4. Certificado cliente de prueba
echo "📋 4. Creando certificado cliente de prueba..."
openssl genrsa -out $CERT_DIR/client-test.key 2048
openssl req -new -key $CERT_DIR/client-test.key -out $CERT_DIR/client-test.csr -subj "/CN=Test User/O=Test Organization/OU=IT Department/C=ES"

# Crear extensiones para el cliente
cat > $CERT_DIR/client.ext << EOF
basicConstraints=CA:FALSE
nsCertType = client, email
nsComment = "OpenSSL Generated Client Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth, emailProtection
EOF

openssl x509 -req -in $CERT_DIR/client-test.csr -CA $CERT_DIR/ca-clients.crt -CAkey $CERT_DIR/ca-clients.key -CAcreateserial -out $CERT_DIR/client-test.crt -days 365 -extensions usr_cert -extfile $CERT_DIR/client.ext

# 5. Crear PKCS#12 para el navegador
echo "📋 5. Creando certificado PKCS#12 para importar al navegador..."
openssl pkcs12 -export -out $CERT_DIR/client-test.p12 -inkey $CERT_DIR/client-test.key -in $CERT_DIR/client-test.crt -certfile $CERT_DIR/ca-clients.crt -passout pass:test123

# 6. Limpiar archivos temporales
rm -f $CERT_DIR/*.csr $CERT_DIR/*.ext $CERT_DIR/*.srl

echo "✅ Certificados generados en $CERT_DIR/"
echo ""
echo "📁 Archivos creados:"
echo "   • server.crt/key    → Certificado SSL del servidor"  
echo "   • ca-clients.crt    → CA que valida certificados cliente"
echo "   • client-test.p12   → Certificado cliente para importar (password: test123)"
echo ""
echo "🔧 Siguiente paso:"
echo "   1. docker-compose up --build"
echo "   2. Importa client-test.p12 en tu navegador"
echo "   3. Visita https://localhost"
echo ""
echo "⚠️  Para producción:"
echo "   • Reemplaza server.crt/key con certificados de Let's Encrypt/CA real"
echo "   • Usa tu propia CA para certificados cliente"