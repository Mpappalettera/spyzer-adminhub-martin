# Instrucciones para Claude Code - CRM Backend

## Comandos de construcción
- Compilar: `mvn clean install`
- Ejecutar: `mvn spring-boot:run`
- Tests: `mvn test`

## Estilo y Convenciones
- **Lombok**: Obligatorio. Usar `@Data`, `@Builder`, `@AllArgsConstructor` y `@NoArgsConstructor`.
- **Arquitectura**: 4 capas (Controller -> Service -> Repository -> Entity).
- **DTOs**: Nunca exponer Entidades JPA en los Controllers. Usar clases DTO y un Mapper (o manual).
- **Validación**: Usar `jakarta.validation` (`@NotNull`, `@Email`, etc.).
- **Base de Datos**: PostgreSQL. Nombres de tablas en snake_case (ej: `usuarios_app`).

## Flujo de Trabajo
1. Antes de crear un archivo, verifica si el paquete (package) existe.
2. Si añades una dependencia, hazlo en el `pom.xml` y avisa.
3. El manejo de excepciones debe ser centralizado en un `GlobalExceptionHandler`.