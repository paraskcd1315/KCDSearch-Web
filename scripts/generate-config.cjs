const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  foursquareApiKey: process.env.FOURSQUARE_API_KEY ?? '',
  foursquareApiVersion: process.env.FOURSQUARE_API_VERSION ?? '',
  aiProviderId: process.env.AI_PROVIDER_ID ?? '',
  aiProviderKey: process.env.AI_PROVIDER_KEY ?? '',
  aiProviderEmbedId: process.env.AI_PROVIDER_EMBED_ID ?? '',
  aiProviderEmbedKey: process.env.AI_PROVIDER_EMBED_KEY ?? '',
};

const outPath = path.join(process.cwd(), 'public', 'config.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(config, null, 2), 'utf8');
console.log('config.json written to public/');
