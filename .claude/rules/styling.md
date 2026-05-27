# Sistema de Estilos — SpyzerAdminHub Frontend

## Paleta de colores (tema oscuro Spyzer)

Todos los colores están en `src/styles/tokens.css` como variables CSS.
NUNCA uses colores hardcodeados (#hex directo en componentes). Siempre `var(--nombre)`.

Paleta base (extraída del diseño Stitch/Spyzer):
```css
:root {
  /* Fondos */
  --bg-primary: #0D1117;        /* Fondo principal */
  --bg-secondary: #161B22;      /* Cards, sidebar */
  --bg-tertiary: #1C2128;       /* Inputs, dropdowns */
  --bg-hover: #21262D;          /* Hover sobre cards/filas */

  /* Texto */
  --text-primary: #E6EDF3;      /* Texto principal */
  --text-secondary: #8B949E;    /* Texto secundario, labels */
  --text-muted: #484F58;        /* Texto deshabilitado */

  /* Acentos */
  --accent-blue: #58A6FF;       /* Links, botones primarios */
  --accent-green: #3FB950;      /* Positivo, cambios up */
  --accent-red: #F85149;        /* Negativo, errores, cambios down */
  --accent-orange: #D29922;     /* Warnings */
  --accent-purple: #BC8CFF;     /* Info secundaria */

  /* Bordes */
  --border-default: #30363D;
  --border-muted: #21262D;

  /* Radios */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Espaciado (múltiplos de 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Tipografía */
  --font-family: 'Inter', -apple-system, sans-serif;
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 2rem;       /* 32px */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);

  /* Transiciones */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}
```

## CSS Modules

- Cada componente: `Componente.module.css` junto al `.jsx`.
- Clases en camelCase: `.cardContainer`, `.headerTitle`.
- Import: `import styles from './Button.module.css'`
- Uso: `className={styles.cardContainer}`
- Para clases condicionales: template literals o librería `clsx` (ya instalada).

## Responsive (mobile-first)

Breakpoints:
```css
/* Mobile first: el CSS base es para móvil */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Desktop grande */ }
```

El sidebar se colapsa en móvil a un menú hamburguesa.
Las cards del dashboard pasan de 1 columna (móvil) a grid (desktop).

## Reglas estrictas

- Si un valor (color, espaciado, radio) no existe en tokens.css, **pregúntame antes de añadirlo**.
- No uses `!important` salvo caso justificado (explícalo en comentario).
- No mezcles inline styles con CSS Modules salvo para valores dinámicos (ej. `style={{ width: `${progress}%` }}`).
- Animaciones: solo las que estén en el diseño Stitch o que yo pida explícitamente.
