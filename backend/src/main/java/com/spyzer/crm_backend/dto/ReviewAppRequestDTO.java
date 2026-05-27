package com.spyzer.crm_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewAppRequestDTO {

    @NotNull
    private Long usuarioId;

    @NotNull
    @Min(1) @Max(5)
    private Integer calificacionEstrellas;

    private String comentario;

    @NotNull
    private LocalDateTime fecha;
}
