#!/bin/sh
CONFIG_JSON="/usr/share/nginx/html/config.json"
if [ -n "$FOURSQUARE_API_KEY" ]; then
  echo "{\"foursquareApiKey\":\"$FOURSQUARE_API_KEY\"}" > "$CONFIG_JSON"
else
  echo "{\"foursquareApiKey\":\"\"}" > "$CONFIG_JSON"
fi
exec nginx -g "daemon off;"