# Angular Base

Production-ready Angular starter: **Angular 22** (standalone components,
Signals), TypeScript (strict), Tailwind CSS v4, Angular Router with guards,
`HttpClient` + functional interceptors, `@ngx-translate/core`, and Vitest.

> Part of the [Base Solution](../README.md) set. React and Vue siblings share
> the same architecture.

## Quick start

```bash
npm install
npm start          # http://localhost:4200
```

Sign in with **`demo@example.com` / `password`** → open **Users**.

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | Dev server (`ng serve`) at :4200 |
| `npm run build` | Production build to `dist/angular-base/browser` |
| `npm run watch` | Rebuild on change (development config) |
| `npm test` | Vitest via `ng test` |
| `npm run format` / `format:check` | Prettier |

## Architecture

Standalone components throughout — **no NgModules**. State is held in
**Signals-based store services**; UI reads signals directly and Angular's
change detection reacts automatically.

### Folder structure

```
src/
├── environments/               # environment.ts (prod) + .development.ts
├── styles.css                  # Tailwind entry + design tokens
└── app/
    ├── app.ts                  # Root component (<router-outlet/>)
    ├── app.config.ts           # Providers: router, HttpClient+interceptors,
    │                           #   translate, app-initializer (locale)
    ├── app.routes.ts           # Lazy routes + guards
    ├── core/                   # App-wide singletons
    │   ├── config/env.ts       # Typed re-export of the active environment
    │   ├── auth/               # token-storage, auth.service (mock),
    │   │                       #   auth.store (signals), auth.guard, types
    │   └── http/               # auth.interceptor, error.interceptor, ApiError
    ├── shared/
    │   ├── ui/                 # ButtonComponent, CardComponent, SpinnerComponent
    │   └── layout/             # AppLayoutComponent (nav, lang, logout)
    └── features/
        ├── home/               # HomePage
        ├── auth/               # LoginPage
        ├── not-found/          # NotFoundPage
        └── users/              # service, signal store, list page, form dialog
```

### State management

State lives in `@Injectable({ providedIn: 'root' })` services that expose
`signal`/`computed` values and async methods — the **native-Signals equivalent
of an NgRx SignalStore**. See `core/auth/auth.store.ts` and
`features/users/users.store.ts`.

> **Why not `@ngrx/signals`?** At build time its latest release required
> `@angular/core@^21`, incompatible with Angular 22. The stores are written so
> migration is a **drop-in**: call sites already read `store.user()`,
> `store.isAuthenticated()`, `store.filtered()` exactly like a SignalStore
> exposes them. When NgRx ships v22 support, replace each store class body with
> `signalStore(withState(...), withMethods(...))` and the components don't change.

### HTTP layer (`core/http/`)

Two **functional interceptors** registered in `app.config.ts`:

- `authInterceptor` — attaches `Authorization: Bearer <token>`.
- `errorInterceptor` — on `401` clears tokens and routes to `/login`; normalizes
  every failure to an **`ApiError`** (`status`, `message`, `code`, `fieldErrors`).

### Auth & guards

`core/auth/auth.guard.ts` exports `authGuard` (protects routes, redirects to
`/login?redirect=…`) and `guestGuard` (keeps signed-in users off `/login`).
The mock login is in `core/auth/auth.service.ts` — swap `of(...)` for a real
`HttpClient` call.

### i18n

`@ngx-translate/core` with the HTTP loader reading `public/i18n/{lang}.json`
(copied to the site root at build time). `app.config.ts` uses
`provideAppInitializer` to load the initial locale **before first paint**. The
layout `<select>` calls `translate.use(code)`.

### Styling

Tailwind v4 via PostCSS (`.postcssrc.json` → `@tailwindcss/postcss`). The global
entry is `src/styles.css` (kept as `.css`, not `.scss`, so Tailwind's
`@import "tailwindcss"` isn't run through Sass). Design tokens live in the
`@theme` block. Component styles use Tailwind utilities inline.

## How to add a feature

Example: a **Products** feature.

1. `features/products/products.types.ts` and `products.service.ts` (inject
   `HttpClient`, base off `env.apiBaseUrl`).
2. `features/products/products.store.ts` — a signal store (copy `users.store.ts`).
3. `features/products/products-list.page.ts` — standalone component using
   `shared/ui/*` and the `| translate` pipe.
4. Add a **lazy** `loadComponent` route under the layout in `app.routes.ts`,
   guarded by `authGuard`.
5. Add a nav link in `shared/layout/app-layout.ts` and keys in
   `public/i18n/*.json`.
6. Add a `*.spec.ts` (see `shared/ui/button.spec.ts`).

## Testing

Angular 22's `@angular/build:unit-test` builder runs **Vitest**. Examples:
`src/app/app.spec.ts`, `src/app/shared/ui/button.spec.ts`. Run `npm test`.

## Configuration

Angular uses `src/environments/`, swapped by `fileReplacements` in
`angular.json` (dev build uses `environment.development.ts`). Access via
`core/config/env.ts`.

| Field | Dev | Prod |
|---|---|---|
| `apiBaseUrl` | `https://jsonplaceholder.typicode.com` | `/api` |
| `defaultLocale` | `en` | `en` |
| `supportedLocales` | `['en','vi']` | `['en','vi']` |

## Adding ESLint

The base ships Prettier. To add Angular's linter:

```bash
ng add @angular-eslint/schematics
```

## Docker

```bash
docker build -t angular-base .
docker run -p 8080:80 angular-base
```

Multi-stage build (Node → nginx). Note the build output is
`dist/angular-base/browser` (Angular application builder), which the Dockerfile
copies into nginx.
