"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserCircle2, BrainCircuit, Activity, FileText, CheckCircle2, ChevronRight, PenTool, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";

export default function ExpedienteVivo() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isProfesor = user?.rol === "Profesor Aula";
  
  const [expediente, setExpediente] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para Comentarios
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchComentarios = async () => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/expedientes/${id}/comentarios`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setComentarios(await res.json());
      }
    } catch (e) {
      console.error("Error cargando comentarios", e);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, [id]);

  const handlePostComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    setIsPosting(true);
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/expedientes/${id}/comentarios`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mensaje: nuevoComentario })
      });
      if (res.ok) {
        setNuevoComentario("");
        fetchComentarios();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const handleGenerarPaci = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("pacia_token");
      // 1. Generar con IA
      const resGen = await fetch("http://localhost:8000/api/paci/generate", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ estudiante_id: parseInt(id as string) || 1 }) // fallback a 1
      });
      if (!resGen.ok) throw new Error("Error generando PACI");
      const dataGen = await resGen.json();
      
      // 2. Guardar en BD
      const resSave = await fetch("http://localhost:8000/api/paci/save", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ estudiante_id: parseInt(id as string) || 1, paci_data: dataGen.data })
      });
      if (!resSave.ok) throw new Error("Error guardando PACI");
      const dataSave = await resSave.json();
      
      // 3. Navegar a Revisiones
      router.push(`/revisiones/${dataSave.paci_id}`);
    } catch (e) {
      console.error(e);
      alert("Error al intentar generar el PACI. Revisa los logs.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteExpediente = async () => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/estudiantes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Error al eliminar expediente");
      
      router.push("/estudiantes");
    } catch (err) {
      console.error(err);
      alert("Hubo un problema intentando eliminar el expediente.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("pacia_token");
      // Importante: Asumimos que id (del URL param) corresponde al ID del expediente (por la estructura 1:1)
      const response = await fetch(`http://localhost:8000/api/expedientes/${id}/documentos`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir el documento");
      }

      const data = await response.json();
      // Añadir el nuevo documento a la lista local para feedback visual inmediato
      setUploadedDocs(prev => [...prev, data]);
      alert("Evidencia aportada exitosamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo subir la evidencia.");
    } finally {
      setIsUploading(false);
      // Resetear el input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // MOCK DATA PARA PROTOTIPO (Reemplazando fetch real por ahora para impacto visual)
  useEffect(() => {
    setTimeout(() => {
      setExpediente({
        estudiante: {
          nombre_completo: "Benjamín Rojas Morales",
          rut: "22.345.678-9",
          curso: "5to Básico A",
          diagnostico: "Trastorno del Espectro Autista (TEA)",
          fotografia: null,
          fortalezas: ["Excelente memoria visual", "Interés profundo en ciencias", "Sigue rutinas establecidas"],
          necesidades: ["Apoyo en decodificación lectora", "Tiempos adicionales en evaluación", "Anticipación de cambios"]
        },
        estado: "PACI en elaboración",
        equipo: [
          { rol: "Docente", nombre: "Catalina P." },
          { rol: "Ed. Diferencial", nombre: "María José V." },
          { rol: "Psicólogo", nombre: "Diego S." }
        ]
      });
      setIsLoading(false);
    }, 600);
  }, [id]);

  if (isLoading) return <div className="p-10 text-center animate-pulse text-pacia-cyan font-bold font-[DIN Alternate]">Cargando Expediente Vivo...</div>;

  return (
    <div className="w-full h-full flex flex-col max-w-[1200px] mx-auto">
      {/* HEADER DEL ESTUDIANTE */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pacia-cyan/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md text-slate-300 shrink-0 relative z-10">
          <UserCircle2 size={48} />
        </div>
        
        <div className="flex-1 relative z-10 w-full">
          <div className="flex justify-between items-center mb-3">
            <Link href="/estudiantes" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md border border-slate-100">
              <ArrowLeft size={20} /> Volver a Estudiantes
            </Link>
            <button 
              onClick={handleDeleteClick}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-100"
            >
              <Trash2 size={14} /> Eliminar Expediente
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 font-[DIN Alternate] leading-normal">{expediente.estudiante.nombre_completo}</h1>
          
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
              {expediente.estudiante.curso}
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <BrainCircuit size={14} /> {expediente.estudiante.diagnostico}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2">Equipo Profesional:</p>
            {expediente.equipo.map((eq: any, i: number) => (
              <span key={i} className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                {eq.nombre} <span className="opacity-50">({eq.rol})</span>
              </span>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50">
              <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} /> Fortalezas Clave
              </h4>
              <ul className="text-sm text-emerald-800 space-y-1 ml-1">
                {expediente.estudiante.fortalezas.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50">
              <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Activity size={16} /> Barreras / Necesidades
              </h4>
              <ul className="text-sm text-amber-800 space-y-1 ml-1">
                {expediente.estudiante.necesidades.map((n: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span> {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LINEA DE TIEMPO (EXPEDIENTE VIVO) */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 font-[DIN Alternate] mb-4">Línea de Tiempo</h3>
          
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-10">
            <TimelineItem 
              status="completed"
              icon={<UserCircle2 size={16} />}
              color="bg-slate-300"
              title="Ingreso PIE"
              date="12 Marzo 2026"
              desc="Derivación inicial por profesor jefe."
            />
            <TimelineItem 
              status="completed"
              icon={<Activity size={16} />}
              color="bg-indigo-400"
              title="Evaluación Diagnóstica"
              date="20 Marzo 2026"
              desc="Evaluación integral completa."
            />
            <TimelineItem 
              status="completed"
              icon={<FileText size={16} />}
              color="bg-purple-500"
              title="Informes Profesionales"
              date="15 Abril 2026"
              desc="2 informes adjuntos (Psicológico y Psicopedagógico)."
            />
            <TimelineItem 
              status="current"
              icon={<PenTool size={16} />}
              color="bg-pacia-cyan"
              title="Construcción PACI"
              date="Actualmente"
              desc="Elaboración colaborativa del Plan de Adecuación Curricular."
            />
            <TimelineItem 
              status="pending"
              icon={<CheckCircle2 size={16} />}
              color="bg-slate-200 text-slate-400"
              title="Validación y Seguimiento"
              date="Pendiente"
              desc="Aprobación UTP y aplicación de adecuaciones en el aula."
            />
          </div>

          {/* CENTRO DE COORDINACIÓN INTERDISCIPLINARIA */}
          <div className="mt-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-800 font-[DIN Alternate]">Centro de Coordinación Interdisciplinaria</h3>
              <span className="bg-pacia-cyan/10 text-pacia-indigo text-[10px] font-bold px-2 py-1 rounded border border-pacia-cyan/20 flex items-center gap-1">
                <BrainCircuit size={12} /> IA PACIA Activa
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Muro colaborativo para acuerdos y trazabilidad del caso.</p>
            
            {/* Resumen IA */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-pacia-cyan"></div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                Resumen de Acuerdos (IA)
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                El equipo ha acordado priorizar los objetivos de decodificación lectora antes de aplicar las adecuaciones matemáticas. Falta que el Psicólogo confirme la fecha de re-evaluación socioemocional.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><FileText size={12}/> Basado en: Informe Psicológico y Eval. Psicopedagógica</span>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><UserCircle2 size={12}/> Profesionales: Diego S., María José V.</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Nivel de confianza IA: Alto (Sin contradicciones)</span>
              </div>
            </div>
            
            {/* Lista de comentarios */}
            <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {comentarios.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm font-semibold">Aún no hay mensajes en este expediente.</p>
                  <p className="text-xs mt-1">Sé el primero en iniciar la coordinación del equipo.</p>
                </div>
              ) : (
                comentarios.map((c, i) => (
                  <div key={i} className="flex gap-4 animate-fade-in-up">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden shadow-sm border border-white">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${c.usuario.nombre}`} alt="avatar" />
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-sm border border-slate-100">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="font-bold text-sm text-slate-800">{c.usuario.nombre} <span className="text-xs font-semibold text-pacia-indigo ml-1">({c.usuario.rol})</span></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(c.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short'})}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{c.mensaje}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input para nuevo comentario */}
            <form onSubmit={handlePostComentario} className="flex gap-3 relative">
              <input 
                type="text" 
                value={nuevoComentario}
                onChange={e => setNuevoComentario(e.target.value)}
                placeholder="Escribe un acuerdo, observación o pregunta al equipo..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan transition-all"
              />
              <button disabled={isPosting || !nuevoComentario.trim()} type="submit" className="bg-pacia-indigo text-white px-8 font-bold rounded-xl hover:bg-pacia-indigo/90 transition-all shadow-lg shadow-pacia-indigo/20 disabled:opacity-50">
                {isPosting ? 'Enviando...' : 'Publicar'}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: ACCIONES Y DOCUMENTOS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-pacia-cyan/10 to-transparent p-6 rounded-3xl border border-pacia-cyan/20">
            <h3 className="text-sm font-bold text-pacia-indigo uppercase tracking-wider mb-2">Siguiente Paso</h3>
            <p className="text-sm text-slate-600 mb-6">El equipo ha subido suficientes evidencias. PACIA puede ayudarte a estructurar una propuesta inicial.</p>
            
            <button 
              onClick={handleGenerarPaci}
              disabled={isGenerating}
              className="w-full bg-role-docente text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-role-docente/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <><Loader2 size={18} className="animate-spin" /> Estructurando propuesta...</>
              ) : (
                <>Estructurar propuesta PACI <ChevronRight size={18} /></>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500 font-semibold mt-3">Basado en evidencias. El equipo tiene la decisión final.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Evidencias del Equipo</h3>
              <button className="text-xs text-pacia-cyan font-bold hover:underline">Ver todas</button>
            </div>
            
            <div className="space-y-3">
              <DocItem name="Informe_Psicologico.pdf" author="Diego S." date="14 Abr" />
              <DocItem name="Eval_Psicopedagogica.pdf" author="María José V." date="10 Abr" />
              {uploadedDocs.map(doc => (
                <DocItem key={doc.id} name={doc.nombre_archivo} author="Tú" date="Hoy" />
              ))}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.docx"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-400 hover:border-pacia-cyan hover:text-pacia-cyan hover:bg-pacia-cyan/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <><Loader2 size={16} className="animate-spin" /> Subiendo...</>
              ) : (
                "+ Aportar Evidencia"
              )}
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteExpediente}
        title="¡ADVERTENCIA DE SEGURIDAD MÁXIMA!"
        message="Estás a punto de ELIMINAR COMPLETAMENTE EL EXPEDIENTE de este estudiante. Se borrará al estudiante de la base de datos, TODOS sus documentos y TODOS sus PACIs. ¡ESTO NO SE PUEDE DESHACER!"
      />
    </div>
  );
}

function TimelineItem({ status, icon, color, title, date, desc }: any) {
  const isCurrent = status === "current";
  const isPending = status === "pending";
  
  return (
    <div className={`relative pl-8 ${isPending ? 'opacity-50 grayscale' : ''}`}>
      <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white transition-all duration-500 ${isCurrent ? 'bg-pacia-cyan shadow-lg shadow-pacia-cyan/40 scale-125' : color}`}>
        {icon}
      </div>
      <div className={`transition-all duration-500 ${isCurrent ? 'translate-x-2' : ''}`}>
        <div className="flex items-center justify-between">
          <h4 className={`text-lg font-bold ${isCurrent ? 'text-pacia-cyan' : 'text-slate-700'}`}>{title}</h4>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">{date}</span>
        </div>
        <p className={`text-sm mt-1 ${isCurrent ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>{desc}</p>
      </div>
    </div>
  );
}

function DocItem({ name, author, date }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
        <FileText size={16} />
      </div>
      <div className="overflow-hidden flex-1">
        <p className="text-xs font-bold text-slate-700 truncate" title={name}>{name}</p>
        <p className="text-[10px] text-slate-400 truncate mt-0.5" title={author}>{author}</p>
      </div>
      <span className="text-[10px] font-bold text-slate-300">{date}</span>
    </div>
  );
}
