#!/bin/sh
set -e

export FOURSQUARE_API_KEY="${FOURSQUARE_API_KEY:-}"
export FOURSQUARE_API_VERSION="${FOURSQUARE_API_VERSION:-2025-06-17}"
export AI_PROVIDER_ID="${AI_PROVIDER_ID:-}"
export AI_PROVIDER_KEY="${AI_PROVIDER_KEY:-}"
export AI_PROVIDER_EMBED_ID="${AI_PROVIDER_EMBED_ID:-}"
export AI_PROVIDER_EMBED_KEY="${AI_PROVIDER_EMBED_KEY:-}"

envsubst '${FOURSQUARE_API_KEY} ${FOURSQUARE_API_VERSION}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

if [ -n "${AI_PROVIDER_ID}" ] && [ -n "${AI_PROVIDER_KEY}" ] && [ -n "${AI_PROVIDER_EMBED_ID}" ] && [ -n "${AI_PROVIDER_EMBED_KEY}" ]; then
  jq ".aiProviderId = \"${AI_PROVIDER_ID}\"" /public/config.json > /tmp/config.json
  jq ".aiProviderKey = \"${AI_PROVIDER_KEY}\"" /tmp/config.json > /public/config.json
  jq ".aiProviderEmbedId = \"${AI_PROVIDER_EMBED_ID}\"" /public/config.json > /tmp/config.json
  jq ".aiProviderEmbedKey = \"${AI_PROVIDER_EMBED_KEY}\"" /tmp/config.json > /public/config.json
  rm /tmp/config.json
fi

exec nginx -g "daemon off;"