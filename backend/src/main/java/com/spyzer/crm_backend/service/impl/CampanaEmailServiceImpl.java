package com.spyzer.crm_backend.service.impl;

import com.spyzer.crm_backend.dto.CampanaEmailRequestDTO;
import com.spyzer.crm_backend.dto.CampanaEmailResponseDTO;
import com.spyzer.crm_backend.model.CampanaEmail;
import com.spyzer.crm_backend.model.CampanaEmail.EstadoCampana;
import com.spyzer.crm_backend.model.EstadoUsuario;
import com.spyzer.crm_backend.model.Usuario;
import com.spyzer.crm_backend.repository.ActividadTradingRepository;
import com.spyzer.crm_backend.repository.CampanaEmailRepository;
import com.spyzer.crm_backend.repository.UsuarioRepository;
import com.spyzer.crm_backend.service.CampanaEmailService;
import com.spyzer.crm_backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampanaEmailServiceImpl implements CampanaEmailService {

    private static final String REVIEW_FOOTER =
            "\n\nValora tu experiencia en: https://spyzer-app.com/reviews-form";

    private final CampanaEmailRepository campanaEmailRepository;
    private final UsuarioRepository usuarioRepository;
    private final ActividadTradingRepository actividadTradingRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public CampanaEmailResponseDTO enviarCampana(CampanaEmailRequestDTO dto) {
        boolean programada = dto.getFechaEnvio() != null && dto.getFechaEnvio().isAfter(LocalDateTime.now());
        EstadoCampana estado = programada ? EstadoCampana.PROGRAMADA : EstadoCampana.ENVIADA;

        EstadoUsuario objetivoEstado = dto.getPublicoObjetivo(); // null → TODOS
        BigDecimal inversionMinima = dto.getInversionMinima() != null
                ? dto.getInversionMinima() : BigDecimal.ZERO;

        LocalDateTime hace15Dias = LocalDateTime.now().minusDays(15);

        List<String> emailsFiltrados = usuarioRepository.findAll().stream()
                .filter(u -> !u.getEmail().endsWith("@spyzerfake.local"))
                .filter(u -> objetivoEstado == null || calcularEstado(u.getId(), hace15Dias) == objetivoEstado)
                .filter(u -> calcularInvertido(u.getId()).compareTo(inversionMinima) >= 0)
                .map(Usuario::getEmail)
                .collect(Collectors.toList());

        String destinatarios = String.join(",", emailsFiltrados);
        String cuerpoConFooter = dto.getCuerpo() + REVIEW_FOOTER;
        String publicoLabel = objetivoEstado != null ? objetivoEstado.name() : "TODOS";

        log.info("Campaña '{}' → segmento={}, inversión mínima={} USD, destinatarios: {}",
                dto.getAsunto(), publicoLabel, inversionMinima, emailsFiltrados.size());

        CampanaEmail campana = CampanaEmail.builder()
                .publicoObjetivo(publicoLabel)
                .asunto(dto.getAsunto())
                .cuerpo(cuerpoConFooter)
                .destinatarios(destinatarios)
                .fechaEnvio(dto.getFechaEnvio() != null ? dto.getFechaEnvio() : LocalDateTime.now())
                .estado(estado)
                .build();

        CampanaEmail guardada = campanaEmailRepository.save(campana);

        if (estado == EstadoCampana.ENVIADA && !emailsFiltrados.isEmpty()) {
            try {
                emailService.enviar(emailsFiltrados.toArray(new String[0]),
                        dto.getAsunto(), cuerpoConFooter);
            } catch (Exception e) {
                log.error("Error al enviar campaña id={}: {}", guardada.getId(), e.getMessage());
            }
        }

        return toResponseDTO(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampanaEmailResponseDTO> listarTodas() {
        return campanaEmailRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private EstadoUsuario calcularEstado(Long usuarioId, LocalDateTime hace15Dias) {
        long ops = actividadTradingRepository.countByUsuarioIdAndFechaActividadAfter(usuarioId, hace15Dias);
        if (ops == 0) return EstadoUsuario.INACTIVO;
        if (ops < 5)  return EstadoUsuario.ACTIVO;
        return EstadoUsuario.VIP;
    }

    private BigDecimal calcularInvertido(Long usuarioId) {
        return actividadTradingRepository.findByUsuarioId(usuarioId).stream()
                .filter(a -> a.getTipo() == null || "COMPRA".equalsIgnoreCase(a.getTipo()))
                .map(a -> a.getPrecio().multiply(a.getCantidad()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CampanaEmailResponseDTO toResponseDTO(CampanaEmail campana) {
        int total = (campana.getDestinatarios() == null || campana.getDestinatarios().isBlank())
                ? 0
                : campana.getDestinatarios().split(",").length;

        return CampanaEmailResponseDTO.builder()
                .id(campana.getId())
                .publicoObjetivo(campana.getPublicoObjetivo())
                .asunto(campana.getAsunto())
                .cuerpo(campana.getCuerpo())
                .destinatarios(campana.getDestinatarios())
                .fechaEnvio(campana.getFechaEnvio())
                .estado(campana.getEstado().name())
                .totalDestinatarios(total)
                .build();
    }
}
