package com.spyzer.crm_backend.dto;

import com.spyzer.crm_backend.model.EstadoUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
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
public class CampanaEmailRequestDTO {

    private EstadoUsuario publicoObjetivo;

    @NotBlank
    private String asunto;

    @NotBlank
    private String cuerpo;

    private LocalDateTime fechaEnvio;

    @PositiveOrZero
    private BigDecimal inversionMinima;
}
