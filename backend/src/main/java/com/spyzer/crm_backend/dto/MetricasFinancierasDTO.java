package com.spyzer.crm_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MetricasFinancierasDTO {

    private BigDecimal invertido;
    private BigDecimal liquidezActual;
    private BigDecimal valorActualAcciones;
    private BigDecimal gananciaPerdida;
    private Map<String, Double> distribucionCarteraPorcentaje;
    private List<BigDecimal> historialGananciasMensuales;
    private Map<String, BigDecimal> cantidadPorInstrumento;
}
