# SYNEXA 2.0
# Rediseño centrado en las personas
## Documento de directrices para Antigravity

> **Objetivo:** Transformar SYNEXA desde un gestor documental hacia un asistente inteligente para equipos PIE, aplicando Design Thinking y manteniendo el equilibrio entre deseabilidad, factibilidad técnica y viabilidad económica.

---

# 1. Visión del producto

La plataforma NO debe sentirse como un sistema para completar formularios.

Debe sentirse como un compañero de trabajo que acompaña a educadoras diferenciales, docentes, psicólogos, fonoaudiólogos, terapeutas ocupacionales, UTP y directivos durante todo el proceso de construcción colaborativa del PACI.

La IA nunca reemplaza al profesional.

La IA organiza, resume, propone, explica y coordina.

Las decisiones siempre pertenecen a las personas.

---

# 2. Principios de Design Thinking

Toda funcionalidad nueva deberá responder afirmativamente a estas preguntas:

## Deseabilidad

- ¿Reduce la carga de trabajo?
- ¿Disminuye el estrés?
- ¿Facilita la colaboración?
- ¿Ahorra tiempo?
- ¿Hace sentir acompañado al usuario?

## Factibilidad

Implementable mediante:

- React / Next.js
- FastAPI
- PostgreSQL
- RAG
- Modelos LLM
- OCR
- Sistema de permisos por roles

## Viabilidad

- Uso eficiente de IA.
- Consultas inteligentes bajo demanda.
- Arquitectura modular.
- Escalable a otros instrumentos además del PACI.

---

# 3. Nuevo paradigma

Actualmente

Sistema → Documento → Usuario

Debe transformarse en

Usuario → Estudiante → Equipo → Evidencias → Decisiones → Documento

El documento es el resultado.

Nunca el centro.

---

# 4. Dashboard completamente nuevo

Eliminar el foco en estadísticas generales.

Al ingresar mostrar:

## Buenos días, María José

Hoy puedes avanzar en:

- Revisar PACI de Benjamín (4 minutos)
- Validar Lenguaje de Martina (3 minutos)
- Resolver observación de Psicología (2 minutos)

Resumen:

- 2 tareas críticas
- 5 tareas pendientes
- 3 tareas completadas hoy

Mostrar tiempo estimado restante de la jornada.

El Dashboard debe responder únicamente:

¿Qué debo hacer ahora?

---

# 5. Centro de Coordinación

Crear una sección permanente denominada:

## Centro de Trabajo

Debe contener:

- próximas acciones
- estudiantes prioritarios
- documentos nuevos
- revisiones pendientes
- firmas pendientes
- mensajes del equipo
- recomendaciones IA

---

# 6. Asistente IA permanente

Agregar un panel lateral fijo.

Debe funcionar como copiloto.

Nunca como chatbot genérico.

Funciones:

- explicar cada paso
- resumir documentos
- detectar contradicciones
- sugerir adecuaciones
- indicar documentos faltantes
- orientar al docente
- explicar normativa
- responder preguntas contextuales

Ejemplos:

"Detecté un nuevo informe psicológico."

"Esta recomendación proviene del informe psicopedagógico, página 5."

"Falta la evaluación diagnóstica de Matemática."

---

# 7. El estudiante como centro

Al abrir un caso mostrar inmediatamente:

- fotografía
- nombre
- curso
- diagnóstico
- equipo profesional
- objetivos prioritarios
- estado del expediente
- próxima acción

Luego aparecen documentos y formularios.

---

# 8. Expediente vivo

Reemplazar la carpeta tradicional por una línea de tiempo.

Ejemplo:

Ingreso PIE

↓

Evaluación

↓

Informe Psicología

↓

Informe Psicopedagogía

↓

Observación Profesor

↓

Adecuaciones

↓

PACI

↓

Validación

↓

Seguimiento

---

# 9. IA explicable

Toda sugerencia debe incluir:

- documento origen
- profesional responsable
- fecha
- página
- evidencia utilizada
- nivel de confianza

Nunca utilizar cajas negras.

---

# 10. Sustituir el botón principal

Eliminar:

"Generar PACI en 1 clic"

Reemplazar por:

- Construir primer borrador
- Analizar expediente
- Generar propuesta inicial

Transmitir colaboración, no automatización absoluta.

---

# 11. Dashboards por rol

Cada perfil visualiza información distinta.

Educadora diferencial

- estudiantes
- expedientes
- IA
- validaciones

Profesor

- tareas pendientes
- observaciones
- adecuaciones
- validaciones

Psicóloga

- informes
- recomendaciones
- seguimiento

UTP

- indicadores
- auditoría
- aprobación

---

# 12. Colores por perfil

Mantener identidad común.

Cambiar únicamente acentos.

Profesor → Azul

Educadora diferencial → Burdeos

Psicóloga → Púrpura

Psicopedagoga → Turquesa

Parvularia → Verde

Fonoaudióloga → Celeste

Terapeuta ocupacional → Naranjo

---

# 13. Reportes accionables

Eliminar gráficos decorativos.

Mostrar información útil para decidir.

Ejemplos:

Tiempo promedio de construcción PACI.

Profesores pendientes.

Informes faltantes.

Estudiantes sin revisión reciente.

---

# 14. Biblioteca inteligente

La IA clasifica automáticamente:

- Psicología
- Psicopedagogía
- Familia
- Médico
- Evaluaciones
- Normativa

Etiquetado automático mediante IA.

---

# 15. Centro de Coordinación Interdisciplinaria

Crear el módulo más importante de la plataforma.

Cada estudiante posee un espacio colaborativo.

Cada profesional puede:

- comentar
- responder
- validar
- adjuntar evidencia
- proponer acciones

La IA resume automáticamente los acuerdos y genera tareas.

Mostrar:

- qué cambió
- quién realizó el cambio
- decisiones pendientes
- acuerdos
- historial completo

Este módulo debe transformarse en el corazón de SYNEXA.

---

# 16. Navegación

Priorizar tareas.

Reducir clics.

Mostrar siempre:

- siguiente paso
- progreso
- responsable
- tiempo estimado

El usuario nunca debe preguntarse qué hacer después.

---

# 17. Métrica principal del producto

La principal métrica de éxito NO será:

Cantidad de PACI.

Será:

- Horas ahorradas.
- Tiempo promedio de construcción.
- Participación de docentes.
- Participación interdisciplinaria.
- Reducción de correcciones.
- Satisfacción de usuarios.

---

# 18. Declaración final

SYNEXA debe convertirse en la plataforma que coordina decisiones pedagógicas basadas en evidencia.

No solo construye PACI.

Organiza personas.

Conecta profesionales.

Integra evidencia.

Explica decisiones.

Genera confianza.

La experiencia ideal será que cualquier usuario diga:

> "No siento que esté llenando un formulario.
> Siento que SYNEXA me acompaña y coordina todo el trabajo del equipo."
