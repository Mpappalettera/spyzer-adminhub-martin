# CRM Backend - Proyecto TFG DAM

## 1. Contexto del Proyecto
Este proyecto es el backend (API REST) para un CRM diseñado para gestionar, analizar y segmentar a los usuarios de una aplicación externa de trading de criptomonedas llamada "Spyzer". 
El objetivo principal es recopilar datos de actividad, generar métricas (tiempo de conexión, operaciones web) y permitir acciones de marketing (envíos de correos masivos). El frontend será desarrollado por otro compañero en React.

## 2. Stack Tecnológico
- **Lenguaje:** Java (17/21)
- **Framework:** Spring Boot 3.x
- **Gestión de dependencias:** Maven
- **Base de Datos:** PostgreSQL (o MySQL)
- **ORM:** Spring Data JPA / Hibernate
- **Seguridad:** Spring Security con JWT
- **Documentación:** Swagger (Springdoc OpenAPI)

## 3. Arquitectura del Sistema
El código debe seguir una arquitectura por capas estricta:
- `Controller`: Endpoints REST documentados.
- `Service`: Lógica de negocio pura.
- `Repository`: Interfaces JPA.
- `Model (Entity)`: Entidades de la base de datos.
- `DTO (Data Transfer Object)`: Para la transferencia de datos entre Controller y Service.

## 4. Estructura de Datos Base (MVP)
1. **Usuarios (Clientes de Spyzer):** id, email, fecha_registro, ultima_conexion, tiempo_total_conexion_minutos.
2. **Actividad_Trading:** id, usuario_id, numero_operaciones, volumen_estimado, moneda_favorita.
3. **Segmentos:** id, nombre_segmento, descripcion, criterios_filtro.
4. **Administradores:** id, email, password_hash, rol (ADMIN, MARKETING).

## 5. Fase 5 — Módulo de Reviews y Campañas

5. **ReviewApp:** id, usuario_id, calificacion_estrellas (1–5), comentario, sentimiento_ia (relleno por agente IA), fecha.
6. **CampanaEmail:** id, publico_objetivo, asunto, cuerpo, fecha_envio, estado (BORRADOR, PROGRAMADA, ENVIADA).

## 5. Instrucciones para Asistentes de IA (AI Guidelines)
Si eres un asistente de IA (como Claude, Gemini, etc.) leyendo este documento para ayudarme a generar código, DEBES seguir estas reglas estrictas:
- **No inventes dependencias:** Utiliza solo lo definido en el `pom.xml`.
- **Usa Lombok:** Omite escribir constructores, getters y setters a mano. Usa las anotaciones `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`.
- **Paso a paso:** No generes todo el sistema de una vez. Espera a que te pida un módulo específico (ej. "Genera la entidad y repositorio de Usuario").
- **Manejo de Errores:** Implementa un `GlobalExceptionHandler` usando `@ControllerAdvice` para devolver respuestas JSON limpias en caso de error.
- **DTOs:** Nunca devuelvas las entidades JPA directamente en los Controllers. Utiliza DTOs.