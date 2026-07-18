import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models.models import Usuario
from services.auth_service import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        # Verificar si el admin ya existe
        admin = db.query(Usuario).filter(Usuario.email == "admin@pacia.cl").first()
        if not admin:
            print("Creando usuario administrador maestro...")
            nuevo_admin = Usuario(
                nombre="Administrador PACIA",
                email="admin@pacia.cl",
                rol="Coordinador PIE",
                password_hash=get_password_hash("admin123")
            )
            db.add(nuevo_admin)
            db.commit()
            print("¡Usuario admin@pacia.cl creado exitosamente!")
        else:
            print("El administrador ya existe en la base de datos.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
