package com.spyzer.crm_backend.controller;

import com.spyzer.crm_backend.dto.CampanaEmailRequestDTO;
import com.spyzer.crm_backend.dto.CampanaEmailResponseDTO;
import com.spyzer.crm_backend.service.CampanaEmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campanas")
@RequiredArgsConstructor
@Tag(name = "Campañas Email", description = "Módulo de marketing: creación y envío de campañas de correo")
public class CampanaEmailController {

    private final CampanaEmailService campanaEmailService;

    @GetMapping
    @Operation(summary = "Listar el histórico de todas las campañas creadas y enviadas")
    public ResponseEntity<List<CampanaEmailResponseDTO>> listarTodas() {
        return ResponseEntity.ok(campanaEmailService.listarTodas());
    }

    @PostMapping
    @Operation(summary = "Crear y enviar una campaña de email")
    public ResponseEntity<CampanaEmailResponseDTO> enviarCampana(@Valid @RequestBody CampanaEmailRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campanaEmailService.enviarCampana(dto));
    }

    @GetMapping("/plantillas")
    @Operation(summary = "Obtener plantillas de correo predefinidas para campañas")
    public ResponseEntity<List<Map<String, String>>> obtenerPlantillas() {
        List<Map<String, String>> plantillas = List.of(
                Map.of(
                        "id", "1",
                        "nombre", "Bienvenida Premium",
                        "asunto", "¡Bienvenido a Spyzer Premium! 🚀",
                        "cuerpo", "Hola,\n\nNos complace informarte que ya tienes acceso a todas las funcionalidades premium de Spyzer. " +
                                "Disfruta de análisis avanzados, alertas en tiempo real y soporte prioritario.\n\n" +
                                "Accede ahora: https://app.spyzer.com\n\nEl equipo de Spyzer"
                ),
                Map.of(
                        "id", "2",
                        "nombre", "Reactivación Inactivos",
                        "asunto", "Te echamos de menos en Spyzer 📈",
                        "cuerpo", "Hola,\n\nHemos notado que llevas tiempo sin operar. Los mercados no esperan y hay oportunidades esperándote.\n\n" +
                                "Vuelve ahora y retoma tu actividad en: https://app.spyzer.com\n\n" +
                                "Como regalo de bienvenida, tu gestor personal estará disponible las próximas 48 horas.\n\nEl equipo de Spyzer"
                ),
                Map.of(
                        "id", "3",
                        "nombre", "Oferta VIP Exclusiva",
                        "asunto", "Oferta exclusiva para clientes VIP de Spyzer 💎",
                        "cuerpo", "Hola,\n\nComo cliente VIP de Spyzer, tienes acceso a una oportunidad exclusiva de inversión " +
                                "con comisiones reducidas al 0% durante los próximos 30 días.\n\n" +
                                "Además, accede a nuestro informe de mercado semanal sin coste adicional.\n\n" +
                                "Aprovecha esta oferta en: https://app.spyzer.com/vip\n\nEl equipo de Spyzer"
                )
        );
        return ResponseEntity.ok(plantillas);
    }
}
