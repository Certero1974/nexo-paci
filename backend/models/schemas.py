from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

# Schemas para Usuarios
class UsuarioCreate(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str

class UsuarioOut(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str
    creado_en: datetime

    model_config = ConfigDict(from_attributes=True)

# Schemas para Estudiantes
class EstudianteBase(BaseModel):
    rut: str
    nombre_completo: str
    fecha_nacimiento: date
    curso: Optional[str] = None
    diagnostico_pie: Optional[str] = None

class EstudianteCreate(EstudianteBase):
    pass

class EstudianteOut(EstudianteBase):
    id: int
    creado_en: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Schemas para Expedientes
class ExpedienteBase(BaseModel):
    estudiante_id: int
    estado: str = "Abierto"

class ExpedienteCreate(ExpedienteBase):
    pass

class ExpedienteOut(ExpedienteBase):
    id: int
    creado_en: datetime
    estudiante: EstudianteOut
    
    model_config = ConfigDict(from_attributes=True)

class DocumentoOut(BaseModel):
    id: int
    expediente_id: Optional[int] = None
    nombre_archivo: str
    tipo_mime: Optional[str] = None
    categoria: str
    fecha_subida: datetime
    expediente: Optional[ExpedienteOut] = None
    
    model_config = ConfigDict(from_attributes=True)

# Schemas para Comentarios de Expediente
class ComentarioBase(BaseModel):
    mensaje: str

class ComentarioCreate(ComentarioBase):
    pass

class ComentarioOut(ComentarioBase):
    id: int
    expediente_id: int
    usuario_id: int
    fecha: datetime
    usuario: UsuarioOut
    
    model_config = ConfigDict(from_attributes=True)

# Schemas para Modulos del PACI
class ModuloPaciOut(BaseModel):
    id: int
    paci_id: int
    tipo_modulo: str
    contenido_validado: Optional[str] = None
    estado_revision: str
    responsable_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

# Schemas para PACI
class PaciOut(BaseModel):
    id: int
    expediente_id: int
    estado_global: str
    fecha_creacion: datetime
    expediente: ExpedienteOut
    modulos: List[ModuloPaciOut] = []
    
    model_config = ConfigDict(from_attributes=True)

# Schemas para Calendario
class EventoBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: datetime
    tipo: str
    estudiante_id: Optional[int] = None

class EventoCreate(EventoBase):
    pass

class EventoOut(EventoBase):
    id: int
    creado_por: int
    creado_en: datetime
    estudiante: Optional[EstudianteOut] = None
    
    model_config = ConfigDict(from_attributes=True)

# Schemas para Configuración
class AjustesBase(BaseModel):
    nombre_colegio: str
    rbd: Optional[str] = None
    director: Optional[str] = None
    prompt_ia: Optional[str] = None

class AjustesOut(AjustesBase):
    id: int
    logo_path: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
