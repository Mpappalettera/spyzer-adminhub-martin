package com.spyzer.crm_backend.service;

public interface PdfGeneratorService {

    byte[] generarReporteDashboard();

    byte[] generarFichaUsuarioPdf(Long usuarioId);
}
