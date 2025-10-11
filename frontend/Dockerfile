# syntax=docker/dockerfile:1.7

# Etapa de build
FROM node:22-alpine AS build
WORKDIR /app

# --- Ajustes de red/npm ---
# 1) Certificados del sistema (evita problemas TLS)
RUN apk add --no-cache ca-certificates && update-ca-certificates

# 2) Variables npm para reintentos y timeouts más altos
ENV npm_config_registry="https://registry.npmjs.org/" \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_strict_ssl=true

# 3) (Opcional) Soporte proxy si existiera; se injecta vía build args
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY=$HTTP_PROXY HTTPS_PROXY=$HTTPS_PROXY NO_PROXY=$NO_PROXY

# instala deps
COPY frontend/package*.json ./
# ping al registro antes de instalar (diagnóstico + precalienta conexión)
#RUN npm install -g npm@11.6.2
RUN npm ping && npm ci

# copia código
COPY frontend/ ./

# variable de build para apuntar la API
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}

# build (Vite)
RUN npm run build

# Etapa de servidor web
FROM nginx:1.27-alpine
# nuestro nginx con proxy a /api
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
# estáticos generados por Vite
COPY --from=build /app/dist /usr/share/nginx/html
