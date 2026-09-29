import packageInfo from '../../package.json';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  oauthClientId: '',
  enableDebugTools: true,
  enableMocking: false,
  logLevel: 'debug',
  version: packageInfo.version,
};
