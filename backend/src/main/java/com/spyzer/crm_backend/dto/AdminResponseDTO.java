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
public class AdminResponseDTO {

    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;
    private LocalDateTime fechaCreacion;
}
