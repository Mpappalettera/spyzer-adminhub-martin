package com.spyzer.crm_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewsEstadisticasDTO {

    private BigDecimal notaPromedio;
    private Map<String, Long> desglosePorSentimiento;
    private Map<String, Double> porcentajesPorSentimiento;
}
