package com.spyzer.crm_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResumenActividad24hDTO {

    private long totalOperaciones;
    private List<VolumenPorMonedaDTO> volumenPorMoneda;
    private LocalDateTime calculadoDesde;
}
