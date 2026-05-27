package com.spyzer.crm_backend.service;

import com.spyzer.crm_backend.dto.ActividadTradingRequestDTO;
import com.spyzer.crm_backend.dto.ActividadTradingResponseDTO;

public interface ActividadTradingService {

    ActividadTradingResponseDTO registrarOperacion(ActividadTradingRequestDTO dto);
}
