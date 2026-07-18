# Software Requirements Specification (SRS)
# BASY – Plataforma Inteligente para la Gestión del PACI

**Versión:** 0.1 (Borrador de Arquitectura)
**Estado:** Documento base para diseño y desarrollo

---

# 1. Introducción

## 1.1 Propósito

Este documento define los requisitos funcionales y no funcionales de BASY, una plataforma web destinada a apoyar la elaboración, implementación y seguimiento del Plan de Adecuación Curricular Individual (PACI) mediante inteligencia artificial, recuperación de información (RAG) y una arquitectura evolutiva hacia un sistema multiagente.

La plataforma no sustituye el juicio profesional; su objetivo es organizar evidencia, facilitar la colaboración interdisciplinaria y mantener trazabilidad de las decisiones pedagógicas.

## 1.2 Objetivos

- Reducir el tiempo administrativo requerido para elaborar un PACI.
- Mejorar la calidad y consistencia técnica de los planes.
- Integrar información proveniente de múltiples fuentes.
- Mantener trazabilidad entre evidencia y decisiones.
- Facilitar el seguimiento longitudinal del estudiante.

---

# 2. Alcance

## Incluye

- Gestión de expedientes.
- Repositorio documental.
- Integración curricular.
- Generación asistida de PACI.
- Seguimiento.
- Exportación.
- Auditoría.

## No incluye (MVP)

- Firma electrónica avanzada.
- Integración automática con plataformas ministeriales.
- Diagnóstico clínico.
- Decisiones automáticas sin validación humana.

---

# 3. Stakeholders

- Educadora diferencial
- Docentes
- Profesor jefe
- Coordinación PIE
- UTP
- Dirección
- Psicología
- Psicopedagogía
- Fonoaudiología
- Terapia Ocupacional
- Kinesiología
- Trabajo Social
- Familia
- Estudiante

---

# 4. Arquitectura conceptual

```text
Frontend (React / Next.js)

        │

API

        │

Orquestador BASY

 ├─ Currículo
 ├─ Normativa
 ├─ Psicopedagogía
 ├─ Socioemocional
 ├─ Familia
 ├─ Adecuaciones
 ├─ Seguimiento
 └─ Auditor

        │

Motor RAG

        │

Base documental

        │

Base de datos cifrada
```

---

# 5. Modelo de datos

## Entidades principales

- Usuario
- Rol
- Estudiante
- Expediente
- Documento
- Evidencia
- Barrera
- Fortaleza
- Objetivo de Aprendizaje
- Adecuación
- Estrategia
- Indicador
- Seguimiento
- Profesional
- Familia
- Comentario
- Versión PACI

Relaciones principales:

Estudiante → Expediente

Expediente → Documentos

Documentos → Evidencias

Evidencias → Barreras

Barreras → Adecuaciones

Adecuaciones → Indicadores

Indicadores → Seguimiento

---

# 6. Casos de uso

## UC01 Crear expediente

Actor:
Educadora diferencial.

Resultado:
Expediente creado.

---

## UC02 Cargar documentos

Entradas:

- PDF
- Word
- imágenes
- formularios

Resultado:

Repositorio clasificado.

---

## UC03 Analizar documentos

Salida:

- evidencias
- fortalezas
- necesidades
- alertas

---

## UC04 Construir matriz de decisiones

Cada fila contendrá:

- evidencia
- barrera
- OA
- respuesta
- responsable
- indicador

---

## UC05 Generar borrador PACI

La plataforma propone un documento editable.

---

## UC06 Validar

Los profesionales aprueban o modifican.

---

## UC07 Seguimiento

Registro permanente de evidencias.

---

# 7. Requisitos funcionales

RF-001 Crear expediente.

RF-002 Gestionar usuarios.

RF-003 Gestionar roles.

RF-004 Cargar documentos.

RF-005 Clasificar documentos.

RF-006 Detectar documentos faltantes.

RF-007 Extraer evidencias.

RF-008 Vincular evidencias con OA.

RF-009 Detectar barreras.

RF-010 Detectar fortalezas.

RF-011 Construir perfil.

RF-012 Construir matriz.

RF-013 Generar borrador PACI.

RF-014 Auditoría.

RF-015 Historial de versiones.

RF-016 Exportación Word.

RF-017 Exportación PDF.

RF-018 Seguimiento.

RF-019 Dashboard.

RF-020 Registro de actividad.

---

# 8. Requisitos no funcionales

## Seguridad

- cifrado AES-256
- HTTPS
- MFA
- auditoría
- permisos por rol

## Rendimiento

- apertura expediente <2 s
- búsqueda documental <3 s

## Disponibilidad

99,5 %

## Escalabilidad

Arquitectura preparada para microservicios.

## Accesibilidad

WCAG 2.2 AA.

---

# 9. Arquitectura evolutiva

## MVP

Sin agentes autónomos.

Asistente único + RAG.

## V2

Módulos especializados.

## V3

Orquestador multiagente.

## V4

Revisión cruzada entre agentes.

---

# 10. Agentes futuros

## Agente Curricular

Consulta Bases Curriculares.

## Agente Normativo

Consulta legislación.

## Agente Psicopedagógico

Analiza informes.

## Agente Familiar

Integra contexto.

## Agente Adecuaciones

Propone estrategias.

## Agente Auditor

Detecta inconsistencias.

---

# 11. Interfaces

Dashboard

Expediente

Documentos

Perfil

Currículum

Constructor PACI

Seguimiento

Configuración

---

# 12. Integraciones

Google Drive

Microsoft 365

Correo institucional

LMS

API futura de sistemas escolares

---

# 13. Roadmap

Fase 1
Modelo funcional

Fase 2
Diseño UX

Fase 3
MVP

Fase 4
Piloto

Fase 5
Versión institucional

---

# 14. Riesgos

- sobreautomatización
- baja calidad documental
- privacidad
- dependencia de IA
- normativa cambiante

---

# 15. Indicadores de éxito

- reducción del tiempo de elaboración del PACI
- satisfacción del equipo PIE
- disminución de errores
- mayor trazabilidad
- mayor utilización del PACI durante el año

---

# Anexo A

Principio rector:

"Evidencia → Barrera → OA → Adecuación → Indicador → Seguimiento."

Este principio debe cumplirse para toda decisión registrada en BASY.
