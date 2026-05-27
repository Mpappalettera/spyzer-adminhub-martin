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
public class CampanaEmailResponseDTO {

    private Long id;
    private String publicoObjetivo;
    private String asunto;
    private String cuerpo;
    private String destinatarios;
    private LocalDateTime fechaEnvio;
    private String estado;
    private Integer totalDestinatarios;
}
