/** Development environment. Points at the local UrbanInfraSystem backend. */
export const environment = {
  production: false,
  appName: 'Urban Infra System',
  apiBaseUrl: 'http://localhost:5080/api',
  defaultLocale: 'en',
  supportedLocales: ['en', 'vi'] as const,
}
