package com.spyzer.crm_backend.service.impl;

import com.spyzer.crm_backend.dto.ActividadRecienteDTO;
import com.spyzer.crm_backend.dto.HistorialCapitalDTO;
import com.spyzer.crm_backend.dto.MetricasFinancierasDTO;
import com.spyzer.crm_backend.dto.UsuarioRequestDTO;
import com.spyzer.crm_backend.dto.UsuarioResponseDTO;
import com.spyzer.crm_backend.exception.EmailDuplicadoException;
import com.spyzer.crm_backend.exception.ResourceNotFoundException;
import com.spyzer.crm_backend.model.ActividadTrading;
import com.spyzer.crm_backend.model.CampanaEmail;
import com.spyzer.crm_backend.model.EstadoUsuario;
import com.spyzer.crm_backend.model.Usuario;
import com.spyzer.crm_backend.repository.ActividadTradingRepository;
import com.spyzer.crm_backend.repository.CampanaEmailRepository;
import com.spyzer.crm_backend.repository.UsuarioRepository;
import com.spyzer.crm_backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ActividadTradingRepository actividadTradingRepository;
    private final CampanaEmailRepository campanaEmailRepository;

    public static final Map<String, BigDecimal> PRECIOS_ACTUALES = Map.ofEntries(
            Map.entry("SPY",   BigDecimal.valueOf(745.13)),
            Map.entry("QQQ",   BigDecimal.valueOf(717.10)),
            Map.entry("SOXX",  BigDecimal.valueOf(538.18)),
            Map.entry("TSM",   BigDecimal.valueOf(404.33)),
            Map.entry("AMD",   BigDecimal.valueOf(467.36)),
            Map.entry("NVDA",  BigDecimal.valueOf(215.26)),
            Map.entry("GOOGL", BigDecimal.valueOf(382.88)),
            Map.entry("AMZN",  BigDecimal.valueOf(266.95)),
            Map.entry("JPM",   BigDecimal.valueOf(306.34)),
            Map.entry("V",     BigDecimal.valueOf(328.89)),
            Map.entry("JNJ",   BigDecimal.valueOf(234.62)),
            Map.entry("BABA",  BigDecimal.valueOf(130.01)),
            Map.entry("SPOT",  BigDecimal.valueOf(519.74)),
            Map.entry("DIS",   BigDecimal.valueOf(103.42)),
            Map.entry("NFLX",  BigDecimal.valueOf(88.60)),
            Map.entry("XLE",   BigDecimal.valueOf(59.49)),
            Map.entry("ARKK",  BigDecimal.valueOf(76.45)),
            Map.entry("FXI",   BigDecimal.valueOf(35.50)),
            Map.entry("DAX",   BigDecimal.valueOf(45.48)),
            Map.entry("PFE",   BigDecimal.valueOf(25.99)),
            Map.entry("NVO",   BigDecimal.valueOf(44.84)),
            Map.entry("CMCSA", BigDecimal.valueOf(25.12)),
            Map.entry("UBER",  BigDecimal.valueOf(71.97)),
            Map.entry("AAPL",  BigDecimal.valueOf(180.50)),
            Map.entry("TSLA",  BigDecimal.valueOf(175.20)),
            Map.entry("MSFT",  BigDecimal.valueOf(420.15)),
            Map.entry("BTC",   BigDecimal.valueOf(63000.00)),
            Map.entry("ETH",   BigDecimal.valueOf(3100.00)),
            Map.entry("SOL",   BigDecimal.valueOf(145.00))
    );

    private static final BigDecimal SALDO_INICIAL = BigDecimal.valueOf(50000.00);

    @Override
    @Transactional
    public UsuarioResponseDTO guardarUsuario(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new EmailDuplicadoException(dto.getEmail());
        }

        Usuario usuario = Usuario.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .email(dto.getEmail())
                .telefono(dto.getTelefono())
                .direccion(dto.getDireccion())
                .fechaRegistro(LocalDateTime.now())
                .build();

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
        return toResponseDTO(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));
        return toResponseDTO(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO actualizarUltimaConexion(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));

        usuario.setUltimaConexion(LocalDateTime.now());
        return toResponseDTO(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO procesarSegmentos(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));
        return toResponseDTO(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public MetricasFinancierasDTO calcularMetricas(Long usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuario", "id", usuarioId);
        }

        List<ActividadTrading> actividades = actividadTradingRepository.findByUsuarioId(usuarioId);

        BigDecimal costoTotalCompras = BigDecimal.ZERO;
        BigDecimal ingresoTotalVentas = BigDecimal.ZERO;
        for (ActividadTrading a : actividades) {
            String tipo = a.getTipo() != null ? a.getTipo().toUpperCase() : "COMPRA";
            BigDecimal valor = a.getPrecio().multiply(a.getCantidad());
            if ("COMPRA".equals(tipo)) {
                costoTotalCompras = costoTotalCompras.add(valor);
            } else {
                ingresoTotalVentas = ingresoTotalVentas.add(valor);
            }
        }
        BigDecimal liquidezActual = SALDO_INICIAL
                .subtract(costoTotalCompras)
                .add(ingresoTotalVentas)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal invertido = costoTotalCompras.setScale(2, RoundingMode.HALF_UP);

        Map<String, List<ActividadTrading>> porInstrumento = actividades.stream()
                .collect(Collectors.groupingBy(a -> a.getInstrumento().toUpperCase()));

        BigDecimal totalValorActual = BigDecimal.ZERO;
        BigDecimal totalGananciaFlotante = BigDecimal.ZERO;
        Map<String, BigDecimal> valorMercadoPorInstrumento = new HashMap<>();
        Map<String, BigDecimal> cantidadNetaPorInstrumento = new HashMap<>();

        for (Map.Entry<String, List<ActividadTrading>> entry : porInstrumento.entrySet()) {
            String instr = entry.getKey();
            BigDecimal cantCompras = BigDecimal.ZERO;
            BigDecimal costoCompras = BigDecimal.ZERO;
            BigDecimal cantVentas = BigDecimal.ZERO;

            for (ActividadTrading op : entry.getValue()) {
                String tipo = op.getTipo() != null ? op.getTipo().toUpperCase() : "COMPRA";
                if ("COMPRA".equals(tipo)) {
                    cantCompras = cantCompras.add(op.getCantidad());
                    costoCompras = costoCompras.add(op.getPrecio().multiply(op.getCantidad()));
                } else {
                    cantVentas = cantVentas.add(op.getCantidad());
                }
            }

            BigDecimal cantidadNeta = cantCompras.subtract(cantVentas);
            if (cantidadNeta.compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal precioMedio = cantCompras.compareTo(BigDecimal.ZERO) > 0
                    ? costoCompras.divide(cantCompras, 8, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal precioActual = PRECIOS_ACTUALES.getOrDefault(instr, BigDecimal.ZERO);
            BigDecimal valorMercado = precioActual.multiply(cantidadNeta).setScale(2, RoundingMode.HALF_UP);
            BigDecimal gananciaFlotante = valorMercado
                    .subtract(precioMedio.multiply(cantidadNeta).setScale(2, RoundingMode.HALF_UP))
                    .setScale(2, RoundingMode.HALF_UP);

            valorMercadoPorInstrumento.put(instr, valorMercado);
            cantidadNetaPorInstrumento.put(instr, cantidadNeta.setScale(8, RoundingMode.HALF_UP));
            totalValorActual = totalValorActual.add(valorMercado);
            totalGananciaFlotante = totalGananciaFlotante.add(gananciaFlotante);
        }

        BigDecimal valorActualAcciones = totalValorActual.setScale(2, RoundingMode.HALF_UP);
        BigDecimal gananciaPerdida = totalGananciaFlotante.setScale(2, RoundingMode.HALF_UP);

        Map<String, Double> distribucionCarteraPorcentaje = new HashMap<>();
        if (valorActualAcciones.compareTo(BigDecimal.ZERO) > 0) {
            valorMercadoPorInstrumento.forEach((instr, vm) ->
                    distribucionCarteraPorcentaje.put(instr,
                            vm.multiply(BigDecimal.valueOf(100))
                                    .divide(valorActualAcciones, 2, RoundingMode.HALF_UP)
                                    .doubleValue()));
        }

        List<BigDecimal> historial = new ArrayList<>();
        for (BigDecimal factor : List.of(
                BigDecimal.valueOf(0.25), BigDecimal.valueOf(0.40),
                BigDecimal.valueOf(0.55), BigDecimal.valueOf(0.70),
                BigDecimal.valueOf(0.85), BigDecimal.ONE)) {
            historial.add(gananciaPerdida.multiply(factor).setScale(2, RoundingMode.HALF_UP));
        }

        return MetricasFinancierasDTO.builder()
                .invertido(invertido)
                .liquidezActual(liquidezActual)
                .valorActualAcciones(valorActualAcciones)
                .gananciaPerdida(gananciaPerdida)
                .distribucionCarteraPorcentaje(distribucionCarteraPorcentaje)
                .historialGananciasMensuales(historial)
                .cantidadPorInstrumento(cantidadNetaPorInstrumento)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        LocalDateTime hace15Dias = LocalDateTime.now().minusDays(15);

        // Carga todas las actividades en una sola query para evitar N+1
        Map<Long, List<ActividadTrading>> actividadesPorUsuario = actividadTradingRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(a -> a.getUsuario().getId()));

        return usuarios.stream()
                .map(u -> buildDtoEnriquecido(u, actividadesPorUsuario.getOrDefault(u.getId(), List.of()), hace15Dias))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistorialCapitalDTO> historialCapital(Long usuarioId, String period) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuario", "id", usuarioId);
        }
        MetricasFinancierasDTO metricas = calcularMetricas(usuarioId);
        BigDecimal capitalActual = metricas.getLiquidezActual().add(metricas.getValorActualAcciones());

        int meses = switch (period.toUpperCase()) {
            case "1M" -> 1;
            case "3M" -> 3;
            case "1Y" -> 12;
            default -> 6;
        };

        LocalDate hoy = LocalDate.now();
        List<HistorialCapitalDTO> puntos = new ArrayList<>();

        for (int i = meses; i >= 0; i--) {
            LocalDate fecha = hoy.minusMonths(i);
            double factor = meses == 0 ? 1.0 : (double) (meses - i) / meses;
            BigDecimal valor = SALDO_INICIAL
                    .add(capitalActual.subtract(SALDO_INICIAL).multiply(BigDecimal.valueOf(factor)))
                    .setScale(2, RoundingMode.HALF_UP);
            puntos.add(HistorialCapitalDTO.builder()
                    .fecha(fecha.toString())
                    .valor(valor)
                    .build());
        }

        return puntos;
    }

    private UsuarioResponseDTO buildDtoEnriquecido(Usuario u, List<ActividadTrading> acts, LocalDateTime hace15Dias) {
        // Estado en memoria (evita N+1)
        long ops = acts.stream()
                .filter(a -> a.getFechaActividad() != null && a.getFechaActividad().isAfter(hace15Dias))
                .count();
        EstadoUsuario estado = ops == 0 ? EstadoUsuario.INACTIVO : (ops < 5 ? EstadoUsuario.ACTIVO : EstadoUsuario.VIP);

        // Flujos de caja
        BigDecimal costoCompras = BigDecimal.ZERO;
        BigDecimal ingresoVentas = BigDecimal.ZERO;
        for (ActividadTrading a : acts) {
            String tipo = a.getTipo() != null ? a.getTipo().toUpperCase() : "COMPRA";
            BigDecimal valor = a.getPrecio().multiply(a.getCantidad());
            if ("COMPRA".equals(tipo)) costoCompras = costoCompras.add(valor);
            else ingresoVentas = ingresoVentas.add(valor);
        }
        BigDecimal liquidez = SALDO_INICIAL.subtract(costoCompras).add(ingresoVentas)
                .setScale(2, RoundingMode.HALF_UP);

        // Posiciones netas → valorActualAcciones + gananciaPerdida
        Map<String, BigDecimal[]> netPos = new HashMap<>();
        for (ActividadTrading a : acts) {
            String instr = a.getInstrumento().toUpperCase();
            BigDecimal[] pos = netPos.computeIfAbsent(instr, k -> new BigDecimal[]{
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO}); // [cantCompras, costoCompras, cantVentas]
            String tipo = a.getTipo() != null ? a.getTipo().toUpperCase() : "COMPRA";
            if ("COMPRA".equals(tipo)) {
                pos[0] = pos[0].add(a.getCantidad());
                pos[1] = pos[1].add(a.getPrecio().multiply(a.getCantidad()));
            } else {
                pos[2] = pos[2].add(a.getCantidad());
            }
        }

        BigDecimal valorAcciones = BigDecimal.ZERO;
        BigDecimal ganancia = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal[]> e : netPos.entrySet()) {
            BigDecimal[] pos = e.getValue();
            BigDecimal cantNeta = pos[0].subtract(pos[2]);
            if (cantNeta.compareTo(BigDecimal.ZERO) <= 0) continue;
            BigDecimal precioActual = PRECIOS_ACTUALES.getOrDefault(e.getKey(), BigDecimal.ZERO);
            BigDecimal vm = precioActual.multiply(cantNeta).setScale(2, RoundingMode.HALF_UP);
            BigDecimal precioMedio = pos[0].compareTo(BigDecimal.ZERO) > 0
                    ? pos[1].divide(pos[0], 8, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            BigDecimal gf = vm.subtract(precioMedio.multiply(cantNeta).setScale(2, RoundingMode.HALF_UP))
                    .setScale(2, RoundingMode.HALF_UP);
            valorAcciones = valorAcciones.add(vm);
            ganancia = ganancia.add(gf);
        }

        BigDecimal capitalTotal = liquidez.add(valorAcciones).setScale(2, RoundingMode.HALF_UP);
        BigDecimal beneficioTotal = ganancia.setScale(2, RoundingMode.HALF_UP);

        return UsuarioResponseDTO.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .email(u.getEmail())
                .telefono(u.getTelefono())
                .direccion(u.getDireccion())
                .fechaRegistro(u.getFechaRegistro())
                .ultimaConexion(u.getUltimaConexion())
                .estadoUsuario(estado)
                .capitalTotal(capitalTotal)
                .beneficioTotal(beneficioTotal)
                .liquidezActual(liquidez)
                .totalInvertido(costoCompras.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActividadRecienteDTO> actividadesUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        List<ActividadRecienteDTO> eventos = new ArrayList<>();

        actividadTradingRepository.findByUsuarioId(usuarioId).forEach(a -> {
            String tipo = a.getTipo() != null ? a.getTipo().toUpperCase() : "COMPRA";
            eventos.add(ActividadRecienteDTO.builder()
                    .tipoEvento("TRADING")
                    .descripcion(tipo + " de " + a.getInstrumento() + " × " + a.getCantidad().toPlainString()
                            + " a " + a.getPrecio().toPlainString() + " USD")
                    .fecha(a.getFechaActividad())
                    .build());
        });

        String email = usuario.getEmail();
        campanaEmailRepository.findByDestinatariosContaining(email).forEach(c ->
                eventos.add(ActividadRecienteDTO.builder()
                        .tipoEvento("EMAIL")
                        .descripcion("Campaña recibida: " + c.getAsunto())
                        .fecha(c.getFechaEnvio())
                        .build())
        );

        return eventos.stream()
                .sorted(Comparator.comparing(ActividadRecienteDTO::getFecha,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private EstadoUsuario calcularEstado(Long usuarioId) {
        LocalDateTime hace15Dias = LocalDateTime.now().minusDays(15);
        long ops = actividadTradingRepository.countByUsuarioIdAndFechaActividadAfter(usuarioId, hace15Dias);
        if (ops == 0) return EstadoUsuario.INACTIVO;
        if (ops < 5)  return EstadoUsuario.ACTIVO;
        return EstadoUsuario.VIP;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> buscarPorQuery(String query) {
        return usuarioRepository
                .findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(query, query)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UsuarioResponseDTO actualizarUsuario(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));

        if (!usuario.getEmail().equalsIgnoreCase(dto.getEmail())
                && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new EmailDuplicadoException(dto.getEmail());
        }

        usuario.setNombre(dto.getNombre());
        usuario.setApellido(dto.getApellido());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefono(dto.getTelefono());
        usuario.setDireccion(dto.getDireccion());

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        MetricasFinancierasDTO metricas = calcularMetricas(usuario.getId());
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .telefono(usuario.getTelefono())
                .direccion(usuario.getDireccion())
                .fechaRegistro(usuario.getFechaRegistro())
                .ultimaConexion(usuario.getUltimaConexion())
                .estadoUsuario(calcularEstado(usuario.getId()))
                .capitalTotal(metricas.getLiquidezActual().add(metricas.getValorActualAcciones()))
                .beneficioTotal(metricas.getGananciaPerdida())
                .liquidezActual(metricas.getLiquidezActual())
                .totalInvertido(metricas.getInvertido())
                .build();
    }
}
