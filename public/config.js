/* global window */
// Runtime config. The Docker image serves a copy rendered from API_BASE_URL at
// container start (docker/nginx/40-render-config.sh). This empty default keeps
// `npm run dev` and other builds on VITE_API_BASE_URL.
window.__APP_CONFIG__ = {};
