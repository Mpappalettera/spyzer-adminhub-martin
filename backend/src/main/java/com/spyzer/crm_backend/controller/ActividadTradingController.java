package com.spyzer.crm_backend.controller;

import com.spyzer.crm_backend.dto.ActividadTradingRequestDTO;
import com.spyzer.crm_backend.dto.ActividadTradingResponseDTO;
import com.spyzer.crm_backend.service.ActividadTradingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/actividades")
@RequiredArgsConstructor
@Tag(name = "Actividades Trading", description = "Registro de operaciones de trading vinculadas a usuarios")
public class ActividadTradingController {

    private final ActividadTradingService actividadTradingService;

    @PostMapping
    @Operation(summary = "Registrar una nueva operación de trading")
    public ResponseEntity<ActividadTradingResponseDTO> registrar(@Valid @RequestBody ActividadTradingRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(actividadTradingService.registrarOperacion(dto));
    }
}
