package com.spyzer.crm_backend.service.impl;

import com.spyzer.crm_backend.dto.ActividadRecienteDTO;
import com.spyzer.crm_backend.dto.KpisDashboardDTO;
import com.spyzer.crm_backend.dto.RegistroMensualDTO;
import com.spyzer.crm_backend.dto.ResumenActividad24hDTO;
import com.spyzer.crm_backend.dto.ReviewsEstadisticasDTO;
import com.spyzer.crm_backend.dto.VolumenPorMonedaDTO;
import com.spyzer.crm_backend.model.CampanaEmail.EstadoCampana;
import com.spyzer.crm_backend.repository.ActividadTradingRepository;
import com.spyzer.crm_backend.repository.CampanaEmailRepository;
import com.spyzer.crm_backend.repository.ReviewAppRepository;
import com.spyzer.crm_backend.repository.UsuarioRepository;
import com.spyzer.crm_backend.service.EstadisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstadisticasServiceImpl implements EstadisticasService {

    private final ActividadTradingRepository actividadTradingRepository;
    private final UsuarioRepository usuarioRepository;
    private final CampanaEmailRepository campanaEmailRepository;
    private final ReviewAppRepository reviewAppRepository;

    @Override
    @Transactional(readOnly = true)
    public ResumenActividad24hDTO resumenUltimas24h() {
        LocalDateTime desde = LocalDateTime.now().minusHours(24);

        long totalOps = actividadTradingRepository.countDesde(desde);

        List<VolumenPorMonedaDTO> volumen = actividadTradingRepository
                .volumenPorMonedaDesde(desde)
                .stream()
                .map(row -> VolumenPorMonedaDTO.builder()
                        .instrumento(row[0] != null ? (String) row[0] : "SIN_INSTRUMENTO")
                        .volumenTotal(row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO)
                        .build())
                .toList();

        return ResumenActividad24hDTO.builder()
                .totalOperaciones(totalOps)
                .volumenPorMoneda(volumen)
                .calculadoDesde(desde)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistroMensualDTO> usuariosRegistradosPorMes() {
        return usuarioRepository.countRegistrosPorMes()
                .stream()
                .map(row -> RegistroMensualDTO.builder()
                        .anio(((Number) row[0]).intValue())
                        .mes(((Number) row[1]).intValue())
                        .totalUsuarios(((Number) row[2]).longValue())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActividadRecienteDTO> actividadReciente() {
        List<ActividadRecienteDTO> eventos = new ArrayList<>();

        usuarioRepository.findTop20ByOrderByFechaRegistroDesc().forEach(u ->
                eventos.add(ActividadRecienteDTO.builder()
                        .tipoEvento("USUARIO")
                        .descripcion("Nuevo usuario: " + u.getNombre() + " " + u.getApellido())
                        .fecha(u.getFechaRegistro())
                        .build())
        );

        actividadTradingRepository.findTop20ByOrderByFechaActividadDesc().forEach(a -> {
            String tipo = a.getTipo() != null ? a.getTipo().toUpperCase() : "COMPRA";
            eventos.add(ActividadRecienteDTO.builder()
                    .tipoEvento("TRADING")
                    .descripcion(tipo + " de " + a.getInstrumento() + " × " + a.getCantidad().toPlainString())
                    .fecha(a.getFechaActividad())
                    .build());
        });

        campanaEmailRepository.findTop10ByEstadoOrderByFechaEnvioDesc(EstadoCampana.ENVIADA).forEach(c ->
                eventos.add(ActividadRecienteDTO.builder()
                        .tipoEvento("CAMPANA")
                        .descripcion("Campaña enviada: " + c.getAsunto())
                        .fecha(c.getFechaEnvio())
                        .build())
        );

        return eventos.stream()
                .sorted(Comparator.comparing(ActividadRecienteDTO::getFecha,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(50)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, BigDecimal> obtenerCatalogoInstrumentos() {
        return UsuarioServiceImpl.PRECIOS_ACTUALES;
    }

    @Override
    @Transactional(readOnly = true)
    public KpisDashboardDTO obtenerKpis() {
        long totalUsuarios = usuarioRepository.count();
        long totalOperaciones = actividadTradingRepository.count();
        BigDecimal volumen = actividadTradingRepository.sumVolumenTotalCompras();
        return KpisDashboardDTO.builder()
                .totalUsuarios(totalUsuarios)
                .totalOperaciones(totalOperaciones)
                .volumenTotalInvertido(volumen != null
                        ? volumen.setScale(2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewsEstadisticasDTO obtenerReviewsEstadisticas() {
        Double promedio = reviewAppRepository.calcularPromedioCalificacion();
        BigDecimal notaPromedio = promedio != null
                ? BigDecimal.valueOf(promedio).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, String> equivalenciasIngles = Map.of(
                "POSITIVO", "Positive",
                "NEGATIVO", "Negative",
                "NEUTRO", "Neutral"
        );

        Map<String, Long> desglose = new LinkedHashMap<>();
        for (String sentimiento : List.of("POSITIVO", "NEGATIVO", "NEUTRO")) {
            long count = reviewAppRepository.countBySentimientoIa(sentimiento);
            if (count == 0) {
                count = reviewAppRepository.countBySentimientoIa(equivalenciasIngles.get(sentimiento));
            }
            desglose.put(sentimiento, count);
        }

        long totalReviews = desglose.values().stream().mapToLong(Long::longValue).sum();
        Map<String, Double> porcentajes = new LinkedHashMap<>();
        if (totalReviews > 0) {
            desglose.forEach((sent, count) ->
                    porcentajes.put(sent,
                            BigDecimal.valueOf((double) count / totalReviews * 100)
                                    .setScale(2, RoundingMode.HALF_UP)
                                    .doubleValue()));
        } else {
            desglose.keySet().forEach(sent -> porcentajes.put(sent, 0.0));
        }

        return ReviewsEstadisticasDTO.builder()
                .notaPromedio(notaPromedio)
                .desglosePorSentimiento(desglose)
                .porcentajesPorSentimiento(porcentajes)
                .build();
    }
}
