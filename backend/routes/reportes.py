from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import models
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/reportes", tags=["Reportes"])

@router.get("/kpis")
def obtener_kpis(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # 1. Total de Estudiantes y Documentos (Métricas Base)
    total_estudiantes = db.query(models.Estudiante).filter(models.Estudiante.institucion_id == current_user.institucion_id).count()
    total_documentos = db.query(models.Documento).join(models.Expediente).join(models.Estudiante).filter(models.Estudiante.institucion_id == current_user.institucion_id).count()
    
    # 2. Métricas de Impacto (Horas Ahorradas, Participación)
    total_pacis = db.query(models.Paci).join(models.Expediente).join(models.Estudiante).filter(models.Estudiante.institucion_id == current_user.institucion_id).count()
    horas_ahorradas = total_pacis * 4.5  # Asumiendo 4.5 hrs ahorradas por PACI
    tiempo_promedio = "12 minutos" # (Frente a los días/semanas anteriores)
    participacion = "85%"
    
    # 3. Profesores Pendientes (Cuellos de botella reales o simulados para el prototipo)
    profesores_pendientes = []
    modulos_asignados = db.query(models.ModuloPaci).join(models.Paci).join(models.Expediente).join(models.Estudiante).filter(
        models.ModuloPaci.responsable_id != None, 
        models.Estudiante.institucion_id == current_user.institucion_id
    ).all()
    for mod in modulos_asignados:
        if mod.paci.estado_global != "Oficial":
            responsable = db.query(models.Usuario).filter(models.Usuario.id == mod.responsable_id).first()
            if responsable:
                profesores_pendientes.append({
                    "id": responsable.id,
                    "nombre": responsable.nombre,
                    "rol": responsable.rol,
                    "paci_id": mod.paci.id,
                    "estudiante": mod.paci.expediente.estudiante.nombre_completo,
                    "modulo": mod.tipo_modulo
                })
                
    # Fallback mock si la lista está vacía (para propósitos de la demostración visual)
    if not profesores_pendientes:
        profesores_pendientes = [
            {"id": 99, "nombre": "Carlos M.", "rol": "Profesor Aula", "paci_id": 1, "estudiante": "Benjamín Rojas", "modulo": "Validación General"},
            {"id": 98, "nombre": "Andrea V.", "rol": "Profesor Aula", "paci_id": 2, "estudiante": "Martina Pérez", "modulo": "Validación General"}
        ]
        
    # 4. Informes Faltantes (Expedientes con < 2 documentos)
    informes_faltantes = []
    expedientes = db.query(models.Expediente).join(models.Estudiante).filter(models.Estudiante.institucion_id == current_user.institucion_id).all()
    for exp in expedientes:
        docs = db.query(models.Documento).filter(models.Documento.expediente_id == exp.id).count()
        if docs < 2:
            informes_faltantes.append({
                "expediente_id": exp.id,
                "estudiante": exp.estudiante.nombre_completo,
                "diagnostico": exp.estudiante.diagnostico_pie,
                "faltante": "Informe Psicológico" if docs == 1 else "Evaluación Completa"
            })
            
    # Fallback mock
    if not informes_faltantes:
        informes_faltantes = [
            {"expediente_id": 2, "estudiante": "Martina Pérez", "diagnostico": "FIL", "faltante": "Certificado Médico Actualizado"}
        ]
        
    return {
        "impacto": {
            "horas_ahorradas": horas_ahorradas,
            "tiempo_promedio": tiempo_promedio,
            "participacion": participacion,
            "total_pacis": total_pacis,
            "total_estudiantes": total_estudiantes
        },
        "cuellos_botella": {
            "profesores_pendientes": profesores_pendientes,
            "informes_faltantes": informes_faltantes
        }
    }
