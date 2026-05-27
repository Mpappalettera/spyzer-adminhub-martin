package com.spyzer.crm_backend.controller;

import com.spyzer.crm_backend.dto.AdminRegistroRequestDTO;
import com.spyzer.crm_backend.dto.AdminResponseDTO;
import com.spyzer.crm_backend.dto.LoginRequestDTO;
import com.spyzer.crm_backend.dto.LoginResponseDTO;
import com.spyzer.crm_backend.service.AdministradorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro y login de administradores del CRM")
public class AuthController {

    private final AdministradorService administradorService;

    @PostMapping("/register")
    @Operation(summary = "Registrar un nuevo administrador")
    public ResponseEntity<AdminResponseDTO> register(@Valid @RequestBody AdminRegistroRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(administradorService.registrar(dto));
    }

    @PostMapping("/login")
    @Operation(summary = "Login de administrador — devuelve JWT Bearer token")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(administradorService.login(dto));
    }
}
