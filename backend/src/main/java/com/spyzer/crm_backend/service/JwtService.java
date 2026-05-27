package com.spyzer.crm_backend.service;

public interface JwtService {

    String generarToken(String email, String rol);

    String extraerEmail(String token);

    String extraerRol(String token);

    boolean esValido(String token);
}
