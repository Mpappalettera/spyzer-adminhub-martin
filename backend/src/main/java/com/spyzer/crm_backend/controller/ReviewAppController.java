package com.spyzer.crm_backend.controller;

import com.spyzer.crm_backend.dto.AnalisisIaRequestDTO;
import com.spyzer.crm_backend.dto.ReviewAppRequestDTO;
import com.spyzer.crm_backend.dto.ReviewAppResponseDTO;
import com.spyzer.crm_backend.service.ReviewAppService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Valoraciones de usuarios sobre la app Spyzer")
public class ReviewAppController {

    private final ReviewAppService reviewAppService;

    @PostMapping
    @Operation(summary = "Registrar una nueva valoración de usuario")
    public ResponseEntity<ReviewAppResponseDTO> crear(@Valid @RequestBody ReviewAppRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewAppService.guardarReview(dto));
    }

    @GetMapping
    @Operation(summary = "Listar todas las valoraciones")
    public ResponseEntity<List<ReviewAppResponseDTO>> listarTodas() {
        return ResponseEntity.ok(reviewAppService.listarTodas());
    }

    @PatchMapping("/{id}/analisis")
    @Operation(summary = "Actualizar el análisis de IA de una valoración (calificación + sentimiento)")
    public ResponseEntity<ReviewAppResponseDTO> actualizarAnalisisIa(
            @PathVariable Long id,
            @Valid @RequestBody AnalisisIaRequestDTO dto) {
        return ResponseEntity.ok(reviewAppService.actualizarAnalisisIa(id, dto));
    }
}
