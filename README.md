# Devsu — Frontend (Angular 20)

Proyecto **Angular 20** con **Jest** para pruebas unitarias, para estilo de código y **proxy** para desarrollo. Este README está basado **exactamente** en la estructura del proyecto y usa **npm** (existe `package-lock.json`).

---

## Stack

* **Angular** 20
* **Bootstrap** 5 + `@ng-bootstrap/ng-bootstrap`
* **CDK**: `@angular/cdk`
* **RxJS** 7
* **Testing**: Jest + `jest-preset-angular` (jsdom)
* **Linting**: ESLint (flat config) + `angular-eslint`
* **Formato**: Prettier
* **HTTP**: `HttpClient`

---

## Estructura real del proyecto

```
frontend/
├─ angular.json
├─ package.json
├─ package-lock.json              # Se usa npm
├─ proxy.conf.json                # Proxy → http://localhost:3002
├─ jest.config.ts
├─ setup-jest.ts
├─ eslint.config.mjs              # ESLint flat config
├─ .editorconfig
├─ .browserslistrc
├─ src/
│  ├─ index.html
│  ├─ main.ts
│  ├─ styles.scss
│  ├─ polyfills.ts
│  ├─ environments/
│  │  ├─ environment.ts           # apiUrl: '/bp'
│  │  └─ environment.prod.ts      # apiUrl: '/bp'
│  └─ app/
│     ├─ app.component.{ts,html,scss}
│     ├─ app-routing.module.{ts,spec.ts}
│     ├─ app-config.ts
│     ├─ application/
│     │  ├─ adapter.ts            # InjectionToken PRODUCT_REPOSITORY
│     │  └─ facades/
│     │     └─ product.facade.{ts,spec.ts}
│     ├─ core/
│     │  ├─ models/               # p.ej. product.model.ts
│     │  ├─ ports/                # p.ej. product.repository.ts
│     │  ├─ types/                # Result<Ok/Err>
│     │  └─ use-cases/            # create/update/delete/load/verify-id
│     ├─ infrastructure/
│     │  └─ api/
│     │     ├─ dto/               # Contracts API
│     │     ├─ product-api.service.{ts,spec.ts}
│     ├─ presentation/
│     │  └─ pages/
│     │     └─ dashboard/
│     │        ├─ product-list/
│     │        ├─ product-create/
│     │        └─ product-edit/
│     ├─ shared/
│     │  ├─ services/             # (toast, etc.)
│     │  └─ components/
│     │     ├─ actions-dropdown/
│     │     ├─ button/
│     │     ├─ modal/
│     │     ├─ page-header/
│     │     ├─ pagination/        # + utils/pagination-utils.{ts,spec.ts}
│     │     ├─ product-form/
│     │     ├─ product-table/
│     │     ├─ search-box/
│     │     └─ toast/
│     └─ theme/
│        └─ layouts/admin-layout/  # nav-bar, navigation, etc.
└─ test-utils/                     # helpers de pruebas (mocks html)
```

**Capas (Clean/Hexagonal):**

* **core**: dominio puro (modelos, puertos, tipos y casos de uso).
* **infrastructure**: adaptadores reales (API REST) que implementan `ports`.
* **application**: orquestación/UI state (facades) e InjectionToken.
* **presentation**: páginas y flujos de UI.
* **shared**: componentes y servicios reutilizables (stateless donde aplica).

---

## API esperada (proxy)

`proxy.conf.json` mapea `"/bp" → http://localhost:3002`.

**Endpoints (backend local requerido):**

* `GET    /bp/products`
* `POST   /bp/products`
* `PUT    /bp/products/:id`
* `DELETE /bp/products/:id`
* `GET    /bp/products/verification/:id`

> Arranca tu backend en `http://localhost:3002` antes de `npm start`.

---

## Validaciones clave (Product Form)

* **ID**: requerido, 3–10 chars, **no existente** (verificación API), deshabilitado en **editar**.
* **Nombre**: 5–100 chars.
* **Descripción**: 10–200 chars.
* **Logo**: requerido (URL/string).
* **Fecha de liberación**: ≥ hoy.
* **Fecha de revisión**: exactamente **+1 año** respecto a liberación.

---

## Requisitos

* **Node.js 20 LTS** (recomendado)
* **npm 10+** (se usa `package-lock.json`)
* Angular CLI instalada localmente vía `npx`

---

## Instalación y ejecución (npm)

```bash
# 1) Entrar al proyecto
cd frontend

# 2) Instalar dependencias limpias
npm ci

# 3) Desarrollo con proxy (http://localhost:4200)
ng serve
 #o
npm run start


```

> `angular.json` configura `serve` para usar `proxy.conf.json` por defecto.

---

## Pruebas con Jest

```bash
# Ejecutar pruebas
npm test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

* **Preset:** `jest-preset-angular`
* **Entorno:** `jsdom`
* **Setup:** `setup-jest.ts` (incluye `setupZoneTestEnv()` y mocks de `matchMedia`/`crypto`)
* **Cobertura:** se recolecta sobre `src/app/**/*.ts` y genera `coverage/` (incluye `lcov`).

---


## Rutas y layout

* **Layout:** `theme/layouts/admin-layout` (nav-bar, navigation, etc.).
* **Páginas:** `presentation/pages/dashboard/*` con `product-list`, `product-create`, `product-edit`.
* **Shared UI:** `shared/components` (tabla, formulario, búsqueda, paginación, toasts, modal, botón, header y acciones).

---

## Inversión de dependencias

* `application/adapter.ts` expone `PRODUCT_REPOSITORY` (InjectionToken).
* `infrastructure/api/product-api.service.ts` implementa `core/ports/product.repository.ts` y se inyecta vía el token.
* `application/facades/product.facade.ts` orquesta casos de uso: `loadAll`, `create`, `update`, `delete`, `verifyId`.

---

## 🛠️ Scripts disponibles

* `start` → `ng serve` (con proxy).
* `build` → `ng build` (dev).
* `build-prod` → `ng build --configuration production --base-href /angular/free/`.
* `watch` → `ng build --watch --configuration development`.
* `test`, `test:watch`, `test:coverage` → Jest.
* `prettier` → formatea `src/`.

---


## 📄 Licencia

MIT — © 2025 Jose Gabriel Chica Rojas.
