package com.spyzer.crm_backend.exception;

public class EmailDuplicadoException extends RuntimeException {

    public EmailDuplicadoException(String email) {
        super(String.format("Ya existe un usuario registrado con el email: '%s'", email));
    }
}
