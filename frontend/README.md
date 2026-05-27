# Spyzer AdminHub — Frontend

Bienvenido al frontend de **SpyzerAdminHub**, el panel de administración centralizado para la plataforma financiera Spyzer. Esta documentación sirve como punto de entrada y biblioteca de conocimiento para cualquier desarrollador que se una al proyecto.

## 🚀 Acceso y Ejecución Local

Para levantar el proyecto en tu entorno local:

1. Asegúrate de estar en la carpeta `frontend/`.
2. Instala dependencias si no lo has hecho: `npm install`
3. Inicia el servidor de desarrollo: `npm run dev`
4. **URL de acceso:** Abre `http://localhost:5173` en tu navegador.

### Credenciales de Acceso (Entorno Local/Mocks)
El proyecto cuenta con un sistema de Mocks habilitado por defecto para trabajar en UI sin depender del backend.
- **Email:** `admin@spyzer.com`
- **Contraseña:** `admin`

---

## 🏗️ Arquitectura de Carpetas

El proyecto sigue una estructura modular y escalable pensada para el largo plazo:

```text
frontend/
├── public/               # Assets estáticos públicos (favicon, etc.)
├── src/
│   ├── components/       # Componentes UI reutilizables y agnósticos
│   │   ├── Badge/        # Etiquetas de estado/riesgo/sentimiento
│   │   ├── Card/         # Contenedores principales del dashboard
│   │   ├── ClientTable/  # Tabla de datos para clientes
│   │   ├── Sidebar/      # Navegación lateral principal
│   │   ├── TopBar/       # Barra superior (búsqueda, perfil, notificaciones)
│   │   └── AuthRoute/    # Wrapper para proteger rutas privadas
│   ├── context/          # Estados globales (ej: AuthContext)
│   ├── hooks/            # Custom hooks de React (ej: useAuth)
│   ├── layouts/          # Estructuras de página (ej: MainLayout)
│   ├── mocks/            # Datos falsos para desarrollo UI (clientes, emails, etc.)
│   ├── pages/            # Vistas principales de la aplicación
│   │   ├── Login/        # Pantalla de autenticación
│   │   ├── Dashboard/    # Resumen de métricas y gráficas
│   │   ├── ClientProfile/# Vista de detalles y asset allocation de un cliente
│   │   ├── ClientsList/  # Vista de lista de clientes
│   │   ├── Emails/       # Módulo de creación y segmentación de campañas
│   │   └── Reviews/      # Análisis de feedback y sentimiento
│   ├── services/         # Integración y servicios API (api.js, authService.js, etc.)
│   ├── styles/           # Sistema de diseño centralizado
│   │   ├── tokens.css    # Variables globales (Colores, tipografías, espaciados extraídos de Stitch)
│   │   ├── reset.css     # Normalización moderna de CSS
│   │   └── global.css    # Clases utilitarias y estilos base del `body`
│   ├── App.jsx           # Enrutador principal (React Router)
│   └── main.jsx          # Entry point de React
└── vite.config.js        # Configuración de Vite (incluye alias '@/')
```

---

## 🎨 Patrones de Diseño y Convenciones

### 1. Sistema de Diseño y Estilos (CSS Modules)
- **Cero frameworks CSS:** Se utiliza CSS puro modularizado (`[Componente].module.css`) para evitar colisiones de clases y mantener el alcance estricto.
- **Design Tokens:** Todo el sistema visual (colores `#131313`, `#aec6ff`, tipografía `Inter`, espaciados) está centralizado en `src/styles/tokens.css` usando variables nativas (`var(--primary)`). **Nunca uses colores quemados en los componentes**.
- **Enfoque Desktop-First:** El diseño base en los archivos CSS está pensado para `1440px`, utilizando `@media queries` al final de los archivos para adaptar a tablet y móvil.

### 2. Componentización UI
- Los componentes en `src/components/` deben ser "tontos" (dumb components). Solo reciben `props` y emiten eventos.
- Las páginas en `src/pages/` son los "smart components". Ellos orquestan el layout, consumen el contexto/mocks y gestionan el estado principal.

### 3. Autenticación y Contexto
- El estado del usuario se maneja globalmente usando **Context API** (`AuthContext`).
- Las rutas privadas están protegidas por el componente `<AuthRoute />` a nivel de `App.jsx`.

### 4. Transiciones y Gráficos
- **Animaciones:** Se utiliza `framer-motion`. Todas las páginas implementan un patrón de entrada de tipo `stagger` y `slideUp` para cargar los elementos de forma escalonada y orgánica, transmitiendo una sensación *premium*.
- **Visualización de Datos:** Se utiliza `recharts`. Los gráficos están fuertemente estilizados (ej. SVG defs con gradientes lineales) para casar perfectamente con el tema oscuro del dashboard.

---

## 🔄 Flujo de Trabajo Frontend ↔ Backend

Actualmente, el proyecto está configurado para consumir **Mocks** (datos locales simulados) de forma predeterminada para no bloquear el desarrollo visual. 
- En el futuro, se utilizarán variables de entorno (ej. `.env.local` con `VITE_USE_MOCKS=false`) para alternar al consumo real de los endpoints en Spring Boot.
- La comunicación API se encapsulará en un wrapper global (`src/services/api.js` próximamente) para inyectar automáticamente el JWT Bearer token devuelto en el Login.

---
*(A continuación se mantiene la documentación original autogenerada de Vite para referencia técnica base)*

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## 🛠️ Mejoras e Implementaciones Recientes (20 de Mayo, 2026)

### 1. Cabecera con Scroll Glassmorphism (TopBar)
Se implementó un efecto de desenfoque de cristal (glassmorphism) sobre el componente `TopBar`. Al hacer scroll hacia abajo, la barra superior se queda fija con un fondo traslúcido y desenfoque (`backdrop-filter: blur(12px)`), permitiendo ver el contenido inferior difuminado de forma premium.

### 2. Sidebar Colapsable Dinámica (Iconos Estáticos de 32px)
- **Botón de 3 Rayas (Menú Hamburguesa):** Se añadió el botón `[ ☰ ]` en la cabecera de la Sidebar, a la izquierda del logo. Al pulsarlo, el botón gira `360 grados` sobre sí mismo en una animación fluida de `0.3s`, en sincronía con el colapso lateral de la barra.
- **Alineación de Iconos Antidesplazamiento:** Se eliminaron las desalineaciones bruscas al colapsar/desplegar la Sidebar. Ajustando de forma estática los paddings (`padding-left: 8px` en `.navItem` y `12px` de padding en `nav`), los iconos de **32px** se quedan 100% inmóviles en su eje horizontal (`22px` desde el borde izquierdo). Al colapsar la barra a `64px`, los iconos quedan perfectamente centrados de manera natural.
- **Drawer en Móviles:** En pantallas menores a `1024px`, el botón de colapso interno de la Sidebar se oculta automáticamente, permitiendo usarla en pantalla completa tipo Drawer nativo para una experiencia móvil limpia.

### 3. Icono Dashboard Interactivo (Lottie)
- **Integración de `lottie-react`:** Se instaló la dependencia y se integró un componente dinámico para el Dashboard utilizando la animación Lottie `Report V2 (1)` (renombrada a `dashboard.json`).
- **Animación Hover & Flotación:** Al pasar el ratón por encima del enlace, la animación Lottie interna se reproduce automáticamente en bucle. Además, los iconos tienen una micro-animación CSS que los eleva suavemente `2px` hacia arriba (`translateY(-2px)`) en hover, dando un efecto dinámico de flotabilidad.
