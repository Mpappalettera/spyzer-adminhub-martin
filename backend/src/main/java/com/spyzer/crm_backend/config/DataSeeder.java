package com.spyzer.crm_backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spyzer.crm_backend.model.Administrador;
import com.spyzer.crm_backend.model.ActividadTrading;
import com.spyzer.crm_backend.model.ReviewApp;
import com.spyzer.crm_backend.model.Usuario;
import com.spyzer.crm_backend.repository.AdministradorRepository;
import com.spyzer.crm_backend.repository.ActividadTradingRepository;
import com.spyzer.crm_backend.repository.ReviewAppRepository;
import com.spyzer.crm_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AdministradorRepository administradorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ActividadTradingRepository actividadTradingRepository;
    private final ReviewAppRepository reviewAppRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String[] COMENTARIOS = {
        "Excelente plataforma, muy intuitiva y fácil de usar.",
        "Buena experiencia en general, aunque hay margen de mejora.",
        "Las funcionalidades son correctas pero la interfaz podría mejorar.",
        "Muy satisfecho con el servicio, lo recomiendo totalmente.",
        "Cumple con lo que promete, sin más.",
        "Me ha facilitado mucho la gestión de mis operaciones.",
        "Podría mejorar la velocidad de carga de los datos.",
        "Gran herramienta para el seguimiento de activos digitales.",
        "La aplicación es bastante completa y profesional.",
        "Esperaba más funcionalidades avanzadas, pero está bien.",
        "Muy buena aplicación, la uso a diario sin problemas.",
        "El soporte al cliente es excelente y responde rápido.",
        "Interfaz limpia y moderna, me gusta mucho el diseño.",
        "Las estadísticas son muy útiles para tomar decisiones.",
        "Algún bug menor pero en general funciona correctamente."
    };

    @Override
    public void run(String... args) {
         if (administradorRepository.count() > 0) {
             return;
         }

        administradorRepository.save(Administrador.builder()
                .nombre("Admin")
                .apellido("Spyzer")
                .email("admin@spyzer.com")
                .passwordHash(passwordEncoder.encode("admin"))
                .rol("ADMIN")
                .fechaCreacion(LocalDateTime.now())
                .build());

        ClassPathResource jsonResource = new ClassPathResource("crm-export.json");
        if (!jsonResource.exists()) {
            log.warn("crm-export.json no encontrado en el classpath. Omitiendo importación de datos reales.");
            return;
        }

        try (InputStream jsonStream = jsonResource.getInputStream()) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonStream);
            JsonNode usersNode = root.get("users");
            JsonNode transactionsNode = root.get("transactions");

            Map<Integer, Usuario> usuariosMap = new HashMap<>();
            List<Usuario> usuariosGuardados = new ArrayList<>();

            if (usersNode != null) {
                for (JsonNode userNode : usersNode) {
                    int externalId = userNode.get("id").asInt();
                    String fullName = userNode.path("name").asText("Usuario").trim();
                    String[] parts = fullName.split("\\s+", 2);
                    String nombre = parts[0];
                    String apellido = parts.length > 1 ? parts[1] : "";

                    String email = userNode.path("email").asText();
                    String createdAtStr = userNode.path("created_at").asText();
                    LocalDateTime fechaRegistro;
                    try {
                        fechaRegistro = OffsetDateTime.parse(createdAtStr).toLocalDateTime();
                    } catch (Exception ex) {
                        fechaRegistro = LocalDateTime.now();
                    }

                    Usuario usuario = Usuario.builder()
                            .nombre(nombre)
                            .apellido(apellido)
                            .email(email)
                            .fechaRegistro(fechaRegistro)
                            .ultimaConexion(fechaRegistro)
                            .build();

                    Usuario saved = usuarioRepository.save(usuario);
                    usuariosMap.put(externalId, saved);
                    usuariosGuardados.add(saved);
                }
            }

            List<ActividadTrading> actividades = new ArrayList<>();
            if (transactionsNode != null) {
                for (JsonNode txNode : transactionsNode) {
                    int userId = txNode.get("user_id").asInt();
                    Usuario usuario = usuariosMap.get(userId);
                    if (usuario == null) continue;

                    String tipoJson = txNode.path("tipo").asText("BUY");
                    String tipo = "BUY".equalsIgnoreCase(tipoJson) ? "COMPRA" : "VENTA";
                    String instrumento = txNode.path("symbol").asText("AAPL").toUpperCase();
                    BigDecimal precio = new BigDecimal(txNode.path("precio").asText("0"));
                    BigDecimal cantidad = new BigDecimal(txNode.path("cantidad").asText("0"));
                    String timestampStr = txNode.path("timestamp").asText();
                    LocalDateTime fechaActividad;
                    try {
                        fechaActividad = OffsetDateTime.parse(timestampStr).toLocalDateTime();
                    } catch (Exception ex) {
                        fechaActividad = LocalDateTime.now();
                    }

                    actividades.add(ActividadTrading.builder()
                            .tipo(tipo)
                            .instrumento(instrumento)
                            .cantidad(cantidad)
                            .precio(precio)
                            .fechaActividad(fechaActividad)
                            .usuario(usuario)
                            .build());
                }
                actividadTradingRepository.saveAll(actividades);
            }

            if (!usuariosGuardados.isEmpty()) {
                Random random = new Random(42);
                List<ReviewApp> reviews = new ArrayList<>();
                for (int i = 0; i < 20; i++) {
                    reviews.add(ReviewApp.builder()
                            .usuario(usuariosGuardados.get(random.nextInt(usuariosGuardados.size())))
                            .calificacionEstrellas(1 + random.nextInt(5))
                            .comentario(COMENTARIOS[random.nextInt(COMENTARIOS.length)])
                            .fecha(LocalDateTime.now().minusDays(random.nextInt(120)))
                            .build());
                }
                reviewAppRepository.saveAll(reviews);
            }

            log.info("Importación completada: 1 admin, {} usuarios, {} actividades de trading, {} reviews.",
                    usuariosGuardados.size(), actividades.size(),
                    usuariosGuardados.isEmpty() ? 0 : 20);

        } catch (Exception e) {
            log.error("Error al importar crm-export.json: {}", e.getMessage(), e);
        }
    }
}
