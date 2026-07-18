"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Download, CheckCircle2, Pencil, Save, X, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RevisionDetallePage() {
  const { id } = useParams();
  const [paci, setPaci] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editingModId, setEditingModId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const { user } = useAuth();
  const isProfesor = user?.rol === "Profesor Aula";
  const [profesores, setProfesores] = useState<any[]>([]);
  const [coherenceAlerts, setCoherenceAlerts] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchProfesores = async () => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/configuracion/usuarios`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const users = await res.json();
        // Mostrar profesores o docentes (por si crearon uno antes de la actualización)
        setProfesores(users.filter((u: any) => u.rol === "Profesor Aula" || u.rol === "Docente"));
      }
    } catch (e) {
      console.error("Error al cargar profesores", e);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/paci/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPaci(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    if (user && user.rol !== "Profesor Aula") {
      fetchProfesores();
    }
  }, [id, user]);

  const handleValidar = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/paci/${id}/estado`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nuevo_estado: "Validado" })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) { console.error(err); } finally { setIsUpdating(false); }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/paci/${id}/pdf`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Error en PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PACI_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const startEditing = (mod: any) => {
    try {
      setEditingModId(mod.id);
      let content = mod.contenido_validado || "";
      // Si por alguna razón es JSON antiguo de versiones previas, tratar de limpiarlo
      if (mod.tipo_modulo === "Propuestas Educativas" && typeof content === "string" && content.startsWith("[")) {
        try {
           content = JSON.stringify(JSON.parse(content), null, 2);
        } catch (e) {}
      }
      setEditContent(String(content));
    } catch (err) {
      console.error(err);
      alert("Error interno al abrir editor: " + err);
    }
  };

  const handleSaveMod = async (modId: number) => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/paci/modulo/${modId}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ contenido: editContent })
      });
      
      if (res.ok) {
        setEditingModId(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Error del servidor al guardar: ${JSON.stringify(errorData)}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión al guardar el módulo");
    }
  };

  const handleAssignMod = async (modId: number, responsableId: string) => {
    try {
      if (!responsableId) return;
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/paci/modulo/${modId}/asignar`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ responsable_id: parseInt(responsableId) })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Error al asignar el módulo");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    }
  };

  const handleAssignAll = async (responsableId: string) => {
    try {
      if (!responsableId) return;
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/paci/${id}/asignar_masivo`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ responsable_id: parseInt(responsableId) })
      });
      if (res.ok) {
        fetchData();
        alert("¡Todos los módulos han sido asignados correctamente!");
      } else {
        alert("Error al asignar masivamente.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    }
  };

  const handleAnalyzeCoherence = async () => {
    setIsAnalyzing(true);
    setCoherenceAlerts([]);
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/paci/${id}/analyze`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setCoherenceAlerts(json.data || []);
        if (json.data?.length === 0) {
           alert("✅ ¡Excelente! La IA no detectó ninguna incoherencia en este PACI.");
        }
      }
    } catch(e) {
      console.error(e);
      alert("Error al analizar coherencia con IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatContent = (mod: any) => {
    if (mod.tipo_modulo === "Propuestas Educativas" && mod.contenido_validado.startsWith("[")) {
      try {
        const arr = JSON.parse(mod.contenido_validado);
        return arr.map((a: any, i: number) => (
          <div key={i} className="mb-4">
            <p className="font-bold">{a.titulo}</p>
            <p>{a.justificacion}</p>
          </div>
        ));
      } catch(e) {}
    }
    return mod.contenido_validado;
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-pacia-cyan" size={32} /></div>;
  if (!paci) return <div>No encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/revisiones" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:text-brand-deep">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">Revisión PACI #{paci.id}</h1>
          <p className="text-sm text-slate-500">Fecha: {new Date(paci.fecha_creacion).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button 
             onClick={handleAnalyzeCoherence} 
             disabled={isAnalyzing} 
             className="flex items-center gap-2 bg-pacia-cyan text-[#0D1B3D] px-5 py-2 rounded-xl font-bold hover:bg-[#00D1E0] transition-colors shadow-lg shadow-pacia-cyan/20"
          >
             {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} 
             Ojo Clínico IA
          </button>
          <span className={`px-4 py-2 rounded-xl text-sm font-bold ${paci.estado_global === 'Validado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            Estado: {paci.estado_global}
          </span>
          <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-700 transition-colors">
            {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} Exportar PDF Oficial
          </button>
        </div>
      </div>

      {user?.rol !== "Profesor Aula" && (
        <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-pacia-indigo">Asignación Rápida</h3>
            <p className="text-sm text-indigo-700/70">Asigna el PACI completo a un solo profesor para un visto bueno general.</p>
          </div>
          <select 
            onChange={(e) => handleAssignAll(e.target.value)}
            className="px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm text-slate-700 font-bold focus:outline-none focus:border-pacia-indigo"
          >
            <option value="">Seleccionar profesor...</option>
            {profesores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-6">
        {paci.modulos.map((mod: any) => {
          const cleanModName = mod.tipo_modulo.toLowerCase().replace(/^\d+\.\s*/, '');
          const modAlerts = coherenceAlerts.filter(a => 
             a.modulo.toLowerCase().includes(cleanModName) || cleanModName.includes(a.modulo.toLowerCase().replace(/^\d+\.\s*/, ''))
          );
          const hasCritica = modAlerts.some(a => a.tipo === "Crítica");
          const hasSugerencia = modAlerts.some(a => a.tipo === "Sugerencia");
          
          return (
          <div key={mod.id} className={`bg-white rounded-3xl p-8 shadow-sm border ${hasCritica ? 'border-red-500 shadow-red-500/10 shadow-md' : hasSugerencia ? 'border-amber-400' : 'border-slate-100'} relative group`}>
            
            {/* Alertas de IA */}
            {modAlerts.length > 0 && (
               <div className="mb-6 flex flex-col gap-3">
                  {modAlerts.map((al, idx) => (
                     <div key={idx} className={`p-4 rounded-xl text-sm flex flex-col gap-2 ${al.tipo === 'Crítica' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                        <div className="flex items-start gap-3">
                           <AlertCircle size={20} className="shrink-0 mt-0.5" />
                           <div>
                              <strong className="block mb-1 text-base">{al.tipo} detectada por la IA:</strong>
                              {al.mensaje}
                           </div>
                        </div>
                        {al.propuesta_correccion && (
                           <div className="mt-2 ml-8 p-3 bg-white/60 border border-black/10 rounded-lg text-xs">
                              <strong className="block mb-1 text-pacia-indigo">Sugerencia de redacción:</strong>
                              <span className="italic">"{al.propuesta_correccion}"</span>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            )}
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-deep flex items-center gap-2">
                {mod.tipo_modulo}
                {hasCritica && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
              </h2>
              <div className="flex items-center gap-4">
                {/* Botón de Edición */}
                {editingModId !== mod.id && (user?.rol !== "Profesor Aula" || mod.responsable_id === user?.id) && (
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); startEditing(mod); }} 
                    className="px-4 py-2 bg-indigo-100 text-pacia-indigo font-bold hover:bg-indigo-200 transition-colors rounded-xl flex items-center gap-2"
                  >
                    <Pencil size={18} /> EDITAR TEXTO
                  </button>
                )}
              </div>
            </div>
            
            {editingModId === mod.id ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[200px] p-4 bg-white border-2 border-pacia-indigo rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 font-mono text-sm resize-y"
                />
                <div className="flex justify-between items-center mt-4">
                  <div>
                    {/* Selector de Asignación Individual (Oculto en vista normal) */}
                    {user?.rol !== "Profesor Aula" && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Responsable Específico:</span>
                        <select 
                          value={mod.responsable_id || ""} 
                          onChange={(e) => handleAssignMod(mod.id, e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-pacia-indigo"
                        >
                          <option value="">(Sin asignar)</option>
                          {profesores.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditingModId(null)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg flex items-center gap-2">
                      <X size={16} /> Cancelar
                    </button>
                    <button onClick={() => handleSaveMod(mod.id)} className="px-4 py-2 bg-pacia-indigo text-white font-bold hover:bg-indigo-600 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/30">
                      <Save size={16} /> Guardar Cambios
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl whitespace-pre-wrap text-sm text-slate-700 border border-slate-100 group-hover:border-slate-200 transition-colors">
                {formatContent(mod)}
              </div>
            )}
          </div>
        )})}
      </div>
      
      {!(paci.estado_global === 'Validado' || paci.estado_global === 'Oficial') && !isProfesor && (
        <div className="mt-8 flex justify-end">
          <button onClick={handleValidar} disabled={isUpdating} className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">
            {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} Aprobar PACI Definitivo
          </button>
        </div>
      )}
    </div>
  );
}
