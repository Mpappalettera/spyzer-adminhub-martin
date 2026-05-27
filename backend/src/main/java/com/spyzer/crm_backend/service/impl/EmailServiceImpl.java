package com.spyzer.crm_backend.service.impl;

import com.spyzer.crm_backend.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private static final String DOMINIO_FICTICIO = "@spyzerfake.local";

    // Optional: la app arranca aunque no esté configurado el servidor de correo
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void enviar(String[] destinatarios, String asunto, String cuerpo) {
        List<String> reales = new ArrayList<>();

        for (String email : destinatarios) {
            if (email.endsWith(DOMINIO_FICTICIO)) {
                log.info("Campaña [SIMULACIÓN]: Correo retenido para usuario ficticio -> {}", email);
            } else {
                reales.add(email);
            }
        }

        if (reales.isEmpty()) {
            log.info("Campaña '{}': todos los destinatarios son ficticios, no se envía tráfico real.", asunto);
            return;
        }

        if (mailSender == null) {
            log.warn("JavaMailSender no configurado. Correos reales pendientes: {}", reales);
            return;
        }

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(reales.toArray(new String[0]));
        mensaje.setSubject(asunto);
        mensaje.setText(cuerpo);
        mailSender.send(mensaje);
        log.info("Campaña '{}' enviada a {} destinatarios reales.", asunto, reales.size());
    }
}
