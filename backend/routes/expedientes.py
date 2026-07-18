from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil

from database import get_db
from models import models, schemas
from services.auth_service import get_current_user

router = APIRouter(
    prefix="/api/expedientes",
    tags=["expedientes"]
)

# Directorio base para expedientes
UPLOAD_DIR = "uploads/expedientes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[schemas.ExpedienteOut])
def listar_expedientes(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    expedientes = db.query(models.Expediente).join(models.Estudiante).filter(
        models.Estudiante.institucion_id == current_user.institucion_id
    ).offset(skip).limit(limit).all()
    return expedientes

@router.get("/{expediente_id}", response_model=schemas.ExpedienteOut)
def obtener_expediente(
    expediente_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    expediente = db.query(models.Expediente).join(models.Estudiante).filter(
        models.Expediente.id == expediente_id,
        models.Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    return expediente

@router.get("/estudiante/{estudiante_id}", response_model=schemas.ExpedienteOut)
def obtener_expediente_por_estudiante(
    estudiante_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    expediente = db.query(models.Expediente).join(models.Estudiante).filter(
        models.Expediente.estudiante_id == estudiante_id,
        models.Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    return expediente

# Nueva ruta para subir PDFs a un expediente específico
@router.post("/{expediente_id}/documentos")
async def subir_documento_a_expediente(
    expediente_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Verificar si el expediente existe
    expediente = db.query(models.Expediente).join(models.Estudiante).filter(
        models.Expediente.id == expediente_id,
        models.Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")

    # Validar extensión
    allowed_extensions = {".pdf", ".docx"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido. Solo se aceptan documentos PDF y DOCX.")

    # Guardar archivo físicamente o en Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    file_path = os.path.join(UPLOAD_DIR, f"{expediente_id}_{file.filename}")
    
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            file_bytes = file.file.read()
            path_in_bucket = f"expedientes/{expediente_id}_{file.filename}"
            supabase.storage.from_("pacia-docs").upload(
                path=path_in_bucket,
                file=file_bytes,
                file_options={"content-type": file.content_type}
            )
            file_path = supabase.storage.from_("pacia-docs").get_public_url(path_in_bucket)
        except Exception as e:
            print(f"Error Supabase Storage, usando local: {e}")
            file.file.seek(0)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
    else:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
    def clasificar_por_ia(filename: str) -> str:
        name = filename.lower()
        if any(k in name for k in ['profesor', 'aula', 'docente']): return "Profesor de Aula"
        if any(k in name for k in ['psico', 'wisc', 'eval', 'cogni']): return "Psicología"
        if any(k in name for k in ['fono', 'lenguaje']): return "Fonoaudiología"
        if any(k in name for k in ['medico', 'neuro', 'salud', 'receta']): return "Médico"
        if any(k in name for k in ['familia', 'entrevista', 'anamnesis', 'apoderado']): return "Familia"
        if any(k in name for k in ['pedagog', 'educa', 'aprendi']): return "Psicopedagogía"
        return "Psicopedagogía" # Por defecto para alumnos

    import re
    def limpiar_nombre_archivo(filename: str) -> str:
        name, _ = os.path.splitext(filename)
        # Quitar sufijos comunes
        name = re.sub(r'(?i)[_-]?(v\d+\.?\d*|final|rev\d*|draft|borrador|copia|\d{4}-\d{2}-\d{2}|\d{8})', '', name)
        name = name.replace('_', ' ').replace('-', ' ')
        name = ' '.join(name.split()).title()
        
        # Mapeo a títulos profesionales si coincide
        low = name.lower()
        if 'fono' in low: return "Informe Fonoaudiológico"
        if 'wisc' in low or 'psico' in low: return "Informe Psicológico"
        if 'pedagog' in low or 'eval' in low: return "Evaluación Psicopedagógica"
        if 'medico' in low or 'neuro' in low: return "Informe Médico"
        if 'anamnesis' in low or 'entrevista' in low: return "Anamnesis"
        
        return name if len(name) > 3 else filename

    categoria_asignada = clasificar_por_ia(file.filename)
    nombre_limpio = limpiar_nombre_archivo(file.filename)
        
    # Guardar registro en la base de datos
    nuevo_doc = models.Documento(
        expediente_id=expediente_id,
        subido_por=current_user.id,
        nombre_archivo=nombre_limpio,
        ruta_almacenamiento=file_path,
        tipo_mime=file.content_type,
        categoria=categoria_asignada,
        procesado_ocr=False
    )
    db.add(nuevo_doc)
    db.commit()
    db.refresh(nuevo_doc)
    
    return {"id": nuevo_doc.id, "nombre_archivo": nuevo_doc.nombre_archivo, "mensaje": "Documento subido exitosamente"}

@router.get("/{expediente_id}/documentos")
def listar_documentos_de_expediente(
    expediente_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Primero validamos que el expediente pertenezca a la institución
    expediente = db.query(models.Expediente).join(models.Estudiante).filter(
        models.Expediente.id == expediente_id,
        models.Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
        
    documentos = db.query(models.Documento).filter(models.Documento.expediente_id == expediente_id).all()
    return [{"id": d.id, "nombre_archivo": d.nombre_archivo, "fecha_subida": d.fecha_subida} for d in documentos]

# Rutas para el Centro de Coordinación Interdisciplinaria (Comentarios)
@router.post("/{expediente_id}/comentarios", response_model=schemas.ComentarioOut)
def crear_comentario(
    expediente_id: int,
    comentario: schemas.ComentarioCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    expediente = db.query(models.Expediente).join(models.Estudiante).filter(
        models.Expediente.id == expediente_id,
        models.Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")

    nuevo_comentario = models.ComentarioExpediente(
        expediente_id=expediente_id,
        usuario_id=current_user.id,
        mensaje=comentario.mensaje
    )
    db.add(nuevo_comentario)
    db.commit()
    db.refresh(nuevo_comentario)
    return nuevo_comentario

@router.get("/{expediente_id}/comentarios", response_model=List[schemas.ComentarioOut])
def listar_comentarios(
    expediente_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Validar acceso
    expediente = db.query(models.Expediente).join(models.Estudiante).filter(
        models.Expediente.id == expediente_id,
        models.Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")

    comentarios = db.query(models.ComentarioExpediente).filter(
        models.ComentarioExpediente.expediente_id == expediente_id
    ).order_by(models.ComentarioExpediente.fecha.asc()).all()
    return comentarios
