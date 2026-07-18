from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import models, schemas
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/calendario", tags=["Calendario"])

@router.get("/", response_model=List[schemas.EventoOut])
def listar_eventos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    eventos = db.query(models.Evento).filter(
        models.Evento.institucion_id == current_user.institucion_id
    ).order_by(models.Evento.fecha_inicio.asc()).all()
    return eventos

@router.post("/", response_model=schemas.EventoOut)
def crear_evento(
    evento: schemas.EventoCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Validar que el estudiante existe si se proporcionó
    if evento.estudiante_id:
        est = db.query(models.Estudiante).filter(
            models.Estudiante.id == evento.estudiante_id,
            models.Estudiante.institucion_id == current_user.institucion_id
        ).first()
        if not est:
            raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    nuevo_evento = models.Evento(
        titulo=evento.titulo,
        descripcion=evento.descripcion,
        fecha_inicio=evento.fecha_inicio,
        fecha_fin=evento.fecha_fin,
        tipo=evento.tipo,
        estudiante_id=evento.estudiante_id,
        creado_por=current_user.id,
        institucion_id=current_user.institucion_id
    )
    
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    
    return nuevo_evento

@router.delete("/{evento_id}")
def eliminar_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    evento = db.query(models.Evento).filter(
        models.Evento.id == evento_id,
        models.Evento.institucion_id == current_user.institucion_id
    ).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
        
    db.delete(evento)
    db.commit()
    
    return {"status": "success", "mensaje": "Evento eliminado exitosamente"}
