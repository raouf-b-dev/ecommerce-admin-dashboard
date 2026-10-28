# syntax=docker/dockerfile:1

# -- Stage 1: build -------------------------------------------------------------
# The static bundle does not depend on the target CPU, so this stage runs on the
# build platform and a multi-arch build compiles it once.
FROM --platform=$BUILDPLATFORM node:26.12.1-alpine3.24@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797 AS build
WORKDIR /app

# Must match devEngines.packageManager.version in package.json. No Node release
# bundles npm 12 yet, so install it explicitly.
ARG NPM_VERSION=12.2.1
RUN npm install --global "npm@${NPM_VERSION}"

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# No VITE_API_BASE_URL: the API origin comes from API_BASE_URL at container start.
RUN npm run build

# -- Stage 2: production --------------------------------------------------------
# NGINX's unprivileged image: runs as uid 101 and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS production

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --chmod=0755 docker/nginx/40-render-config.sh /docker-entrypoint.d/40-render-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# Static server viability only; the API is checked by the API image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
