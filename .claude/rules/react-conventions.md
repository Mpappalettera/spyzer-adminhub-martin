# Convenciones de React — SpyzerAdminHub Frontend

## Componentes

- Funcionales + hooks. Nunca clases.
- Si un componente pasa de ~150 líneas, propón dividirlo antes de seguir.
- Props destructuradas en la firma: `function Card({ title, children }) {...}`
- Named exports en `components/`; default export solo en `pages/`.
- Cada componente en su propia carpeta si tiene más de 1 archivo asociado:
  ```
  components/
  └── Button/
      ├── Button.jsx
      ├── Button.module.css
      └── index.js          # re-export
  ```

## Hooks

- Reglas de hooks estrictas: nada de hooks dentro de condicionales o loops.
- Custom hooks empiezan por `use` y devuelven objetos o tuplas consistentes.
- Si tienes 3+ useState relacionados, usa useReducer.
- useEffect con dependencias completas. Si ESLint avisa, no lo silencies; arréglalo.
- Cleanup obligatorio en suscripciones, timers y event listeners.

## Patrones de página

Cada página sigue este esquema:
```
pages/
└── Dashboard/
    ├── Dashboard.jsx        # Solo layout y composición de componentes
    ├── Dashboard.module.css
    ├── components/          # Componentes exclusivos de esta página
    └── index.js
```
La lógica de datos va en hooks (`useDashboardData`) o services, NO en el JSX de la página.

## Gestión de estado

- Props drilling hasta 2 niveles; más allá, usa Context.
- Un Context por dominio: `AuthContext`, `ThemeContext`.
- No usamos Redux. Si surge la necesidad, discutirlo primero.

## Manejo de errores

- Componente `ErrorBoundary` global en `App.jsx`.
- En llamadas a API: siempre try/catch, siempre feedback visual al usuario (loading, error, vacío).
- Nunca `console.log` en producción; usa solo en desarrollo y limpia antes de commit.

## Imports

Orden de imports (el linter lo fuerza, pero tenlo presente):
1. React / librerías externas
2. Componentes internos (`@/components/...`)
3. Hooks (`@/hooks/...`)
4. Services (`@/services/...`)
5. Estilos (`.module.css`)
6. Assets
