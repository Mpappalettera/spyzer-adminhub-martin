package com.spyzer.crm_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalisisIaRequestDTO {

    @NotNull
    @Min(1)
    @Max(5)
    private Integer calificacionEstrellas;

    @NotBlank
    private String sentimientoIa;
}
