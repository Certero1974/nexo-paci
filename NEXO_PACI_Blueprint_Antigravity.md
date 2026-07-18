# NEXO PACI – Blueprint Maestro para Antigravity

## Rol

Actúa como un Arquitecto de Software Senior especializado en plataformas SaaS para educación, inteligencia artificial, sistemas documentales y desarrollo full-stack.

**No escribas código inmediatamente.**

Primero diseña la arquitectura completa del sistema y presenta cada etapa para revisión antes de implementarla.

---

# Visión del proyecto

Desarrollar una plataforma web profesional llamada **NEXO PACI**.

NEXO PACI **no es un generador automático de documentos**.

Es una plataforma colaborativa que ayuda a equipos PIE a construir, revisar, validar y hacer seguimiento del Plan de Adecuación Curricular Individual (PACI), utilizando IA, recuperación documental (RAG) y un flujo de trabajo distribuido.

La IA siempre propone.

Los profesionales siempre validan.

---

# Objetivo general

Construir un sistema capaz de:

- Crear expedientes de estudiantes.
- Cargar documentos de múltiples profesionales.
- Clasificar documentos automáticamente.
- Extraer evidencias.
- Relacionarlas con el Currículum Nacional.
- Alimentar cada módulo del PACI.
- Distribuir revisiones por rol.
- Mantener trazabilidad.
- Generar versiones finales en Word y PDF.

---

# Principio rector

Documentos

↓

Evidencias

↓

Motor de Decisión Pedagógica

↓

Módulos del PACI

↓

Revisión humana

↓

Validación

↓

Documento final

---

# Filosofía

No construir un chatbot.

No construir un formulario tradicional.

No construir únicamente un generador de Word.

Construir un sistema profesional de apoyo a la decisión pedagógica.

---

# Arquitectura funcional

## Módulo 1 – Expedientes

- Gestión de estudiantes
- Historial
- Versiones
- Roles
- Documentos

## Módulo 2 – Gestor documental

- PDF
- Word
- Imágenes
- OCR
- Metadatos
- Clasificación automática

## Módulo 3 – Banco de Evidencias

Cada evidencia debe almacenar:

- fuente
- página
- autor
- fecha
- hallazgo
- recomendación
- implicación educativa
- nivel de confianza
- sección PACI relacionada

## Módulo 4 – Motor de Decisión Pedagógica

Debe:

- detectar fortalezas
- detectar barreras
- identificar apoyos efectivos
- relacionar Objetivos de Aprendizaje
- proponer adecuaciones
- detectar contradicciones
- identificar información faltante

No redacta.

Razona.

## Módulo 5 – Constructor PACI

Trabaja por módulos.

Nunca genera el documento completo en un solo paso.

Debe respetar exactamente la plantilla institucional.

## Módulo 6 – Flujo de corresponsabilidad

Cada profesional revisa únicamente las secciones que le corresponden.

Registrar:

- aprobaciones
- observaciones
- cambios
- rechazos
- fecha
- usuario

Una firma no equivale a participación.

## Módulo 7 – Auditor

Revisar:

- coherencia
- fuentes
- normativa
- responsables
- indicadores
- contradicciones
- información faltante

## Módulo 8 – Exportación

Generar:

- Word
- PDF
- Acta de validación
- Historial
- Matriz de evidencias

---

# Tecnología sugerida

Frontend

- Next.js
- React
- Tailwind CSS

Backend

- Python
- FastAPI

Persistencia

- PostgreSQL
- pgvector

IA

- Gemini
- Embeddings
- RAG

Infraestructura

- Docker

---

# Seguridad

Diseñar desde el inicio:

- control por roles
- cifrado
- auditoría
- historial
- permisos
- separación entre identidad y expediente

---

# MVP

Construir exclusivamente:

- PACI

No incorporar todavía:

- PAI
- PAEC
- Planes de reforzamiento
- Otros instrumentos

---

# Metodología de desarrollo

## Sprint 1

Arquitectura completa.

Entregar:

- C4 Model
- módulos
- flujo
- ERD

No escribir código.

## Sprint 2

Diseño UX/UI

- wireframes
- navegación
- dashboard
- expedientes
- constructor PACI
- seguimiento

## Sprint 3

Modelo de datos.

## Sprint 4

Backend.

## Sprint 5

Frontend.

## Sprint 6

Integración IA y Motor de Decisión Pedagógica.

## Sprint 7

RAG documental.

## Sprint 8

Pruebas, seguridad y despliegue.

---

# Restricciones

- No tomar decisiones finales por los profesionales.
- Toda propuesta debe ser trazable.
- Cada recomendación debe tener evidencia.
- Mantener compatibilidad con plantillas institucionales.
- Preparar la arquitectura para evolucionar posteriormente a un sistema multiagente.

---

# Entregable esperado

Antes de escribir cualquier código:

1. Arquitectura completa.
2. Modelo de datos.
3. Diagramas.
4. Wireframes.
5. Flujo de usuarios.
6. Plan técnico de implementación.

Solo después de la aprobación de esa documentación comenzar el desarrollo del software.
