# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available: 

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


src/
 ├── app/                      # Global app entry, providers, routing setup
 │    ├── hooks.ts            # App-level hooks (auth, loader, theme)
 │    └── store.ts            # Redux store (global)
 │
 ├── common/                  # Shared across entire project
 │    ├── components/         # Reusable generic components
 │    │    ├── activity/
 │    │    ├── cards/
 │    │    ├── charts/
 │    │    ├── layout/ 
 │    │    └── skeleton/
 │    ├── ui/                 # UI building blocks
 │    │    ├── Modal.tsx
 │    │    └── UtilizationBar.tsx
 │    └── utils/              # (Add this) helpers/formatters (optional)
 │
 ├── features/                # Domain-level business modules
 │    ├── campaigns/
 │    │    ├── pages/
 │    │    ├── components/
 │    │    ├── services/      # API calls
 │    │    ├── slice.ts       # Redux slice (if feature-scoped)
 │    │    └── types.ts
 │    ├── leads/
 │    ├── insights/
 │    ├── team/
 │    ├── settings/
 │    └── support/
 │
 ├── portals/                 # Role-based shells (Admin, SuperAdmin, etc.)
 │    ├── admin/
 │    │    ├── pages/
 │    │    ├── layout/
 │    │    └── index.ts
                router.tsx
 │    ├── superadmin/
 │    │    ├── pages/
 │    │    ├── layout/
 │    │    └── index.ts
                router.tsx
 │    └── shared/             # Shared portal components (navigation, layout)
 │
 ├── services/                # Global services (axios, auth, tokens)
 │    ├── axiosClient.ts
 │    ├── auth.service.ts
 │    └── user.service.ts
 │
 ├── store/                   # Central Redux slices (recommended)
 │    ├── campaign.slice.ts
 │    ├── team.slice.ts
 │    ├── app.slice.ts
 │    └── index.ts
 │
 ├── types/                   # Global TS interfaces
 │    ├── api.ts
 │    ├── common.ts
 │    └── index.ts
 │
 ├── assets/                  # Images, SVGs, icons
 │
 ├── styles/                  # Global CSS and Tailwind config
 │
 ├── main.tsx
 └── index.html
