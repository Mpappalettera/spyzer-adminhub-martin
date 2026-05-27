package com.spyzer.crm_backend.service.impl;

import com.spyzer.crm_backend.dto.ActividadTradingRequestDTO;
import com.spyzer.crm_backend.dto.ActividadTradingResponseDTO;
import com.spyzer.crm_backend.dto.MetricasFinancierasDTO;
import com.spyzer.crm_backend.exception.ResourceNotFoundException;
import com.spyzer.crm_backend.model.ActividadTrading;
import com.spyzer.crm_backend.model.Usuario;
import com.spyzer.crm_backend.repository.ActividadTradingRepository;
import com.spyzer.crm_backend.repository.UsuarioRepository;
import com.spyzer.crm_backend.service.ActividadTradingService;
import com.spyzer.crm_backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ActividadTradingServiceImpl implements ActividadTradingService {

    private final ActividadTradingRepository actividadTradingRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    @Override
    @Transactional
    public ActividadTradingResponseDTO registrarOperacion(ActividadTradingRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", dto.getUsuarioId()));

        String instrumento = dto.getInstrumento().toUpperCase();
        BigDecimal precio = UsuarioServiceImpl.PRECIOS_ACTUALES.get(instrumento);
        if (precio == null) {
            throw new ResourceNotFoundException("Instrumento", "nombre", instrumento);
        }

        MetricasFinancierasDTO metricas = usuarioService.calcularMetricas(dto.getUsuarioId());
        String tipo = dto.getTipo().toUpperCase();

        if ("COMPRA".equals(tipo)) {
            BigDecimal costTotal = dto.getCantidad().multiply(precio);
            if (costTotal.compareTo(metricas.getLiquidezActual()) > 0) {
                throw new IllegalArgumentException(
                        "Saldo insuficiente. No tienes liquidez para realizar esta compra");
            }
        } else if ("VENTA".equals(tipo)) {
            BigDecimal cantidadPoseida = metricas.getCantidadPorInstrumento() != null
                    ? metricas.getCantidadPorInstrumento().getOrDefault(instrumento, BigDecimal.ZERO)
                    : BigDecimal.ZERO;
            if (dto.getCantidad().compareTo(cantidadPoseida) > 0) {
                throw new IllegalArgumentException(
                        "Operación inválida. No posees suficiente cantidad de este activo para venderlo");
            }
        }

        ActividadTrading actividad = ActividadTrading.builder()
                .tipo(tipo)
                .instrumento(instrumento)
                .cantidad(dto.getCantidad())
                .precio(precio)
                .fechaActividad(dto.getFechaActividad())
                .notas(dto.getNotas())
                .usuario(usuario)
                .build();

        return toResponseDTO(actividadTradingRepository.save(actividad));
    }

    private ActividadTradingResponseDTO toResponseDTO(ActividadTrading actividad) {
        return ActividadTradingResponseDTO.builder()
                .id(actividad.getId())
                .tipo(actividad.getTipo())
                .instrumento(actividad.getInstrumento())
                .cantidad(actividad.getCantidad())
                .precio(actividad.getPrecio())
                .fechaActividad(actividad.getFechaActividad())
                .notas(actividad.getNotas())
                .usuarioId(actividad.getUsuario().getId())
                .usuarioNombreCompleto(actividad.getUsuario().getNombre() + " " + actividad.getUsuario().getApellido())
                .build();
    }
}
