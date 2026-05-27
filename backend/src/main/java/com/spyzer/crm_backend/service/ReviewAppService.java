package com.spyzer.crm_backend.service;

import com.spyzer.crm_backend.dto.AnalisisIaRequestDTO;
import com.spyzer.crm_backend.dto.ReviewAppRequestDTO;
import com.spyzer.crm_backend.dto.ReviewAppResponseDTO;

import java.util.List;

public interface ReviewAppService {

    ReviewAppResponseDTO guardarReview(ReviewAppRequestDTO dto);

    List<ReviewAppResponseDTO> listarTodas();

    List<ReviewAppResponseDTO> obtenerReviewsPendientesDeAnalisis();

    ReviewAppResponseDTO actualizarAnalisisIa(Long id, AnalisisIaRequestDTO dto);
}
