from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Institucion(Base):
    __tablename__ = 'instituciones'
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    rut_sostenedor = Column(String(20), nullable=True)
    rbd = Column(String(50), nullable=True)
    plan_suscripcion = Column(String(50), default="Trial")
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    activa = Column(Boolean, default=True)
    
    usuarios = relationship("Usuario", back_populates="institucion", cascade="all, delete-orphan")
    estudiantes = relationship("Estudiante", back_populates="institucion", cascade="all, delete-orphan")
    ajustes = relationship("AjustesInstitucionales", back_populates="institucion", cascade="all, delete-orphan", uselist=False)
    eventos = relationship("Evento", back_populates="institucion", cascade="all, delete-orphan")

class Usuario(Base):
    __tablename__ = 'usuarios'
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    rol = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
    institucion_id = Column(Integer, ForeignKey("instituciones.id"), nullable=True) # Nullable for backward compat, then we enforce
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    institucion = relationship("Institucion", back_populates="usuarios")
    documentos_subidos = relationship("Documento", back_populates="subidor")
    pacis_creados = relationship("Paci", back_populates="creador")
    modulos_asignados = relationship("ModuloPaci", back_populates="responsable")
    revisiones_realizadas = relationship("HistorialRevision", back_populates="usuario")

class Estudiante(Base):
    __tablename__ = 'estudiantes'
    
    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), unique=True, index=True, nullable=False)
    nombre_completo = Column(String(200), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    curso = Column(String(50))
    diagnostico_pie = Column(String(200))
    institucion_id = Column(Integer, ForeignKey("instituciones.id"), nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    
    institucion = relationship("Institucion", back_populates="estudiantes")
    expedientes = relationship("Expediente", back_populates="estudiante", cascade="all, delete-orphan")

class Expediente(Base):
    __tablename__ = 'expedientes'
    
    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"))
    estado = Column(String(50), default="Abierto")
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    
    estudiante = relationship("Estudiante", back_populates="expedientes")
    documentos = relationship("Documento", back_populates="expediente", cascade="all, delete-orphan")
    pacis = relationship("Paci", back_populates="expediente", cascade="all, delete-orphan")
    comentarios = relationship("ComentarioExpediente", back_populates="expediente", cascade="all, delete-orphan")

class Documento(Base):
    __tablename__ = 'documentos'
    
    id = Column(Integer, primary_key=True, index=True)
    expediente_id = Column(Integer, ForeignKey("expedientes.id"))
    subido_por = Column(Integer, ForeignKey("usuarios.id"))
    nombre_archivo = Column(String(255), nullable=False)
    ruta_almacenamiento = Column(String(500), nullable=False)
    tipo_mime = Column(String(100))
    categoria = Column(String(100), default="Sin clasificar")
    procesado_ocr = Column(Boolean, default=False)
    fecha_subida = Column(DateTime(timezone=True), server_default=func.now())
    
    expediente = relationship("Expediente", back_populates="documentos")
    subidor = relationship("Usuario", back_populates="documentos_subidos")
    evidencias = relationship("Evidencia", back_populates="documento", cascade="all, delete-orphan")

class Evidencia(Base):
    __tablename__ = 'evidencias'
    
    id = Column(Integer, primary_key=True, index=True)
    documento_id = Column(Integer, ForeignKey("documentos.id"))
    pagina = Column(Integer)
    hallazgo = Column(Text, nullable=False)
    implicacion_educativa = Column(Text)
    seccion_paci_sugerida = Column(String(100))
    
    documento = relationship("Documento", back_populates="evidencias")

class ComentarioExpediente(Base):
    __tablename__ = 'comentarios_expediente'
    
    id = Column(Integer, primary_key=True, index=True)
    expediente_id = Column(Integer, ForeignKey("expedientes.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    mensaje = Column(Text, nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    
    expediente = relationship("Expediente", back_populates="comentarios")
    usuario = relationship("Usuario")

class Paci(Base):
    __tablename__ = 'pacis'
    
    id = Column(Integer, primary_key=True, index=True)
    expediente_id = Column(Integer, ForeignKey("expedientes.id"))
    creado_por = Column(Integer, ForeignKey("usuarios.id"))
    estado_global = Column(String(50), default="Borrador")
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    
    expediente = relationship("Expediente", back_populates="pacis")
    creador = relationship("Usuario", back_populates="pacis_creados")
    modulos = relationship("ModuloPaci", back_populates="paci", cascade="all, delete-orphan")

class ModuloPaci(Base):
    __tablename__ = 'modulos_paci'
    
    id = Column(Integer, primary_key=True, index=True)
    paci_id = Column(Integer, ForeignKey("pacis.id"))
    tipo_modulo = Column(String(100), nullable=False)
    responsable_id = Column(Integer, ForeignKey("usuarios.id"))
    contenido_propuesto = Column(Text)
    contenido_validado = Column(Text)
    estado_revision = Column(String(50), default="Sin información")
    
    paci = relationship("Paci", back_populates="modulos")
    responsable = relationship("Usuario", back_populates="modulos_asignados")
    historial = relationship("HistorialRevision", back_populates="modulo", cascade="all, delete-orphan")

class HistorialRevision(Base):
    __tablename__ = 'historial_revisiones'
    
    id = Column(Integer, primary_key=True, index=True)
    modulo_id = Column(Integer, ForeignKey("modulos_paci.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    accion = Column(String(50), nullable=False)
    observaciones = Column(Text)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    
    modulo = relationship("ModuloPaci", back_populates="historial")
    usuario = relationship("Usuario", back_populates="revisiones_realizadas")

class Evento(Base):
    __tablename__ = 'eventos'
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False)
    fecha_fin = Column(DateTime(timezone=True), nullable=False)
    tipo = Column(String(50), nullable=False)
    creado_por = Column(Integer, ForeignKey("usuarios.id"))
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"), nullable=True)
    institucion_id = Column(Integer, ForeignKey("instituciones.id"), nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    
    creador = relationship("Usuario")
    estudiante = relationship("Estudiante")
    institucion = relationship("Institucion", back_populates="eventos")

class AjustesInstitucionales(Base):
    __tablename__ = 'ajustes_institucionales'
    
    id = Column(Integer, primary_key=True, index=True)
    institucion_id = Column(Integer, ForeignKey("instituciones.id"), nullable=True)
    nombre_colegio = Column(String(200), default="Escuela Base")
    rbd = Column(String(50), default="")
    logo_path = Column(String(500), nullable=True)
    director = Column(String(100), default="")
    prompt_ia = Column(Text, nullable=True)
    
    institucion = relationship("Institucion", back_populates="ajustes")
