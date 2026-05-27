import os
import re
import markdown
from xhtml2pdf import pisa

def convert_md_to_pdf(md_path, pdf_path):
    current_dir = os.path.dirname(os.path.abspath(md_path))
    print(f"Leyendo archivo Markdown: {md_path}")
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Omitir la primera cabecera y metadatos para la portada personalizada
    # Buscamos el final del bloque inicial de metadatos (línea con ---)
    parts = md_content.split('---', 1)
    if len(parts) > 1:
        body_md = parts[1].strip()
    else:
        body_md = md_content

    # Convertir Markdown a HTML
    print("Convirtiendo Markdown a HTML con extensiones de tablas...")
    body_html = markdown.markdown(body_md, extensions=['tables', 'fenced_code'])

    # 1. HTML para el Diagrama de Ecosistema
    ecosystem_html = """
    <table style="width: 100%; border: none; font-size: 9.5pt; margin: 12pt 0; background-color: #f8fafc; text-align: center;">
      <tr style="background-color: #0b2240; color: white; font-weight: bold;">
        <td style="border: 1px solid #0b2240; padding: 8pt 4pt; width: 33%;">1. Analizador de Opiniones</td>
        <td style="border: 1px solid #0b2240; padding: 8pt 4pt; width: 33%;">2. Simulador de Trading</td>
        <td style="border: 1px solid #0b2240; padding: 8pt 4pt; width: 34%;">3. CRM Financiero</td>
      </tr>
      <tr>
        <td style="border: 1px solid #e2e8f0; padding: 10pt 8pt; vertical-align: top; background-color: #ffffff;">
          <span style="font-size: 8pt; color: #475569; line-height: 1.35;">
            Escucha y procesa streams de texto mediante NLP para obtener el <strong>Índice de Sentimiento</strong>.
          </span>
          <div style="font-size: 14pt; color: #0b2240; font-weight: bold; margin-top: 6pt;">&rarr;</div>
        </td>
        <td style="border: 1px solid #e2e8f0; padding: 10pt 8pt; vertical-align: top; background-color: #ffffff;">
          <span style="font-size: 8pt; color: #475569; line-height: 1.35;">
            Simula operaciones de compra/venta a precio real basándose en cotizaciones dinámicas y alertas.
          </span>
          <div style="font-size: 14pt; color: #0b2240; font-weight: bold; margin-top: 6pt;">&rarr;</div>
        </td>
        <td style="border: 1px solid #e2e8f0; padding: 10pt 8pt; vertical-align: top; background-color: #ffffff;">
          <span style="font-size: 8pt; color: #475569; line-height: 1.35;">
            Centraliza perfiles de inversión y carteras para coordinar el asesoramiento financiero directo.
          </span>
          <div style="font-size: 14pt; color: #0b2240; font-weight: bold; margin-top: 6pt;">&larr;</div>
        </td>
      </tr>
      <tr>
        <td colspan="3" style="border: 1px solid #cbd5e1; padding: 8pt; text-align: center; background-color: #f1f5f9; font-size: 8.5pt; color: #475569; line-height: 1.4;">
          <strong>Flujo del Ecosistema:</strong> Las métricas de sentimiento informan las decisiones de trading del cliente y guían las recomendaciones del asesor del CRM. El historial transaccional del simulador nutre el CRM para auditoría.
        </td>
      </tr>
    </table>
    """

    # 2. HTML para el Diagrama de Arquitectura
    architecture_html = """
    <table style="width: 100%; border: none; font-size: 9.5pt; margin: 12pt 0; background-color: #f8fafc; text-align: center;">
      <tr>
        <td style="width: 30%; border: 1px solid #cbd5e1; background-color: #0b2240; color: white; text-align: center; padding: 12pt 8pt; font-weight: bold; border-radius: 4px;">
          CLIENTE WEB<br/><span style="font-size: 8pt; font-weight: normal; color: #93c5fd;">React 19 responsivo</span>
        </td>
        <td style="width: 10%; border: none; text-align: center; font-size: 16pt; color: #0b2240; font-weight: bold; vertical-align: middle;">
          &rarr;<br/><span style="font-size: 7pt; font-weight: normal; color: #64748b;">HTTP REST + JWT</span>
        </td>
        <td style="width: 30%; border: 1px solid #cbd5e1; background-color: #f1f5f9; text-align: center; padding: 12pt 8pt; font-weight: bold; border-radius: 4px; color: #0b2240;">
          BACKEND SPRING BOOT 3.5<br/>
          <span style="font-size: 8pt; font-weight: normal; color: #475569; line-height: 1.3;">
            &bull; Controladores REST<br/>
            &bull; Servicios de Negocio<br/>
            &bull; Caché de Redis<br/>
            &bull; Spring Security &amp; OAuth2
          </span>
        </td>
        <td style="width: 10%; border: none; text-align: center; font-size: 16pt; color: #0b2240; font-weight: bold; vertical-align: middle;">
          &rarr;
        </td>
        <td style="width: 20%; border: 1px solid #cbd5e1; background-color: #e2e8f0; text-align: center; padding: 12pt 8pt; font-weight: bold; border-radius: 4px; color: #0b2240;">
          PERSISTENCIA<br/>
          <span style="font-size: 8pt; font-weight: normal; color: #475569; line-height: 1.3;">
            &bull; MySQL (Transaccional)<br/>
            &bull; Redis (Caché en memoria)
          </span>
        </td>
      </tr>
    </table>
    """

    # 3. HTML para el Diagrama de Ciclo de Vida
    lifecycle_html = """
    <table style="width: 100%; border: none; font-size: 9pt; margin: 12pt 0; background-color: #f8fafc; text-align: center;">
      <tr style="background-color: #0b2240; color: white; font-weight: bold;">
        <td style="border: 1px solid #0b2240; padding: 8pt 4pt; width: 16%; border-radius: 2px;">1. Investigación</td>
        <td style="border: 1px solid #0b2240; padding: 8pt 4pt; width: 16%; border-radius: 2px;">2. Planificación</td>
        <td style="border: 1px solid #0b2240; padding: 8pt 4pt; width: 16%; border-radius: 2px;">3. Diseño</td>
        <td style="border: 1px solid #0b2240; padding: 8pt 4pt; width: 16%; border-radius: 2px;">4. Desarrollo</td>
        <td style="border: 1px solid #0b2240; padding: 8pt 4pt; width: 16%; border-radius: 2px;">5. Pruebas</td>
        <td style="border: 1px solid #0b2240; padding: 6pt 4pt; width: 16%; border-radius: 2px;">6. Evaluación</td>
      </tr>
      <tr>
        <td colspan="6" style="border: 1px solid #cbd5e1; padding: 10pt; text-align: center; background-color: #f1f5f9; font-size: 8.5pt; color: #475569; line-height: 1.4;">
          <strong>Flujo de Desarrollo en Espiral:</strong> El proyecto Spyzer progresa de manera iterativa por ciclos de fases, lo que permite refinar y adaptar la suite continuamente basándose en pruebas reales y en el análisis del sentimiento del mercado.
        </td>
      </tr>
    </table>
    """

    def mermaid_replacer(match):
        code = match.group(1)
        if "Cliente React 19 Web" in code:
            return architecture_html
        elif "Investigación" in code:
            return lifecycle_html
        elif "Analizador de Opiniones" in code:
            return ecosystem_html
        return match.group(0)

    # Reemplazar TODOS los bloques de Mermaid de forma ultra flexible
    body_html = re.sub(
        r'<pre><code[^>]*class="[^"]*mermaid[^"]*"[^>]*>([\s\S]*?)</code></pre>',
        mermaid_replacer,
        body_html
    )

    # Detección e integración de logotipos
    logo_centro_path = os.path.join(current_dir, "logo_centro.png")
    logo_spyzer_path = os.path.join(current_dir, "logo_spyzer.png")
    
    # 1. Configuración de Logotipos para la Portada
    logo_centro_cover_html = ""
    if os.path.exists(logo_centro_path):
        print(f"Logotipo del centro detectado en: {logo_centro_path}")
        logo_centro_cover_html = f'<div style="text-align: center; margin-top: 1cm; margin-bottom: 2cm;"><img src="{logo_centro_path}" style="height: 3.8cm; width: auto;" /></div>'
    else:
        logo_centro_cover_html = """
        <div style="text-align: center; margin-top: 1cm; margin-bottom: 2cm;">
            <div style="border: 1.5px dashed #0b2240; padding: 15pt 10pt; width: 6.5cm; margin: 0 auto; border-radius: 8px; background-color: #f8fafc; color: #0b2240; font-size: 9.5pt;">
                <strong>[ LOGO DEL CENTRO ]</strong>
            </div>
        </div>
        """

    logo_spyzer_cover_html = ""
    if os.path.exists(logo_spyzer_path):
        print(f"Logotipo de Spyzer detectado en: {logo_spyzer_path}")
        logo_spyzer_cover_html = f'<div style="text-align: center; margin-top: 0.8cm; margin-bottom: 2cm;"><img src="{logo_spyzer_path}" style="height: 2.8cm; width: auto;" /></div>'
    else:
        logo_spyzer_cover_html = """
        <div style="text-align: center; margin-top: 0.8cm; margin-bottom: 2cm;">
            <div style="border: 1.5px dashed #0b2240; padding: 15pt 10pt; width: 6.5cm; margin: 0 auto; border-radius: 8px; background-color: #f8fafc; color: #0b2240; font-size: 9.5pt;">
                <strong>[ LOGO DE SPYZER ]</strong>
            </div>
        </div>
        """

    # 2. Configuración de Logotipo para el Encabezado Dinámico de Páginas de Contenido (Aumentado a 1.0cm)
    logo_header_html = ""
    if os.path.exists(logo_centro_path):
        logo_header_html = f'<img src="{logo_centro_path}" style="height: 1.0cm; width: auto; display: block;" />'

    html_template = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    /* Cover page template (default for the first page) */
    @page {{
        size: a4;
        @frame content_frame {{
            left: 2.2cm;
            top: 2cm;
            width: 16.6cm;
            height: 25.7cm;
        }}
    }}
    
    /* Standard template for subsequent pages */
    @page standard_page {{
        size: a4;
        @frame header_frame {{
            -pdf-frame-content: header_content;
            left: 2.2cm;
            top: 1.2cm;
            width: 16.6cm;
            height: 1.2cm;
        }}
        @frame content_frame {{
            left: 2.2cm;
            top: 2.8cm;
            width: 16.6cm;
            height: 24.4cm;
        }}
        @frame footer_frame {{
            -pdf-frame-content: footer_content;
            left: 2.2cm;
            top: 27.2cm;
            width: 16.6cm;
            height: 1.0cm;
        }}
    }}
    
    body {{
        font-family: Helvetica, Arial, sans-serif;
        color: #1e293b;
        line-height: 1.45;
        font-size: 9.5pt;
    }}
    
    h1, h2, h3, h4 {{
        color: #0f172a;
        font-weight: bold;
        margin-top: 16pt;
        margin-bottom: 8pt;
    }}
    
    h1 {{
        font-size: 16pt;
        border-bottom: 1.5px solid #0b2240;
        padding-bottom: 4pt;
        margin-top: 24pt;
    }}
    
    h2 {{
        font-size: 12.5pt;
        border-bottom: 0.5px solid #cbd5e1;
        padding-bottom: 2pt;
        color: #0b2240;
        margin-top: 20pt;
    }}
    
    h3 {{
        font-size: 10.5pt;
        color: #334155;
        margin-top: 12pt;
    }}
    
    blockquote {{
        margin: 12pt 0;
        padding: 10pt 12pt;
        border-left: 3px solid #0b2240;
        background-color: #f8fafc;
        font-size: 9pt;
        color: #334155;
    }}
    
    blockquote strong {{
        color: #0b2240;
    }}

    p {{
        margin-bottom: 8pt;
    }}

    ul, ol {{
        margin-bottom: 8pt;
        padding-left: 18pt;
    }}
    
    li {{
        margin-bottom: 3.5pt;
    }}
    
    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 12pt 0;
        font-size: 8.5pt;
    }}
    
    th {{
        background-color: #0b2240;
        color: #ffffff;
        font-weight: bold;
        text-align: left;
        padding: 5pt 7pt;
        border: 1px solid #0b2240;
    }}
    
    td {{
        padding: 5pt 7pt;
        border: 1px solid #e2e8f0;
    }}
    
    tr:nth-child(even) {{
        background-color: #f8fafc;
    }}
    
    pre, code {{
        font-family: Courier, monospace;
        font-size: 8pt;
        background-color: #f1f5f9;
    }}
    
    pre {{
        padding: 8pt;
        margin: 8pt 0;
        border: 0.5px solid #cbd5e1;
    }}
    
    .cover {{
        text-align: center;
        margin-top: 0.5cm;
    }}
    
    .cover-title {{
        font-size: 20pt;
        font-weight: bold;
        color: #0b2240;
        margin-bottom: 0.8cm;
        line-height: 1.35;
    }}
    
    .cover-subtitle {{
        font-size: 12pt;
        color: #475569;
        margin-bottom: 1.2cm;
        font-weight: normal;
        font-style: italic;
    }}
    
    .cover-details {{
        font-size: 10pt;
        line-height: 1.8;
        color: #334155;
        border-top: 1px solid #e2e8f0;
        padding-top: 1.2cm;
        width: 12cm;
        margin: 0 auto;
    }}
    
    #footer_content {{
        text-align: center;
        font-size: 8pt;
        color: #64748b;
        border-top: 0.5px solid #e2e8f0;
        padding-top: 3pt;
    }}
    
    #header_content {{
        vertical-align: middle;
    }}
</style>
</head>
<body>

<!-- Elementos de cabecera y pie de página (fuera del flujo, definidos al principio) -->
<div id="header_content">
    <table style="width: 100%; border: none; margin: 0; padding: 0; background-color: transparent;">
        <tr>
            <td style="width: 35%; border: none; text-align: left; vertical-align: middle; padding: 0;">
                {logo_header_html}
            </td>
            <td style="width: 65%; border: none; text-align: right; vertical-align: middle; padding: 0; font-size: 8pt; color: #64748b; font-style: italic;">
                Documentación Técnica del Ecosistema Spyzer
            </td>
        </tr>
    </table>
</div>

<div id="footer_content">
    Página <pdf:pagenumber> de <pdf:pagecount> - Miguel Melgarejo, Martín Pappaletera, Alex Boca, Carlos
</div>

<!-- Portada (Página 1: utiliza la plantilla por defecto sin cabecera ni pie) -->
<div class="cover">
    {logo_centro_cover_html}
    <div class="cover-title">DESARROLLO DE PLATAFORMA DE SIMULACIÓN FINANCIERA Y SUITE INTEGRADORA: SPYZER</div>
    {logo_spyzer_cover_html}
    <div class="cover-subtitle">Documentación Técnica y Comercial de la Suite Financiera</div>
    <div class="cover-details">
        <strong>Autores:</strong> Miguel Melgarejo, Martín Pappaletera, Alex Boca y Carlos<br/>
        <strong>Fecha de Entrega:</strong> Mayo 2026
    </div>
    <pdf:nexttemplate name="standard_page" />
    <pdf:nextpage />
</div>

<!-- El contenido del documento fluye a continuación en la plantilla standard_page -->
{body_html}

</body>
</html>
"""

    html_debug_path = pdf_path.replace(".pdf", ".html")
    print(f"Guardando HTML de depuración en: {html_debug_path}")
    with open(html_debug_path, "w", encoding="utf-8") as html_debug_file:
        html_debug_file.write(html_template)

    print("Generando archivo PDF con xhtml2pdf...")
    with open(pdf_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(html_template, dest=pdf_file)
        
    if not pisa_status.err:
        print(f"¡Éxito! PDF generado en: {pdf_path}")
        return True
    else:
        print("Error durante la generación del PDF")
        return False

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    md_file = os.path.join(current_dir, "Documentacion_Spyzer.md")
    pdf_file = os.path.join(current_dir, "Documentacion_Spyzer.pdf")
    convert_md_to_pdf(md_file, pdf_file)
