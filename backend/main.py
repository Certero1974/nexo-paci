from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NEXO PACI API",
    description="API para la plataforma de gestión de expedientes y decisiones pedagógicas (PACI).",
    version="0.1.0"
)

# Configurar CORS para permitir comunicación con el Frontend (Next.js)
import os
allow_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import expedientes, paci, documents, auth, estudiantes, calendario, reportes, configuracion, chat

app.include_router(estudiantes.router)
app.include_router(expedientes.router)
app.include_router(paci.router)
app.include_router(documents.router)
app.include_router(auth.router)
app.include_router(calendario.router)
app.include_router(reportes.router)
app.include_router(configuracion.router)
app.include_router(chat.router)

# Crear tablas en la base de datos si no existen
from database import engine
from models import models
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de NEXO PACI"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "NEXO PACI Backend"}
