import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/login_cert',
  trailingSlash: true,     // <-- CLAVE: evita el bucle 301↔308
  reactStrictMode: true,
};

module.exports = nextConfig;

export default nextConfig;
