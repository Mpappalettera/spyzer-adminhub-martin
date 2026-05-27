package com.spyzer.crm_backend.controller;

import com.spyzer.crm_backend.dto.ActividadRecienteDTO;
import com.spyzer.crm_backend.dto.HistorialCapitalDTO;
import com.spyzer.crm_backend.dto.MetricasFinancierasDTO;
import com.spyzer.crm_backend.dto.UsuarioRequestDTO;
import com.spyzer.crm_backend.dto.UsuarioResponseDTO;
import com.spyzer.crm_backend.service.PdfGeneratorService;
import com.spyzer.crm_backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de usuarios del CRM")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PdfGeneratorService pdfGeneratorService;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios registrados en el sistema")
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar usuarios por nombre o apellido")
    public ResponseEntity<List<UsuarioResponseDTO>> buscar(@RequestParam("query") String query) {
        return ResponseEntity.ok(usuarioService.buscarPorQuery(query));
    }

    @PostMapping
    @Operation(summary = "Registrar un nuevo usuario")
    public ResponseEntity<UsuarioResponseDTO> registrar(@Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.guardarUsuario(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos del perfil de un usuario")
    public ResponseEntity<UsuarioResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener perfil completo del usuario por ID")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Buscar usuario por email")
    public ResponseEntity<UsuarioResponseDTO> buscarPorEmail(@PathVariable String email) {
        return ResponseEntity.ok(usuarioService.buscarPorEmail(email));
    }

    @PatchMapping("/{id}/ultima-conexion")
    @Operation(summary = "Actualizar la última conexión del usuario")
    public ResponseEntity<UsuarioResponseDTO> actualizarUltimaConexion(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.actualizarUltimaConexion(id));
    }

    @PostMapping("/{id}/segmentos/procesar")
    @Operation(summary = "Analizar actividad del usuario y asignar segmento automáticamente")
    public ResponseEntity<UsuarioResponseDTO> procesarSegmentos(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.procesarSegmentos(id));
    }

    @GetMapping("/{id}/actividades")
    @Operation(summary = "Historial combinado de operaciones de trading y correos recibidos por el usuario")
    public ResponseEntity<List<ActividadRecienteDTO>> actividadesUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.actividadesUsuario(id));
    }

    @GetMapping("/{id}/metricas")
    @Operation(summary = "Obtener métricas financieras del usuario (cartera, ganancias/pérdidas)")
    public ResponseEntity<MetricasFinancierasDTO> obtenerMetricas(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.calcularMetricas(id));
    }

    @GetMapping("/{id}/historial-capital")
    @Operation(summary = "Obtener progresión temporal del capital total del usuario")
    public ResponseEntity<List<HistorialCapitalDTO>> historialCapital(
            @PathVariable Long id,
            @RequestParam(defaultValue = "6M") String period) {
        return ResponseEntity.ok(usuarioService.historialCapital(id, period));
    }

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "Descargar ficha PDF del usuario con su historial de transacciones")
    public ResponseEntity<byte[]> exportarFichaPdf(@PathVariable Long id) {
        byte[] pdf = pdfGeneratorService.generarFichaUsuarioPdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("ficha-usuario-" + id + ".pdf")
                .build());
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
