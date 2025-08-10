
let version = '0.0.0';
try {
  version = require('../../package.json').version ?? version;
} catch {}

export const environment = {
  appVersion: version,
  production: true,
  apiUrl: '/bp'
};
