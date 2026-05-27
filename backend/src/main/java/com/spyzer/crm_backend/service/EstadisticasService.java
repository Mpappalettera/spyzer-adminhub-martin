package com.spyzer.crm_backend.service;

import com.spyzer.crm_backend.dto.ActividadRecienteDTO;
import com.spyzer.crm_backend.dto.KpisDashboardDTO;
import com.spyzer.crm_backend.dto.RegistroMensualDTO;
import com.spyzer.crm_backend.dto.ResumenActividad24hDTO;
import com.spyzer.crm_backend.dto.ReviewsEstadisticasDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface EstadisticasService {

    ResumenActividad24hDTO resumenUltimas24h();

    List<RegistroMensualDTO> usuariosRegistradosPorMes();

    List<ActividadRecienteDTO> actividadReciente();

    Map<String, BigDecimal> obtenerCatalogoInstrumentos();

    KpisDashboardDTO obtenerKpis();

    ReviewsEstadisticasDTO obtenerReviewsEstadisticas();
}
