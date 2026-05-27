package com.spyzer.crm_backend.dto;

import com.spyzer.crm_backend.model.EstadoUsuario;
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
public class UsuarioResponseDTO {

    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String direccion;
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimaConexion;
    private EstadoUsuario estadoUsuario;
    private BigDecimal capitalTotal;
    private BigDecimal beneficioTotal;
    private BigDecimal liquidezActual;
    private BigDecimal totalInvertido;
}
