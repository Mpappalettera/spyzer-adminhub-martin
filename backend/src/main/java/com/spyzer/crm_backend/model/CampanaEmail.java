package com.spyzer.crm_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "campanas_email")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CampanaEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "publico_objetivo", nullable = false)
    private String publicoObjetivo;

    @NotBlank
    @Column(nullable = false)
    private String asunto;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String cuerpo;

    @Column(columnDefinition = "TEXT")
    private String destinatarios;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoCampana estado;

    public enum EstadoCampana {
        BORRADOR, PROGRAMADA, ENVIADA
    }
}
