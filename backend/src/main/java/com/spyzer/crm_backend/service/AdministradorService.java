package com.spyzer.crm_backend.service;

import com.spyzer.crm_backend.dto.AdminRegistroRequestDTO;
import com.spyzer.crm_backend.dto.AdminResponseDTO;
import com.spyzer.crm_backend.dto.LoginRequestDTO;
import com.spyzer.crm_backend.dto.LoginResponseDTO;

public interface AdministradorService {

    AdminResponseDTO registrar(AdminRegistroRequestDTO dto);

    LoginResponseDTO login(LoginRequestDTO dto);
}
