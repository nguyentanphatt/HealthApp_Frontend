// Load env variables from a local .env file when building locally
// (EAS Build uses Secrets you set in the dashboard/CLI)
require('dotenv').config();

const appJson = require('./app.json');

module.exports = ({ config }) => {
  const base = appJson.expo || {};

  return {
    ...base,
    android: {
      ...base.android,
      config: {
        ...(base.android && base.android.config ? base.android.config : {}),
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
  };
};


