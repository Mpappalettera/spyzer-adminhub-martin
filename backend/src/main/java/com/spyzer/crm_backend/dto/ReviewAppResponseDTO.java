package com.spyzer.crm_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewAppResponseDTO {

    private Long id;
    private Long usuarioId;
    private Integer calificacionEstrellas;
    private String comentario;
    private String sentimientoIa;
    private LocalDateTime fecha;
}
