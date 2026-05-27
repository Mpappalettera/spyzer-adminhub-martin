package com.spyzer.crm_backend.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.spyzer.crm_backend.dto.KpisDashboardDTO;
import com.spyzer.crm_backend.dto.MetricasFinancierasDTO;
import com.spyzer.crm_backend.dto.ReviewsEstadisticasDTO;
import com.spyzer.crm_backend.exception.ResourceNotFoundException;
import com.spyzer.crm_backend.model.ActividadTrading;
import com.spyzer.crm_backend.model.Usuario;
import com.spyzer.crm_backend.repository.ActividadTradingRepository;
import com.spyzer.crm_backend.repository.UsuarioRepository;
import com.spyzer.crm_backend.service.EstadisticasService;
import com.spyzer.crm_backend.service.PdfGeneratorService;
import com.spyzer.crm_backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PdfGeneratorServiceImpl implements PdfGeneratorService {

    private final UsuarioRepository usuarioRepository;
    private final ActividadTradingRepository actividadTradingRepository;
    private final UsuarioService usuarioService;
    private final EstadisticasService estadisticasService;

    @Override
    @Transactional(readOnly = true)
    public byte[] generarReporteDashboard() {

        // ── Datos del negocio ──────────────────────────────────────────────────────
        KpisDashboardDTO kpis        = estadisticasService.obtenerKpis();
        ReviewsEstadisticasDTO revs  = estadisticasService.obtenerReviewsEstadisticas();

        BigDecimal liquidezTotal = usuarioService.listarTodos().stream()
                .map(u -> u.getLiquidezActual() != null ? u.getLiquidezActual() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        String fechaHora = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

        // ── Paleta corporativa Spyzer ──────────────────────────────────────────────
        Color cPrimario  = new Color(15,  23,  42);   // azul oscuro profundo
        Color cAltRow    = new Color(248, 250, 252);  // gris ultra claro
        Color cBorde     = new Color(226, 232, 240);  // gris suave
        Color cBlancoHdr = Color.WHITE;
        Color cTexto     = new Color(30,  41,  59);   // slate oscuro
        Color cGris      = new Color(100, 116, 139);  // slate medio

        // ── Fuentes ───────────────────────────────────────────────────────────────
        Font fEncabezado  = new Font(Font.HELVETICA, 7,  Font.BOLD,   cGris);
        Font fTitulo      = new Font(Font.HELVETICA, 22, Font.BOLD,   cPrimario);
        Font fFecha       = new Font(Font.HELVETICA, 9,  Font.NORMAL, cGris);
        Font fSeccion     = new Font(Font.HELVETICA, 12, Font.BOLD,   cPrimario);
        Font fTablaHdr    = new Font(Font.HELVETICA, 9,  Font.BOLD,   cBlancoHdr);
        Font fTablaLabel  = new Font(Font.HELVETICA, 9,  Font.BOLD,   cTexto);
        Font fTablaValor  = new Font(Font.HELVETICA, 9,  Font.NORMAL, cTexto);
        Font fNota        = new Font(Font.HELVETICA, 7,  Font.ITALIC, cGris);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 50f, 50f, 60f, 40f);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // ── ENCABEZADO ────────────────────────────────────────────────────────
            Paragraph encabezado = new Paragraph(
                    "SPYZER HUB  —  GLOBAL ANALYTICS EXECUTIVE REPORT", fEncabezado);
            encabezado.setAlignment(Element.ALIGN_CENTER);
            encabezado.setSpacingAfter(10);
            doc.add(encabezado);

            // Línea separadora
            PdfPTable linea = new PdfPTable(1);
            linea.setWidthPercentage(100);
            PdfPCell celdaLinea = new PdfPCell(new Phrase(" "));
            celdaLinea.setBorder(Rectangle.BOTTOM);
            celdaLinea.setBorderColorBottom(cPrimario);
            celdaLinea.setBorderWidthBottom(1.5f);
            celdaLinea.setPaddingBottom(2);
            linea.addCell(celdaLinea);
            doc.add(linea);

            doc.add(Chunk.NEWLINE);

            // ── TÍTULO PRINCIPAL ──────────────────────────────────────────────────
            Paragraph titulo = new Paragraph("INFORME EJECUTIVO ANUAL DE LA PLATAFORMA", fTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(6);
            doc.add(titulo);

            Paragraph pFecha = new Paragraph("Consulta generada: " + fechaHora + "  ·  CRM Spyzer", fFecha);
            pFecha.setAlignment(Element.ALIGN_CENTER);
            pFecha.setSpacingAfter(28);
            doc.add(pFecha);

            // ── BLOQUE 1: KPIs de Crecimiento Financiero ─────────────────────────
            Paragraph sec1 = new Paragraph("BLOQUE 1  —  KPIs de Crecimiento Financiero", fSeccion);
            sec1.setSpacingAfter(8);
            doc.add(sec1);

            PdfPTable tablaKpi = new PdfPTable(new float[]{5f, 4f});
            tablaKpi.setWidthPercentage(80);
            tablaKpi.setHorizontalAlignment(Element.ALIGN_LEFT);

            addDashHdr(tablaKpi, fTablaHdr, cPrimario, cBorde, "Métrica", "Valor Actual");

            Object[][] kpiRows = {
                {"Usuarios Totales Registrados",
                        String.valueOf(kpis.getTotalUsuarios())},
                {"Operaciones de Trading Procesadas",
                        String.valueOf(kpis.getTotalOperaciones())},
                {"Volumen Total de Capital Transaccionado (USD)",
                        "$ " + kpis.getVolumenTotalInvertido().toPlainString()},
                {"Liquidez Total en Custodia (USD)",
                        "$ " + liquidezTotal.toPlainString()}
            };

            for (int i = 0; i < kpiRows.length; i++) {
                Color bg = (i % 2 == 0) ? Color.WHITE : cAltRow;
                addDashRow(tablaKpi, fTablaLabel, fTablaValor, cBorde, bg,
                        (String) kpiRows[i][0], (String) kpiRows[i][1]);
            }
            tablaKpi.setSpacingAfter(24);
            doc.add(tablaKpi);

            // ── BLOQUE 2: Auditoría de Satisfacción e IA ─────────────────────────
            Paragraph sec2 = new Paragraph(
                    "BLOQUE 2  —  Auditoría de Satisfacción e Inteligencia Artificial", fSeccion);
            sec2.setSpacingAfter(8);
            doc.add(sec2);

            PdfPTable tablaRevs = new PdfPTable(new float[]{4f, 3f, 3f});
            tablaRevs.setWidthPercentage(80);
            tablaRevs.setHorizontalAlignment(Element.ALIGN_LEFT);

            addDashHdr(tablaRevs, fTablaHdr, cPrimario, cBorde,
                    "Sentimiento", "Cantidad Absoluta", "Porcentaje del Total");

            String[] sentimientos = {"POSITIVO", "NEUTRO", "NEGATIVO"};
            for (int i = 0; i < sentimientos.length; i++) {
                String s  = sentimientos[i];
                Color bg  = (i % 2 == 0) ? Color.WHITE : cAltRow;
                long cnt  = revs.getDesglosePorSentimiento().getOrDefault(s, 0L);
                double pct = revs.getPorcentajesPorSentimiento().getOrDefault(s, 0.0);
                addDashRow(tablaRevs, fTablaLabel, fTablaValor, cBorde, bg,
                        s,
                        String.valueOf(cnt),
                        String.format("%.2f %%", pct));
            }

            // Fila resumen: nota promedio
            addDashRow(tablaRevs, fTablaLabel, fTablaValor, cBorde, cAltRow,
                    "Nota Promedio General del Sistema",
                    revs.getNotaPromedio().toPlainString() + " / 5.00",
                    "—");

            tablaRevs.setSpacingAfter(10);
            doc.add(tablaRevs);

            Paragraph nota = new Paragraph(
                    "* Las valoraciones son clasificadas dinámicamente mediante modelos de "
                    + "Inteligencia Artificial integrados en el CRM Spyzer.",
                    fNota);
            nota.setSpacingAfter(20);
            doc.add(nota);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando el PDF del dashboard ejecutivo", e);
        }
    }

    private void addDashHdr(PdfPTable tabla, Font fuente, Color bg, Color cBorde, String... cols) {
        for (String col : cols) {
            PdfPCell c = new PdfPCell(new Phrase(col, fuente));
            c.setBackgroundColor(bg);
            c.setPadding(6f);
            c.setBorderColor(cBorde);
            c.setBorderWidth(0.5f);
            tabla.addCell(c);
        }
    }

    private void addDashRow(PdfPTable tabla, Font fLabel, Font fValor, Color cBorde,
                             Color bg, String label, String... valores) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, fLabel));
        cLabel.setBackgroundColor(bg);
        cLabel.setPadding(6f);
        cLabel.setBorderColor(cBorde);
        cLabel.setBorderWidth(0.5f);
        tabla.addCell(cLabel);

        for (String v : valores) {
            PdfPCell cVal = new PdfPCell(new Phrase(v, fValor));
            cVal.setBackgroundColor(bg);
            cVal.setPadding(6f);
            cVal.setBorderColor(cBorde);
            cVal.setBorderWidth(0.5f);
            tabla.addCell(cVal);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarFichaUsuarioPdf(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        long ops = actividadTradingRepository.countByUsuarioIdAndFechaActividadAfter(
                usuarioId, LocalDateTime.now().minusDays(15));
        String estado = ops == 0 ? "INACTIVO" : (ops < 5 ? "ACTIVO" : "VIP");

        List<ActividadTrading> actividades = actividadTradingRepository.findByUsuarioId(usuarioId);
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        // Métricas financieras delegadas al servicio con los precios sincronizados
        MetricasFinancierasDTO metricas   = usuarioService.calcularMetricas(usuarioId);
        BigDecimal invertido              = metricas.getInvertido();
        BigDecimal liquidezActual         = metricas.getLiquidezActual();
        BigDecimal valorActualAcciones    = metricas.getValorActualAcciones();
        BigDecimal gananciaPerdida        = metricas.getGananciaPerdida();
        Map<String, BigDecimal> cartera   = metricas.getCantidadPorInstrumento();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document documento = new Document(PageSize.A4);
            PdfWriter.getInstance(documento, baos);
            documento.open();

            Font fuenteTitulo    = new Font(Font.HELVETICA, 18, Font.BOLD, Color.DARK_GRAY);
            Font fuenteSubtitulo = new Font(Font.HELVETICA, 11, Font.NORMAL, Color.GRAY);
            Font fuenteSeccion   = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(30, 100, 200));
            Font fuenteLabel     = new Font(Font.HELVETICA, 11, Font.BOLD, Color.BLACK);
            Font fuenteValor     = new Font(Font.HELVETICA, 11, Font.NORMAL, Color.BLACK);
            Font fuenteTablaHdr  = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font fuenteTablaCell = new Font(Font.HELVETICA, 9,  Font.NORMAL, Color.BLACK);
            Font fuenteMetrica   = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(30, 100, 200));
            boolean enGanancia   = gananciaPerdida.compareTo(BigDecimal.ZERO) >= 0;
            Font fuenteGP        = new Font(Font.HELVETICA, 11, Font.BOLD,
                    enGanancia ? new Color(0, 140, 0) : new Color(200, 0, 0));
            Color headerColor    = new Color(30, 100, 200);
            Color rowAlt         = new Color(235, 242, 255);

            // ── Cabecera del documento ──────────────────────────────────────────────
            Paragraph tituloPdf = new Paragraph("Ficha de Usuario — Spyzer CRM", fuenteTitulo);
            tituloPdf.setAlignment(Element.ALIGN_CENTER);
            tituloPdf.setSpacingAfter(4);
            documento.add(tituloPdf);

            Paragraph gen = new Paragraph("Generado: " + fecha, fuenteSubtitulo);
            gen.setAlignment(Element.ALIGN_CENTER);
            gen.setSpacingAfter(16);
            documento.add(gen);

            // ── Datos personales ────────────────────────────────────────────────────
            documento.add(new Paragraph("Datos Personales", fuenteSeccion));
            documento.add(Chunk.NEWLINE);
            addField(documento, "Nombre:",    usuario.getNombre() + " " + usuario.getApellido(), fuenteLabel, fuenteValor);
            addField(documento, "Email:",     usuario.getEmail(),          fuenteLabel, fuenteValor);
            addField(documento, "Teléfono:",  nvl(usuario.getTelefono()),  fuenteLabel, fuenteValor);
            addField(documento, "Dirección:", nvl(usuario.getDireccion()), fuenteLabel, fuenteValor);
            addField(documento, "Fecha de registro:",
                    usuario.getFechaRegistro() != null
                            ? usuario.getFechaRegistro().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : "—",
                    fuenteLabel, fuenteValor);
            addField(documento, "Estado:", estado, fuenteLabel, fuenteValor);

            // ── Resumen financiero ──────────────────────────────────────────────────
            documento.add(Chunk.NEWLINE);
            documento.add(new Paragraph("Resumen Financiero", fuenteSeccion));
            documento.add(Chunk.NEWLINE);

            PdfPTable tablaMetricas = new PdfPTable(new float[]{3.5f, 4f});
            tablaMetricas.setWidthPercentage(70);
            tablaMetricas.setHorizontalAlignment(Element.ALIGN_LEFT);
            Color bgMetrica = new Color(235, 242, 255);

            addMetricaRow(tablaMetricas, "Total Invertido (histórico):",
                    "$ " + invertido.toPlainString(), fuenteLabel, fuenteMetrica, bgMetrica);
            addMetricaRow(tablaMetricas, "Liquidez Disponible:",
                    "$ " + liquidezActual.toPlainString(), fuenteLabel, fuenteMetrica, bgMetrica);
            addMetricaRow(tablaMetricas, "Valor Actual Cartera:",
                    "$ " + valorActualAcciones.toPlainString(), fuenteLabel, fuenteMetrica, bgMetrica);
            addMetricaRow(tablaMetricas, "Ganancia / Pérdida flotante:",
                    (enGanancia ? "+ $ " : "- $ ") + gananciaPerdida.abs().toPlainString(),
                    fuenteLabel, fuenteGP, Color.WHITE);
            documento.add(tablaMetricas);

            // ── Resumen de Cartera Actual (posiciones netas abiertas) ───────────────
            if (cartera != null && !cartera.isEmpty()) {
                documento.add(Chunk.NEWLINE);
                Paragraph secCartera = new Paragraph("Resumen de Cartera Actual", fuenteSeccion);
                secCartera.setSpacingAfter(8);
                documento.add(secCartera);

                PdfPTable tablaCartera = new PdfPTable(new float[]{2.5f, 3f, 3.5f, 3.5f});
                tablaCartera.setWidthPercentage(100);
                tablaCartera.setHorizontalAlignment(Element.ALIGN_LEFT);
                for (String col : new String[]{
                        "Instrumento", "Cantidad Poseída",
                        "Precio Actual Mercado (USD)", "Valor de Mercado Actual (USD)"}) {
                    PdfPCell c = new PdfPCell(new Phrase(col, fuenteTablaHdr));
                    c.setBackgroundColor(headerColor);
                    c.setPadding(5);
                    tablaCartera.addCell(c);
                }

                int idx = 0;
                for (Map.Entry<String, BigDecimal> e : cartera.entrySet()) {
                    Color bg        = (idx++ % 2 == 0) ? Color.WHITE : rowAlt;
                    String instr    = e.getKey();
                    BigDecimal cant = e.getValue();
                    BigDecimal precioActual = UsuarioServiceImpl.PRECIOS_ACTUALES
                            .getOrDefault(instr, BigDecimal.ZERO)
                            .setScale(2, RoundingMode.HALF_UP);
                    BigDecimal valorMercado = precioActual.multiply(cant)
                            .setScale(2, RoundingMode.HALF_UP);
                    addTableRow(tablaCartera, fuenteTablaCell, bg,
                            instr,
                            cant.stripTrailingZeros().toPlainString(),
                            precioActual.toPlainString(),
                            valorMercado.toPlainString());
                }
                documento.add(tablaCartera);
            }

            // ── Historial de Operaciones — 6 columnas ──────────────────────────────
            documento.add(Chunk.NEWLINE);
            Paragraph secHistorial = new Paragraph(
                    "Historial de Operaciones (" + actividades.size() + ")", fuenteSeccion);
            secHistorial.setSpacingAfter(8);
            documento.add(secHistorial);

            PdfPTable tabla = new PdfPTable(new float[]{2.5f, 1.2f, 1.5f, 1.3f, 2.5f, 2.5f});
            tabla.setWidthPercentage(100);
            for (String col : new String[]{
                    "Fecha", "Tipo", "Instrumento", "Cantidad",
                    "Precio Unitario (USD)", "Total Operación (USD)"}) {
                PdfPCell cell = new PdfPCell(new Phrase(col, fuenteTablaHdr));
                cell.setBackgroundColor(headerColor);
                cell.setPadding(5);
                tabla.addCell(cell);
            }

            DateTimeFormatter fmtFecha = DateTimeFormatter.ofPattern("dd/MM/yy HH:mm");
            for (int i = 0; i < actividades.size(); i++) {
                ActividadTrading a  = actividades.get(i);
                Color bg            = (i % 2 == 0) ? Color.WHITE : rowAlt;
                String precioUnitario = a.getPrecio() != null
                        ? a.getPrecio().setScale(2, RoundingMode.HALF_UP).toPlainString()
                        : "—";
                String totalOperacion = (a.getCantidad() != null && a.getPrecio() != null)
                        ? a.getCantidad().multiply(a.getPrecio())
                                .setScale(2, RoundingMode.HALF_UP).toPlainString()
                        : "—";
                addTableRow(tabla, fuenteTablaCell, bg,
                        a.getFechaActividad() != null ? a.getFechaActividad().format(fmtFecha) : "—",
                        a.getTipo() != null ? a.getTipo() : "COMPRA",
                        a.getInstrumento(),
                        a.getCantidad() != null ? a.getCantidad().stripTrailingZeros().toPlainString() : "—",
                        precioUnitario,
                        totalOperacion);
            }

            documento.add(tabla);
            documento.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando la ficha PDF del usuario", e);
        }
    }

    private void addField(Document doc, String label, String value, Font fLabel, Font fValue)
            throws DocumentException {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", fLabel));
        p.add(new Chunk(value, fValue));
        p.setSpacingAfter(4);
        doc.add(p);
    }

    private void addMetricaRow(PdfPTable tabla, String label, String valor,
                                Font fLabel, Font fValor, Color bg) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, fLabel));
        cLabel.setBackgroundColor(bg);
        cLabel.setPadding(6);
        tabla.addCell(cLabel);

        PdfPCell cValor = new PdfPCell(new Phrase(valor, fValor));
        cValor.setBackgroundColor(bg);
        cValor.setPadding(6);
        tabla.addCell(cValor);
    }

    private void addTableRow(PdfPTable tabla, Font fuente, Color bg, String... valores) {
        for (String v : valores) {
            PdfPCell cell = new PdfPCell(new Phrase(v, fuente));
            cell.setBackgroundColor(bg);
            cell.setPadding(4);
            tabla.addCell(cell);
        }
    }

    private String nvl(String s) {
        return s != null ? s : "—";
    }
}
