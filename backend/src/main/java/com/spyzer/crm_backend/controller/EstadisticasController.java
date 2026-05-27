package com.spyzer.crm_backend.controller;

import com.spyzer.crm_backend.dto.ActividadRecienteDTO;
import com.spyzer.crm_backend.dto.KpisDashboardDTO;
import com.spyzer.crm_backend.dto.RegistroMensualDTO;
import com.spyzer.crm_backend.dto.ResumenActividad24hDTO;
import com.spyzer.crm_backend.dto.ReviewsEstadisticasDTO;

import java.math.BigDecimal;
import java.util.Map;
import com.spyzer.crm_backend.service.EstadisticasService;
import com.spyzer.crm_backend.service.PdfGeneratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Tag(name = "Estadísticas", description = "Métricas e inteligencia de negocio del CRM")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;
    private final PdfGeneratorService pdfGeneratorService;

    @GetMapping("/actividades/ultimas-24h")
    @Operation(summary = "Resumen de operaciones de las últimas 24 horas")
    public ResponseEntity<ResumenActividad24hDTO> resumenUltimas24h() {
        return ResponseEntity.ok(estadisticasService.resumenUltimas24h());
    }

    @GetMapping("/usuarios/por-mes")
    @Operation(summary = "Usuarios registrados agrupados por mes")
    public ResponseEntity<List<RegistroMensualDTO>> usuariosPorMes() {
        return ResponseEntity.ok(estadisticasService.usuariosRegistradosPorMes());
    }

    @GetMapping("/actividad-reciente")
    @Operation(summary = "Últimos eventos del sistema: usuarios, compras y campañas (ordenados por fecha)")
    public ResponseEntity<List<ActividadRecienteDTO>> actividadReciente() {
        return ResponseEntity.ok(estadisticasService.actividadReciente());
    }

    @GetMapping("/instrumentos")
    @Operation(summary = "Catálogo de instrumentos disponibles con su precio de referencia")
    public ResponseEntity<Map<String, BigDecimal>> catalogoInstrumentos() {
        return ResponseEntity.ok(estadisticasService.obtenerCatalogoInstrumentos());
    }

    @GetMapping("/kpis")
    @Operation(summary = "KPIs acumulados de la plataforma: usuarios, operaciones y volumen invertido")
    public ResponseEntity<KpisDashboardDTO> obtenerKpis() {
        return ResponseEntity.ok(estadisticasService.obtenerKpis());
    }

    @GetMapping("/reviews")
    @Operation(summary = "Estadísticas de feedback: nota promedio y desglose por sentimiento de IA")
    public ResponseEntity<ReviewsEstadisticasDTO> obtenerReviews() {
        return ResponseEntity.ok(estadisticasService.obtenerReviewsEstadisticas());
    }

    @GetMapping("/export")
    @Operation(summary = "Exportar el reporte del dashboard como PDF")
    public ResponseEntity<byte[]> exportarDashboard() {
        byte[] pdf = pdfGeneratorService.generarReporteDashboard();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dashboard-report.pdf\"")
                .body(pdf);
    }
}
