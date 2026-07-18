from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import models, schemas
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("/", response_model=List[schemas.DocumentoOut])
def listar_todos_los_documentos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    documentos = db.query(models.Documento).order_by(models.Documento.fecha_subida.desc()).all()
    return documentos

@router.get("/download/{documento_id}")
def descargar_documento(documento_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Documento).filter(models.Documento.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
        
    return FileResponse(
        path=doc.ruta_almacenamiento,
        filename=doc.nombre_archivo,
        media_type=doc.tipo_mime
    )

@router.delete("/{documento_id}")
def eliminar_documento(documento_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Documento).filter(models.Documento.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    # Intentar eliminar el archivo físico
    try:
        if os.path.exists(doc.ruta_almacenamiento):
            os.remove(doc.ruta_almacenamiento)
    except:
        pass
        
    db.delete(doc)
    db.commit()
    return {"status": "success", "mensaje": "Documento eliminado correctamente"}

from pydantic import BaseModel

class CategoriaUpdate(BaseModel):
    categoria: str

@router.put("/{documento_id}/categoria")
def cambiar_categoria(
    documento_id: int, 
    payload: CategoriaUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    doc = db.query(models.Documento).filter(models.Documento.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
        
    doc.categoria = payload.categoria
    db.commit()
    return {"status": "success", "mensaje": "Categoría actualizada"}

import os
import shutil
from fastapi import UploadFile, File

UPLOAD_DIR_INST = "uploads/institucional"
os.makedirs(UPLOAD_DIR_INST, exist_ok=True)

@router.post("/upload")
async def subir_documento_institucional(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Validar extensión
    allowed_extensions = {".pdf", ".docx"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido. Solo se aceptan documentos PDF y DOCX.")
    def clasificar_por_ia(filename: str) -> str:
        name = filename.lower()
        if any(k in name for k in ['profesor', 'aula', 'docente']): return "Profesor de Aula"
        if any(k in name for k in ['psico', 'wisc', 'eval']): return "Psicología"
        if any(k in name for k in ['fono', 'lenguaje']): return "Fonoaudiología"
        if any(k in name for k in ['medico', 'neuro', 'salud', 'receta']): return "Médico"
        if any(k in name for k in ['familia', 'entrevista', 'anamnesis']): return "Familia"
        if any(k in name for k in ['pedagog', 'educa', 'aprendi']): return "Psicopedagogía"
        if any(k in name for k in ['norma', 'ley', 'decreto', 'pie', 'dua']): return "Normativa"
        return "Normativa" # Por defecto para institucionales

    import re
    def limpiar_nombre_archivo(filename: str) -> str:
        name, _ = os.path.splitext(filename)
        name = re.sub(r'(?i)[_-]?(v\d+\.?\d*|final|rev\d*|draft|borrador|copia|\d{4}-\d{2}-\d{2}|\d{8})', '', name)
        name = name.replace('_', ' ').replace('-', ' ')
        name = ' '.join(name.split()).title()
        
        low = name.lower()
        if 'fono' in low: return "Informe Fonoaudiológico"
        if 'wisc' in low or 'psico' in low: return "Informe Psicológico"
        if 'pedagog' in low or 'eval' in low: return "Evaluación Psicopedagógica"
        if 'medico' in low or 'neuro' in low: return "Informe Médico"
        if 'anamnesis' in low or 'entrevista' in low: return "Anamnesis"
        
        return name if len(name) > 3 else filename

    categoria_asignada = clasificar_por_ia(file.filename)
    nombre_limpio = limpiar_nombre_archivo(file.filename)
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    file_path = os.path.join(UPLOAD_DIR_INST, file.filename)
    
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            file_bytes = file.file.read()
            path_in_bucket = f"institucional/{file.filename}"
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
                import shutil
                shutil.copyfileobj(file.file, buffer)
    else:
        with open(file_path, "wb") as buffer:
            import shutil
            shutil.copyfileobj(file.file, buffer)
        
    nuevo_doc = models.Documento(
        expediente_id=None, # Institucional no tiene expediente
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
    
    return {"status": "success", "id": nuevo_doc.id, "mensaje": "Documento institucional subido"}
