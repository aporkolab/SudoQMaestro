import packageInfo from '../../package.json';

export const environment = {
  production: true,
  apiUrl: '/api',
  oauthClientId: '',
  enableDebugTools: false,
  enableMocking: false,
  logLevel: 'error',
  version: packageInfo.version,
};
