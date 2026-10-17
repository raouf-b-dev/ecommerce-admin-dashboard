#!/bin/sh
# Renders /config.js from API_BASE_URL before nginx starts (official nginx
# image /docker-entrypoint.d hook). A missing or invalid value stops the
# container instead of serving an app that fails in the browser.
set -eu

value="${API_BASE_URL:-}"

case "$value" in
  http://?* | https://?*) ;;
  *)
    echo "$0: API_BASE_URL must be an absolute http(s) URL, got '$value'" >&2
    exit 1
    ;;
esac

case "$value" in
  *'"'* | *'\'* | *'<'* | *'>'* | *' '*)
    echo "$0: API_BASE_URL contains a character that is not valid in a URL" >&2
    exit 1
    ;;
esac

mkdir -p /tmp/admin-config
printf 'window.__APP_CONFIG__ = { apiBaseUrl: "%s" };\n' "$value" \
  > /tmp/admin-config/config.js
echo "$0: /config.js uses API_BASE_URL=$value"
