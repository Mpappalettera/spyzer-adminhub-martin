package com.spyzer.crm_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
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
public class ActividadTradingRequestDTO {

    @NotBlank
    @Pattern(regexp = "COMPRA|VENTA", message = "El tipo debe ser COMPRA o VENTA")
    private String tipo;

    @NotBlank
    private String instrumento;

    @NotNull
    @Positive
    private BigDecimal cantidad;

    @NotNull
    private LocalDateTime fechaActividad;

    private String notas;

    @NotNull
    private Long usuarioId;
}
