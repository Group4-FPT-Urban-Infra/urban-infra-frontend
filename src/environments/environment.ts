/**
 * Production environment (default). Swapped for environment.development.ts
 * during `ng serve` / development builds via fileReplacements in angular.json.
 */
export const environment = {
  production: true,
  appName: 'Angular Base',
  apiBaseUrl: '/api',
  defaultLocale: 'en',
  supportedLocales: ['en', 'vi'] as const,
}
