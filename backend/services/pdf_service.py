import io
import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib import colors
from reportlab.lib.units import inch

class PDFService:
    @staticmethod
    def generar_paci_pdf(paci_data: dict, estudiante_data: dict, ajustes_data: dict = None) -> bytes:
        if ajustes_data is None:
            ajustes_data = {}
            
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        
        styles = getSampleStyleSheet()
        
        # Estilos de texto
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=14,
            textColor=colors.black,
            alignment=TA_CENTER,
            spaceAfter=20,
            fontName='Helvetica-Bold'
        )
        
        section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Heading2'],
            fontSize=11,
            textColor=colors.black,
            alignment=TA_LEFT,
            spaceBefore=15,
            spaceAfter=5,
            fontName='Helvetica-Bold'
        )
        
        normal_style = ParagraphStyle(
            'NormalStyle',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
            leading=12,
            fontName='Helvetica'
        )

        bold_style = ParagraphStyle(
            'BoldStyle',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        )

        elements = []
        
        # --- 1. CABECERA (Logo y Título) ---
        # Forzar el uso del escudo de la escuela subido por el usuario
        logo_path = "/Users/juancarvajalfernandez/Desktop/2026/PROYECTO_PACI_V2/escudo_escuela.png"
            
        logo_img = None
        if os.path.exists(logo_path):
            try:
                # Ajustamos un poco el tamaño para que el escudo luzca bien
                logo_img = Image(logo_path, width=1.2*inch, height=1.2*inch)
            except:
                logo_img = Paragraph("LOGO", normal_style)
        else:
            logo_img = Paragraph("", normal_style)

        title_para = Paragraph("<b>PLAN DE ADECUACIÓN CURRICULAR INDIVIDUAL<br/>P.A.C.I.</b>", title_style)
        
        header_table = Table([[logo_img, title_para]], colWidths=[2*inch, 4.5*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (0,0), 'LEFT'),
            ('ALIGN', (1,0), (1,0), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 20))

        # --- 2. IDENTIFICACIÓN DEL ESTABLECIMIENTO ---
        elements.append(Paragraph("1. IDENTIFICACIÓN DEL ESTABLECIMIENTO", section_style))
        
        est_data = [
            [Paragraph("<b>Establecimiento:</b>", normal_style), Paragraph(ajustes_data.get('nombre_colegio', ''), normal_style)],
            [Paragraph("<b>RBD:</b>", normal_style), Paragraph(ajustes_data.get('rbd', ''), normal_style)],
            [Paragraph("<b>Director(a):</b>", normal_style), Paragraph(ajustes_data.get('director', ''), normal_style)]
        ]
        
        est_table = Table(est_data, colWidths=[1.5*inch, 5*inch])
        est_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('BACKGROUND', (0,0), (0,-1), colors.lightgrey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        elements.append(est_table)
        
        # --- 3. IDENTIFICACIÓN DEL ESTUDIANTE ---
        elements.append(Paragraph("2. IDENTIFICACIÓN DEL ESTUDIANTE", section_style))
        
        alu_data = [
            [Paragraph("<b>Nombre Completo:</b>", normal_style), Paragraph(estudiante_data.get('nombre_completo', ''), normal_style)],
            [Paragraph("<b>RUT:</b>", normal_style), Paragraph(estudiante_data.get('rut', ''), normal_style)],
            [Paragraph("<b>Fecha de Nacimiento:</b>", normal_style), Paragraph(estudiante_data.get('fecha_nacimiento', ''), normal_style)],
            [Paragraph("<b>Diagnóstico:</b>", normal_style), Paragraph(estudiante_data.get('diagnostico_pie', ''), normal_style)],
            [Paragraph("<b>Curso:</b>", normal_style), Paragraph("6° Básico (Ejemplo)", normal_style)] # Placeholder estático
        ]
        
        alu_table = Table(alu_data, colWidths=[2*inch, 4.5*inch])
        alu_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('BACKGROUND', (0,0), (0,-1), colors.lightgrey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        elements.append(alu_table)

        # Extraer contenidos de los módulos del PACI
        modulos_map = {}
        for mod in paci_data.get('modulos', []):
            modulos_map[mod['tipo_modulo']] = mod.get('contenido_validado', '')

        def get_mod(name):
            return modulos_map.get(name, "Sin información.").replace('\n', '<br/>')

        perfil = get_mod("Perfil Funcional (Fortalezas y Barreras)")
        criterios = get_mod("3. Criterios de adecuación curricular y asignaturas")
        objetivos = get_mod("4. Objetivos de Aprendizaje")
        
        # Procesamiento especial para Propuestas Educativas (JSON string a texto formateado)
        herramientas_raw = get_mod("Propuestas Educativas")
        herramientas = herramientas_raw
        if herramientas_raw.startswith("["):
            try:
                import json as _json
                # Reemplazar comillas simples o dobles escapadas y arreglar br tags insertados por get_mod
                clean_json = herramientas_raw.replace('<br/>', '\\n')
                propuestas_list = _json.loads(clean_json)
                herramientas_formatted = ""
                for prop in propuestas_list:
                    titulo = prop.get("titulo", "")
                    justif = prop.get("justificacion", "")
                    herramientas_formatted += f"<b>• {titulo}:</b> {justif}<br/><br/>"
                herramientas = herramientas_formatted
            except Exception as e:
                print(f"Error parseando propuestas para PDF: {e}")
        
        tiempo = get_mod("6. Tiempo de aplicación")
        responsables = get_mod("7. Responsable de su aplicación y seguimiento")
        recursos = get_mod("8. Recursos humanos y materiales involucrados")
        estrategia = get_mod("9. Estrategia de seguimiento y evaluación")
        evaluacion = get_mod("10. Evaluación de resultados de aprendizaje")
        revision = get_mod("11. Revisión y ajuste del plan")

        # --- 3. CRITERIOS DE ADECUACIÓN ---
        elements.append(Paragraph("3. CRITERIOS DE ADECUACIÓN CURRICULAR Y ASIGNATURAS", section_style))
        
        criterios_data = [
            [Paragraph("<b>Perfil Funcional (Fortalezas y Barreras de Aprendizaje):</b>", bold_style)],
            [Paragraph(perfil, normal_style)],
            [Paragraph("<b>Graduación de nivel de complejidad, temporización, enriquecimiento:</b>", bold_style)],
            [Paragraph(criterios, normal_style)],
            [Paragraph("<b>Objetivos de Aprendizaje a trabajar por asignatura:</b>", bold_style)],
            [Paragraph(objetivos, normal_style)]
        ]
        
        crit_table = Table(criterios_data, colWidths=[6.5*inch])
        crit_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('BACKGROUND', (0,2), (-1,2), colors.lightgrey),
            ('BACKGROUND', (0,4), (-1,4), colors.lightgrey),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        elements.append(crit_table)

        # --- 4 y 5. HERRAMIENTAS Y TIEMPO ---
        elements.append(Paragraph("4. HERRAMIENTAS Y ESTRATEGIAS", section_style))
        ht_data = [
            [Paragraph("<b>Herramienta o Estrategia Metodológica a Utilizar (Propuestas):</b>", bold_style)],
            [Paragraph(herramientas, normal_style)]
        ]
        ht_table = Table(ht_data, colWidths=[6.5*inch])
        ht_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        elements.append(ht_table)

        elements.append(Paragraph("5. TIEMPO DE APLICACIÓN", section_style))
        tiempo_data = [[Paragraph("<b>Tiempo:</b>", bold_style), Paragraph(tiempo, normal_style)]]
        tiempo_t = Table(tiempo_data, colWidths=[1.5*inch, 5*inch])
        tiempo_t.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.black), ('PADDING', (0,0), (-1,-1), 6)]))
        elements.append(tiempo_t)

        # --- 6 y 7. RESPONSABLES Y RECURSOS ---
        elements.append(Paragraph("6. RESPONSABLE DE SU APLICACIÓN Y SEGUIMIENTO", section_style))
        resp_data = [[Paragraph(responsables, normal_style)]]
        resp_t = Table(resp_data, colWidths=[6.5*inch])
        resp_t.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.black), ('PADDING', (0,0), (-1,-1), 6)]))
        elements.append(resp_t)

        elements.append(Paragraph("7. RECURSOS HUMANOS Y MATERIALES INVOLUCRADOS", section_style))
        rec_data = [[Paragraph(recursos, normal_style)]]
        rec_t = Table(rec_data, colWidths=[6.5*inch])
        rec_t.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.black), ('PADDING', (0,0), (-1,-1), 6)]))
        elements.append(rec_t)

        # --- 8, 9 y 10. EVALUACIÓN Y SEGUIMIENTO ---
        elements.append(Paragraph("8. ESTRATEGIA DE SEGUIMIENTO Y EVALUACIÓN", section_style))
        est_data = [[Paragraph(estrategia, normal_style)]]
        est_t = Table(est_data, colWidths=[6.5*inch])
        est_t.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.black), ('PADDING', (0,0), (-1,-1), 6)]))
        elements.append(est_t)

        elements.append(Paragraph("9. EVALUACIÓN DE RESULTADOS DE APRENDIZAJE", section_style))
        eva_data = [[Paragraph(evaluacion, normal_style)]]
        eva_t = Table(eva_data, colWidths=[6.5*inch])
        eva_t.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.black), ('PADDING', (0,0), (-1,-1), 6)]))
        elements.append(eva_t)

        elements.append(Paragraph("10. REVISIÓN Y AJUSTE DEL PLAN", section_style))
        rev_data = [[Paragraph(revision, normal_style)]]
        rev_t = Table(rev_data, colWidths=[6.5*inch])
        rev_t.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.black), ('PADDING', (0,0), (-1,-1), 6)]))
        elements.append(rev_t)

        # --- 6. FIRMAS ---
        elements.append(Spacer(1, 60))
        
        firmas_base = ["Profesor(a) Jefe", "Educador(a) Diferencial", "Director(a) / UTP", "Firma Apoderado"]
        
        firmas_requeridas_raw = get_mod("Firmas Requeridas")
        firmas_adicionales = []
        if firmas_requeridas_raw.startswith("["):
            try:
                import json as _json
                firmas_adicionales = _json.loads(firmas_requeridas_raw.replace('<br/>', '\\n'))
            except:
                pass
        
        todas_firmas = firmas_base.copy()
        for f in firmas_adicionales:
            if not any(f.lower() in b.lower() for b in todas_firmas) and not any(b.lower() in f.lower() for b in todas_firmas):
                todas_firmas.append(f)
                
        firmas_data = []
        table_style_commands = [
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
        ]
        
        row_idx = 0
        for i in range(0, len(todas_firmas), 3):
            chunk = todas_firmas[i:i+3]
            lineas = ["_____________________" for _ in chunk]
            cargos = list(chunk) # copy to avoid modifying original
            while len(lineas) < 3:
                lineas.append("")
                cargos.append("")
                
            if i > 0:
                firmas_data.append(["", "", ""])
                firmas_data.append(["", "", ""])
                firmas_data.append(["", "", ""])
                row_idx += 3
                
            firmas_data.append(lineas)
            firmas_data.append(cargos)
            table_style_commands.append(('FONTNAME', (0, row_idx+1), (-1, row_idx+1), 'Helvetica-Bold'))
            row_idx += 2
        
        firmas_table = Table(firmas_data, colWidths=[2.1*inch, 2.1*inch, 2.1*inch])
        firmas_table.setStyle(TableStyle(table_style_commands))
        elements.append(firmas_table)

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
