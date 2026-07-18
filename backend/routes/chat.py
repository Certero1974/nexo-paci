from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
from models import models
from services.gemini_service import GeminiPaciService

router = APIRouter(prefix="/api/chat", tags=["Chat Copiloto"])
gemini_service = GeminiPaciService()

class ChatRequest(BaseModel):
    mensaje: str
    contexto: str = ""
    paci_id: Optional[int] = None

@router.post("/")
def chat_copiloto(req: ChatRequest, db: Session = Depends(get_db)):
    contexto_final = req.contexto
    if req.paci_id:
        paci = db.query(models.Paci).filter(models.Paci.id == req.paci_id).first()
        if paci:
            estudiante = paci.expediente.estudiante
            contexto_final += f" | Estudiante: {estudiante.nombre_completo}, Diagnóstico: {estudiante.diagnostico_pie}. Contenido del PACI:\n"
            for mod in paci.modulos:
                contexto_final += f"- {mod.tipo_modulo}: {mod.contenido_validado[:200]}...\n" # Acortado para no reventar tokens innecesarios, o completo
                
    respuesta = gemini_service.chat_con_copiloto(req.mensaje, contexto_final)
    return {"respuesta": respuesta}
