/** Development environment. Points at a public mock API so the app runs as-is. */
export const environment = {
  production: false,
  appName: 'Angular Base',
  apiBaseUrl: 'https://jsonplaceholder.typicode.com',
  defaultLocale: 'en',
  supportedLocales: ['en', 'vi'] as const,
}
