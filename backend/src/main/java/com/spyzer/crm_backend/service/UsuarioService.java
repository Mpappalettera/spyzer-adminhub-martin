package com.spyzer.crm_backend.service;

import com.spyzer.crm_backend.dto.ActividadRecienteDTO;
import com.spyzer.crm_backend.dto.HistorialCapitalDTO;
import com.spyzer.crm_backend.dto.MetricasFinancierasDTO;
import com.spyzer.crm_backend.dto.UsuarioRequestDTO;
import com.spyzer.crm_backend.dto.UsuarioResponseDTO;

import java.util.List;

public interface UsuarioService {

    UsuarioResponseDTO guardarUsuario(UsuarioRequestDTO dto);

    UsuarioResponseDTO buscarPorId(Long id);

    UsuarioResponseDTO buscarPorEmail(String email);

    UsuarioResponseDTO actualizarUltimaConexion(Long id);

    UsuarioResponseDTO procesarSegmentos(Long usuarioId);

    MetricasFinancierasDTO calcularMetricas(Long usuarioId);

    List<UsuarioResponseDTO> listarTodos();

    List<UsuarioResponseDTO> buscarPorQuery(String query);

    UsuarioResponseDTO actualizarUsuario(Long id, UsuarioRequestDTO dto);

    List<HistorialCapitalDTO> historialCapital(Long usuarioId, String period);

    List<ActividadRecienteDTO> actividadesUsuario(Long usuarioId);
}
