package com.spyzer.crm_backend.service;

public interface EmailService {

    void enviar(String[] destinatarios, String asunto, String cuerpo);
}
