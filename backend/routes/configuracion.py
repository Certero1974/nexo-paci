import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import models, schemas
from services.auth_service import get_current_user, get_password_hash, RoleChecker

router = APIRouter(prefix="/api/configuracion", tags=["Configuración"])

# --- AJUSTES INSTITUCIONALES ---

@router.get("/ajustes", response_model=schemas.AjustesOut)
def obtener_ajustes(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ajustes = db.query(models.AjustesInstitucionales).filter(
        models.AjustesInstitucionales.institucion_id == current_user.institucion_id
    ).first()
    if not ajustes:
        # Crear ajustes por defecto si no existen
        ajustes = models.AjustesInstitucionales(institucion_id=current_user.institucion_id)
        db.add(ajustes)
        db.commit()
        db.refresh(ajustes)
    return ajustes

@router.put("/ajustes", response_model=schemas.AjustesOut)
def actualizar_ajustes(
    ajustes_in: schemas.AjustesBase,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ajustes = db.query(models.AjustesInstitucionales).filter(
        models.AjustesInstitucionales.institucion_id == current_user.institucion_id
    ).first()
    if not ajustes:
        ajustes = models.AjustesInstitucionales(institucion_id=current_user.institucion_id)
        db.add(ajustes)
    
    ajustes.nombre_colegio = ajustes_in.nombre_colegio
    ajustes.rbd = ajustes_in.rbd
    ajustes.director = ajustes_in.director
    ajustes.prompt_ia = ajustes_in.prompt_ia
    
    db.commit()
    db.refresh(ajustes)
    return ajustes

UPLOAD_DIR_LOGO = "uploads/institucional/logo"
os.makedirs(UPLOAD_DIR_LOGO, exist_ok=True)

@router.post("/logo")
async def subir_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Guardar archivo físicamente
    file_path = os.path.join(UPLOAD_DIR_LOGO, "logo_oficial.png")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Actualizar DB
    ajustes = db.query(models.AjustesInstitucionales).filter(
        models.AjustesInstitucionales.institucion_id == current_user.institucion_id
    ).first()
    if not ajustes:
        ajustes = models.AjustesInstitucionales(institucion_id=current_user.institucion_id)
        db.add(ajustes)
    
    ajustes.logo_path = file_path
    db.commit()
    
    return {"status": "success", "mensaje": "Logo actualizado"}

# --- GESTIÓN DE USUARIOS ---

@router.get("/usuarios", response_model=List[schemas.UsuarioOut])
def listar_usuarios(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    # Solo un administrador o UTP debería ver esto en un caso real, por ahora lo simplificamos
    usuarios = db.query(models.Usuario).filter(models.Usuario.institucion_id == current_user.institucion_id).all()
    return usuarios

@router.post("/usuarios", response_model=schemas.UsuarioOut)
def crear_usuario(
    user_in: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(RoleChecker(["Coordinador PIE"]))
):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
        
    nuevo_usuario = models.Usuario(
        nombre=user_in.nombre,
        email=user_in.email,
        rol=user_in.rol,
        password_hash=get_password_hash(user_in.password),
        institucion_id=current_user.institucion_id
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.delete("/usuarios/{usuario_id}", status_code=204)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(RoleChecker(["Coordinador PIE"]))
):
    if usuario_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
        
    usuario = db.query(models.Usuario).filter(
        models.Usuario.id == usuario_id,
        models.Usuario.institucion_id == current_user.institucion_id
    ).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    db.delete(usuario)
    db.commit()
    return None
