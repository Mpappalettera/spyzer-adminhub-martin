package com.spyzer.crm_backend.service;

import com.spyzer.crm_backend.dto.CampanaEmailRequestDTO;
import com.spyzer.crm_backend.dto.CampanaEmailResponseDTO;

import java.util.List;

public interface CampanaEmailService {

    CampanaEmailResponseDTO enviarCampana(CampanaEmailRequestDTO dto);

    List<CampanaEmailResponseDTO> listarTodas();
}
