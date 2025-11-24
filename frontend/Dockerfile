# syntax=docker/dockerfile:1.7

# Etapa de build
FROM node:22-alpine AS build
WORKDIR /app

# Ajustes de red/npm
RUN apk add --no-cache ca-certificates && update-ca-certificates

ENV npm_config_registry="https://registry.npmjs.org/" \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_strict_ssl=true

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY=$HTTP_PROXY HTTPS_PROXY=$HTTPS_PROXY NO_PROXY=$NO_PROXY

# instala deps
COPY frontend/package*.json ./
#RUN npm install -g npm@11.6.2
RUN npm ping && npm ci

COPY frontend/ ./

ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}

# build (Vite)
RUN npm run build

FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
