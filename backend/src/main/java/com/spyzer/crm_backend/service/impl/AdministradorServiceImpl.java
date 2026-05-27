package com.spyzer.crm_backend.service.impl;

import com.spyzer.crm_backend.dto.AdminRegistroRequestDTO;
import com.spyzer.crm_backend.dto.AdminResponseDTO;
import com.spyzer.crm_backend.dto.LoginRequestDTO;
import com.spyzer.crm_backend.dto.LoginResponseDTO;
import com.spyzer.crm_backend.exception.CredencialesInvalidasException;
import com.spyzer.crm_backend.exception.EmailDuplicadoException;
import com.spyzer.crm_backend.exception.ResourceNotFoundException;
import com.spyzer.crm_backend.model.Administrador;
import com.spyzer.crm_backend.repository.AdministradorRepository;
import com.spyzer.crm_backend.service.AdministradorService;
import com.spyzer.crm_backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdministradorServiceImpl implements AdministradorService {

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AdminResponseDTO registrar(AdminRegistroRequestDTO dto) {
        if (administradorRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailDuplicadoException(dto.getEmail());
        }

        Administrador admin = Administrador.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .rol(dto.getRol())
                .fechaCreacion(LocalDateTime.now())
                .build();

        return toResponseDTO(administradorRepository.save(admin));
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO dto) {
        Administrador admin = administradorRepository.findByEmail(dto.getEmail())
                .orElseThrow(CredencialesInvalidasException::new);

        if (!passwordEncoder.matches(dto.getPassword(), admin.getPasswordHash())) {
            throw new CredencialesInvalidasException();
        }

        String token = jwtService.generarToken(admin.getEmail(), admin.getRol());

        return LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .rol(admin.getRol())
                .nombre(admin.getNombre())
                .build();
    }

    private AdminResponseDTO toResponseDTO(Administrador admin) {
        return AdminResponseDTO.builder()
                .id(admin.getId())
                .nombre(admin.getNombre())
                .apellido(admin.getApellido())
                .email(admin.getEmail())
                .rol(admin.getRol())
                .fechaCreacion(admin.getFechaCreacion())
                .build();
    }
}
