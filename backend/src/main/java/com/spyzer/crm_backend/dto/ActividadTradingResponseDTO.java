package com.spyzer.crm_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActividadTradingResponseDTO {

    private Long id;
    private String tipo;
    private String instrumento;
    private BigDecimal cantidad;
    private BigDecimal precio;
    private LocalDateTime fechaActividad;
    private String notas;
    private Long usuarioId;
    private String usuarioNombreCompleto;
}
