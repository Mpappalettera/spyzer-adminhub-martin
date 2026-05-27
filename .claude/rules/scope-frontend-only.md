# Alcance: SOLO Frontend — SpyzerAdminHub

## Contexto

Este es un monorepo con dos carpetas principales:
```
SpyzerAdminHub/
├── frontend/    ← TÚ TRABAJAS AQUÍ (Carlos)
├── backend/     ← NO TOCAR (Martín)
├── README.md    ← NO TOCAR (compartido)
└── CLAUDE.md    ← NO TOCAR (puede ser de Martín)
```

## Qué puedes hacer

✅ Crear, editar y borrar archivos DENTRO de `frontend/`
✅ Leer archivos de `backend/` para entender la API y estructura de datos
✅ Leer el `README.md` raíz para contexto general
✅ Ejecutar comandos npm DENTRO de `frontend/` (cd frontend && npm ...)
✅ Ejecutar git status, git diff, git log (solo lectura)

## Qué tienes PROHIBIDO

🚫 Escribir, editar o borrar cualquier archivo en `backend/`
🚫 Modificar el `README.md` de la raíz
🚫 Modificar el `CLAUDE.md` de la raíz (si existe)
🚫 Crear archivos fuera de `frontend/` (Docker, CI, configs raíz...)
🚫 Ejecutar `git push`, `git reset --hard`, `git merge`
🚫 Ejecutar `rm -rf` en cualquier ámbito
🚫 Ejecutar `npm install` o `npm uninstall` sin permiso explícito
🚫 Modificar `.gitignore` de la raíz sin permiso
🚫 Crear o editar variables de entorno del backend

## Si necesitas algo fuera de tu alcance

PARA y dime exactamente qué necesitas y por qué.
Por ejemplo:
- "Necesito un endpoint GET /api/clients que devuelva X" → Lo coordinamos con Martín.
- "El README raíz necesita instrucciones de instalación del front" → Lo hago yo manualmente, o lo ponemos en frontend/README.md.

## Integración con el backend

Para entender qué endpoints existen, puedes LEER:
- `backend/src/main/java/**/controller/*.java` — Los controladores con los endpoints
- `backend/src/main/java/**/model/*.java` — Los modelos de datos
- `backend/src/main/java/**/dto/*.java` — Los DTOs (lo que realmente devuelve la API)

Pero NUNCA los modifiques. Solo lee para saber qué esperar en tus llamadas fetch.
