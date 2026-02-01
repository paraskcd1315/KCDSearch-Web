#!/bin/sh
set -e

export FOURSQUARE_API_KEY="${FOURSQUARE_API_KEY:-}"
export FOURSQUARE_API_VERSION="${FOURSQUARE_API_VERSION:-2025-06-17}"

envsubst '${FOURSQUARE_API_KEY} ${FOURSQUARE_API_VERSION}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"