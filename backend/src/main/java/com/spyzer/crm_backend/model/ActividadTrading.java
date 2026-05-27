package com.spyzer.crm_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "actividades_trading")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActividadTrading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "tipo", nullable = false, columnDefinition = "VARCHAR(10) DEFAULT 'COMPRA'")
    private String tipo;

    @NotNull
    @Column(nullable = false)
    private String instrumento;

    @NotNull
    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal cantidad;

    @NotNull
    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal precio;

    @NotNull
    @Column(name = "fecha_actividad", nullable = false)
    private LocalDateTime fechaActividad;

    private String notas;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @ToString.Exclude
    private Usuario usuario;
}
