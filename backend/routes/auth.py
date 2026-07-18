from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models.models import Usuario
from services.auth_service import verify_password, create_access_token, get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

class UserResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str

@router.post("/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscamos al usuario
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Verificamos la contraseña
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Generamos el Token JWT
    access_token = create_access_token(data={"sub": user.email, "rol": user.rol})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "nombre": user.nombre,
            "email": user.email,
            "rol": user.rol
        }
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: Usuario = Depends(get_current_user)):
    """Retorna los datos del usuario logueado actualmente con el Token."""
    return current_user
