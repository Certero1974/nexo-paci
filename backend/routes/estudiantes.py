from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import Estudiante, Usuario
from models.schemas import EstudianteCreate, EstudianteOut
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/estudiantes", tags=["Estudiantes"])

@router.get("", response_model=List[EstudianteOut])
def get_estudiantes(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    """
    Obtiene la lista de todos los estudiantes registrados.
    Requiere token de autenticación.
    """
    estudiantes = db.query(Estudiante).filter(Estudiante.institucion_id == current_user.institucion_id).all()
    return estudiantes

@router.post("", response_model=EstudianteOut, status_code=status.HTTP_201_CREATED)
def create_estudiante(
    estudiante: EstudianteCreate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crea un nuevo estudiante en el sistema.
    Requiere token de autenticación.
    """
    # Verificar si el RUT ya existe
    db_estudiante = db.query(Estudiante).filter(
        Estudiante.rut == estudiante.rut,
        Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if db_estudiante:
        raise HTTPException(status_code=400, detail="El RUT ya está registrado en el sistema")
        
    nuevo_estudiante = Estudiante(
        rut=estudiante.rut,
        nombre_completo=estudiante.nombre_completo,
        fecha_nacimiento=estudiante.fecha_nacimiento,
        curso=estudiante.curso,
        diagnostico_pie=estudiante.diagnostico_pie,
        institucion_id=current_user.institucion_id
    )
    
    db.add(nuevo_estudiante)
    db.commit()
    db.refresh(nuevo_estudiante)
    
    # Auto-crear un expediente digital para este estudiante
    from models.models import Expediente
    nuevo_expediente = Expediente(
        estudiante_id=nuevo_estudiante.id,
        estado="Abierto"
    )
    db.add(nuevo_expediente)
    db.commit()
    
    return nuevo_estudiante
    
@router.put("/{estudiante_id}", response_model=EstudianteOut)
def update_estudiante(
    estudiante_id: int,
    estudiante_in: EstudianteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    db_estudiante = db.query(Estudiante).filter(
        Estudiante.id == estudiante_id,
        Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if not db_estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    db_estudiante.rut = estudiante_in.rut
    db_estudiante.nombre_completo = estudiante_in.nombre_completo
    db_estudiante.fecha_nacimiento = estudiante_in.fecha_nacimiento
    db_estudiante.curso = estudiante_in.curso
    db_estudiante.diagnostico_pie = estudiante_in.diagnostico_pie
    
    db.commit()
    db.refresh(db_estudiante)
    return db_estudiante

@router.delete("/{estudiante_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_estudiante(
    estudiante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    db_estudiante = db.query(Estudiante).filter(
        Estudiante.id == estudiante_id,
        Estudiante.institucion_id == current_user.institucion_id
    ).first()
    if not db_estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    db.delete(db_estudiante)
    db.commit()
    return None
