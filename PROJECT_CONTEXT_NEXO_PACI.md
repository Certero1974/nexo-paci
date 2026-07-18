# PROJECT_CONTEXT.md
# NEXO PACI
## Contexto Maestro del Proyecto

> Este documento constituye la memoria permanente del proyecto y debe ser cargado al iniciar cualquier sesión de desarrollo.

---

# Identidad del proyecto

Nombre: NEXO PACI

Propósito:

Desarrollar una plataforma web profesional para apoyar la construcción, revisión, validación y seguimiento del Plan de Adecuación Curricular Individual (PACI) mediante IA, recuperación documental (RAG) y un flujo de corresponsabilidad profesional.

La plataforma no reemplaza el juicio profesional.

La IA propone.

Las personas deciden.

---

# Visión

Transformar el proceso de elaboración del PACI desde una tarea administrativa individual hacia un proceso colaborativo, trazable y basado en evidencia.

---

# Principios

1. Toda propuesta debe tener evidencia.
2. Ninguna IA aprueba un PACI.
3. Cada profesional revisa únicamente aquello que corresponde a su competencia.
4. El PACI es un expediente vivo, no un documento estático.
5. Toda decisión debe poder explicarse ("¿Por qué?").

---

# Arquitectura conceptual

Documentos
    ↓
Banco de Evidencias
    ↓
Motor de Decisión Pedagógica
    ↓
Constructor Modular PACI
    ↓
Flujo de Corresponsabilidad
    ↓
Auditoría
    ↓
Documento Final

---

# Módulos del sistema

- Expedientes
- Gestor documental
- Banco de evidencias
- Motor de Decisión Pedagógica
- Constructor PACI
- Flujo de corresponsabilidad
- Auditor
- Exportación
- Historial

---

# Motor de Decisión Pedagógica

No redacta.

Razona.

Debe:

- identificar fortalezas;
- identificar barreras;
- relacionar evidencias con OA;
- detectar contradicciones;
- proponer respuestas educativas;
- justificar cada propuesta.

Cadena obligatoria:

Evidencia → Barrera → OA → Adecuación → Indicador → Seguimiento

---

# Flujo de corresponsabilidad

Cada sección del PACI tiene:

- responsable principal;
- revisores;
- checklist;
- estado;
- trazabilidad.

Estados:

- Sin información
- Borrador IA
- Asignado
- En revisión
- Observado
- Aprobado con cambios
- Aprobado
- Bloqueado

---

# UX

El usuario principal es la educadora diferencial.

La interfaz debe ser:

- limpia;
- minimalista;
- con muy pocos clics;
- lenguaje técnico pedagógico;
- navegación por pasos.

Los docentes reciben microtareas de menos de 10 minutos.

---

# Tecnología objetivo

Frontend:
- Next.js
- React
- Tailwind

Backend:
- FastAPI

Persistencia:
- PostgreSQL
- pgvector

IA:
- Gemini
- RAG

---

# Seguridad

Información de menores.

Obligatorio:

- autenticación;
- control por roles;
- auditoría;
- cifrado;
- historial de versiones.

---

# Restricciones

Nunca generar recomendaciones sin evidencia.

Nunca modificar la plantilla institucional.

Nunca ocultar la fuente de una propuesta.

No automatizar la aprobación final.

---

# Roadmap

Sprint 1: Arquitectura
Sprint 2: UX/UI
Sprint 3: Modelo de datos
Sprint 4: Backend
Sprint 5: Frontend
Sprint 6: IA
Sprint 7: RAG
Sprint 8: QA y despliegue

---

# Convención para Antigravity

Antes de escribir código:

1. Explicar la solución.
2. Mostrar arquitectura.
3. Mostrar impacto sobre módulos existentes.
4. Esperar aprobación.
5. Recién implementar.

Este documento debe considerarse la referencia principal durante todo el desarrollo del proyecto.
