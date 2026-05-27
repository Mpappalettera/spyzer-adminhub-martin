package com.spyzer.crm_backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.spyzer.crm_backend.dto.AnalisisIaRequestDTO;
import com.spyzer.crm_backend.dto.NlpReviewRequestDTO;
import com.spyzer.crm_backend.dto.NlpReviewResponseDTO;
import com.spyzer.crm_backend.dto.ReviewAppRequestDTO;
import com.spyzer.crm_backend.dto.ReviewAppResponseDTO;
import com.spyzer.crm_backend.exception.ResourceNotFoundException;
import com.spyzer.crm_backend.model.ReviewApp;
import com.spyzer.crm_backend.model.Usuario;
import com.spyzer.crm_backend.repository.ReviewAppRepository;
import com.spyzer.crm_backend.repository.UsuarioRepository;
import com.spyzer.crm_backend.service.ReviewAppService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewAppServiceImpl implements ReviewAppService {

    private final ReviewAppRepository reviewAppRepository;
    private final UsuarioRepository usuarioRepository;
    // Proper Dependency Injection via Lombok @RequiredArgsConstructor
    private final RestTemplate restTemplate;
    
    private static final String NLP_API_URL = "https://gaining-guide-throwaway.ngrok-free.dev/predict_review";

    @Override
    // REMOVED @Transactional: Isolate slow network IO from database connection pools
    public ReviewAppResponseDTO guardarReview(ReviewAppRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", dto.getUsuarioId()));

        String sentimentResult = "Neutral"; // Default mapping

        try {
            NlpReviewRequestDTO nlpRequest = new NlpReviewRequestDTO(dto.getComentario());
            NlpReviewResponseDTO nlpResponse = restTemplate.postForObject(NLP_API_URL, nlpRequest, NlpReviewResponseDTO.class);
            
            if (nlpResponse != null && nlpResponse.getSentiment() != null) {
                sentimentResult = nlpResponse.getSentiment();
                log.info("NLP API returned sentiment: {} with confidence {} using {}", 
                    sentimentResult, nlpResponse.getConfidence_score(), nlpResponse.getModel_used());
            }
        } catch (Exception e) {
            log.warn("Failed to connect to NLP API at {}. Defaulting sentiment to Neutral. Error: {}", NLP_API_URL, e.getMessage());
        }

        ReviewApp review = ReviewApp.builder()
                .usuario(usuario)
                .calificacionEstrellas(dto.getCalificacionEstrellas())
                .comentario(dto.getComentario())
                .fecha(dto.getFecha())
                .sentimientoIa(sentimentResult)
                .build();

        return toResponseDTO(saveReviewInTransaction(review));
    }

    // Helper method to keep the actual DB save operation wrapped inside a short-lived transaction
    @Transactional
    protected ReviewApp saveReviewInTransaction(ReviewApp review) {
        return reviewAppRepository.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewAppResponseDTO> listarTodas() {
        return reviewAppRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewAppResponseDTO> obtenerReviewsPendientesDeAnalisis() {
        return reviewAppRepository.findBySentimientoIaIsNull()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public ReviewAppResponseDTO actualizarAnalisisIa(Long id, AnalisisIaRequestDTO dto) {
        ReviewApp review = reviewAppRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReviewApp", "id", id));

        review.setCalificacionEstrellas(dto.getCalificacionEstrellas());
        review.setSentimientoIa(dto.getSentimientoIa());

        return toResponseDTO(reviewAppRepository.save(review));
    }

    private ReviewAppResponseDTO toResponseDTO(ReviewApp review) {
        return ReviewAppResponseDTO.builder()
                .id(review.getId())
                .usuarioId(review.getUsuario().getId())
                .calificacionEstrellas(review.getCalificacionEstrellas())
                .comentario(review.getComentario())
                .sentimientoIa(review.getSentimientoIa())
                .fecha(review.getFecha())
                .build();
    }
}