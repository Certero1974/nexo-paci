"use client";

import { useState, useEffect } from "react";
import { Rocket, ChevronDown, CheckCircle2, File as FileIcon, AlertCircle } from "lucide-react";

export default function PaciGenerator() {
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [selectedEstudianteId, setSelectedEstudianteId] = useState<number | null>(null);
  const [documentosCount, setDocumentosCount] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropuestaIndex, setSelectedPropuestaIndex] = useState<number>(0);

  // Cargar estudiantes al montar
  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const token = localStorage.getItem("pacia_token");
        const res = await fetch("http://localhost:8000/api/estudiantes", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEstudiantes(data);
          if (data.length > 0) {
            setSelectedEstudianteId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error cargando estudiantes", err);
      }
    };
    fetchEstudiantes();
  }, []);

  // Cargar info del expediente cuando cambia el estudiante
  useEffect(() => {
    if (!selectedEstudianteId) return;
    const fetchExpedienteDocs = async () => {
      try {
        const token = localStorage.getItem("pacia_token");
        
        // 1. Obtener expediente id
        const resExp = await fetch(`http://localhost:8000/api/expedientes/estudiante/${selectedEstudianteId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resExp.ok) {
          const exp = await resExp.json();
          // 2. Obtener cantidad de documentos
          const resDocs = await fetch(`http://localhost:8000/api/expedientes/${exp.id}/documentos`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (resDocs.ok) {
            const docs = await resDocs.json();
            setDocumentosCount(docs.length);
          }
        } else {
          setDocumentosCount(0);
        }
      } catch (err) {
        setDocumentosCount(0);
      }
    };
    fetchExpedienteDocs();
  }, [selectedEstudianteId]);



  const handleGenerate = async () => {
    if (!selectedEstudianteId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("pacia_token");
      const response = await fetch("http://localhost:8000/api/paci/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estudiante_id: selectedEstudianteId })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Error en la conexión con el Motor PACI");
      }
      
      const data = await response.json();
      setResult(data.data);
      setSelectedPropuestaIndex(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedEstudianteId || !result) return;
    setIsSaving(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("pacia_token");
      
      // Preparar payload con la propuesta seleccionada
      const payloadData = { ...result };
      if (result.propuestas && result.propuestas.length > 0) {
        const selected = result.propuestas[selectedPropuestaIndex];
        payloadData.herramientas_metodologicas = `${selected.titulo}: ${selected.justificacion}`;
      }
      
      const response = await fetch("http://localhost:8000/api/paci/save", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          estudiante_id: selectedEstudianteId,
          paci_data: payloadData
        })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Error al guardar el PACI en la base de datos.");
      }
      
      setIsSaved(true);
      
      setTimeout(() => {
        setIsSaved(false);
        setResult(null);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-nexo p-6 lg:col-span-7 pacia-glow relative overflow-hidden group flex flex-col justify-between">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-pacia-cyan/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pacia-cyan/20 transition-all"></div>
      
      {!result ? (
        <>
          <div className="space-y-4 relative z-10 mb-6">
            <label className="text-sm font-semibold text-foreground">Estudiante</label>
            <div className="relative">
              <select 
                value={selectedEstudianteId || ""}
                onChange={(e) => setSelectedEstudianteId(Number(e.target.value))}
                className="w-full appearance-none bg-background border border-border text-foreground py-3 pl-4 pr-10 rounded-[12px] focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan transition-colors" 
                disabled={isLoading}
              >
                {estudiantes.length === 0 && <option value="">Sin estudiantes registrados</option>}
                {estudiantes.map(est => (
                  <option key={est.id} value={est.id}>
                    {est.nombre_completo} ({est.diagnostico_pie || "Sin Diagnóstico"})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" size={18} />
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#0D1B3D] flex items-center gap-2">
                  <FileIcon size={16} /> Documentos en Expediente ({documentosCount})
                </span>
              </div>
              
              {documentosCount === 0 ? (
                <p className="text-xs text-slate-500 flex items-start gap-1">
                  <AlertCircle size={14} className="shrink-0 mt-0.5 text-orange-400" />
                  Este estudiante no tiene informes guardados. La IA usará un perfil de prueba genérico. Usa el menú "Ver Expediente" para subir PDFs reales.
                </p>
              ) : (
                <p className="text-xs text-slate-600 flex items-start gap-1">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-green-500" />
                  La Inteligencia Artificial extraerá el contexto cruzado de los {documentosCount} informes de este estudiante.
                </p>
              )}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading || estudiantes.length === 0}
            className={`w-full pacia-gradient-bg text-white rounded-[12px] py-4 px-4 font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] mb-2 shadow-lg shadow-pacia-indigo/30 font-[DIN Alternate] tracking-wide text-lg relative z-10 ${isLoading || estudiantes.length === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="animate-pulse">LEYENDO DOCUMENTOS Y RAZONANDO...</span>
            ) : (
              <>
                <Rocket size={20} />
                GENERAR PACI EN 1 CLIC
              </>
            )}
          </button>
          
          <div className="text-center relative z-10">
            <p className="text-xs text-foreground-muted">
              Consolidar información y generar informe PACI rápidamente con Inteligencia Artificial.
            </p>
            {error && <p className="text-xs text-red-500 pt-2 font-semibold">{error}</p>}
          </div>
        </>
      ) : (
        <div className="relative z-10 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-100 p-5 mt-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-pacia-cyan font-bold">
              <CheckCircle2 size={24} /> 
              <span className="font-[DIN Alternate] text-xl text-[#0D1B3D]">PROPUESTA PACI GENERADA</span>
            </div>
            <button 
              onClick={() => setResult(null)}
              className="text-xs font-semibold text-slate-400 hover:text-pacia-indigo transition-colors flex items-center gap-1"
            >
              Cerrar
            </button>
          </div>

          <div className="overflow-y-auto max-h-[350px] pr-2 space-y-5 custom-scrollbar">
            
            {/* Perfil Funcional */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Perfil Funcional</h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {result.perfil_funcional}
              </p>
            </div>

            {/* Fortalezas y Barreras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fortalezas</h4>
                <ul className="space-y-2">
                  {result.fortalezas?.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Barreras</h4>
                <ul className="space-y-2">
                  {result.barreras?.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Propuestas Educativas */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Propuestas de Adecuación (Selecciona una)</h4>
              <div className="space-y-3">
                {result.propuestas?.map((p: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedPropuestaIndex(i)}
                    className={`bg-white border rounded-lg p-3 shadow-sm transition-all cursor-pointer relative overflow-hidden ${
                      selectedPropuestaIndex === i 
                        ? 'border-pacia-cyan ring-1 ring-pacia-cyan bg-pacia-cyan/5' 
                        : 'border-slate-200 hover:border-pacia-cyan/30'
                    }`}
                  >
                    {selectedPropuestaIndex === i && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-pacia-cyan rounded-bl-xl flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-1 pr-6">
                      <h5 className="font-semibold text-[#0D1B3D] text-sm">{p.titulo}</h5>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        p.nivel_confianza === 'Alto' ? 'bg-green-100 text-green-700' :
                        p.nivel_confianza === 'Medio' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Confianza {p.nivel_confianza}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pr-2">{p.justificacion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className={`w-full mt-4 text-white font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2
              ${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0D1B3D] hover:bg-[#1E3A8A]'}
              ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {isSaving ? (
              <span className="animate-pulse">Guardando en Base de Datos...</span>
            ) : isSaved ? (
              <>
                <CheckCircle2 size={18} />
                PACI Guardado Exitosamente
              </>
            ) : (
              "Validar y Guardar PACI"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
