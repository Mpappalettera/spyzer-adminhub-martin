package com.spyzer.crm_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews_app")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewApp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @ToString.Exclude
    private Usuario usuario;

    @NotNull
    @Min(1) @Max(5)
    @Column(name = "calificacion_estrellas", nullable = false)
    private Integer calificacionEstrellas;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    // Rellenado por un agente IA externo tras el análisis de sentimiento
    @Column(name = "sentimiento_ia")
    private String sentimientoIa;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime fecha;
}
