"use client";

import { useState, useEffect } from "react";
import { Loader2, Zap, Clock, Users, AlertTriangle, FileWarning, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReportesAccionablesPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recordados, setRecordados] = useState<number[]>([]);

  const handleRecordar = (id: number) => {
    setRecordados(prev => [...prev, id]);
    setTimeout(() => {
      setRecordados(prev => prev.filter(r => r !== id));
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("pacia_token");
        const res = await fetch("http://localhost:8000/api/reportes/kpis", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin mb-4 text-pacia-cyan" />
        <p>Procesando métricas de impacto...</p>
      </div>
    );
  }

  if (!data) return null;

  const { impacto, cuellos_botella } = data;

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-deep font-[DIN Alternate]">Reportes de Impacto</h1>
        <p className="text-foreground-muted mt-1">Mide el tiempo ahorrado y elimina los bloqueos en tu equipo.</p>
      </div>

      {/* Tarjetas de Impacto PACIA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-pacia-cyan to-pacia-indigo"></div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pacia-cyan/10 to-pacia-indigo/10 text-pacia-indigo flex items-center justify-center shrink-0 border border-pacia-cyan/20">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Horas Ahorradas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-brand-deep">{impacto.horas_ahorradas}</span>
              <span className="text-sm font-bold text-slate-500">hrs</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Gracias a PACIA AI</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tiempo Promedio Construcción</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-brand-deep">{impacto.tiempo_promedio}</span>
            </div>
            <p className="text-xs text-green-500 font-bold mt-1">↓ Reducción del 95%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Participación Interdisciplinaria</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-brand-deep">{impacto.participacion}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">De los PACIs tienen aportes de {">"}1 profesional.</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-brand-deep font-[DIN Alternate] pt-4">Cuellos de Botella y Alertas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        
        {/* Profesores Pendientes */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-brand-deep">Validaciones Pendientes</h3>
              <p className="text-xs text-slate-500">Profesores que están retrasando la oficialización.</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {cuellos_botella.profesores_pendientes.map((prof: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors">
                <div>
                  <p className="font-bold text-brand-deep">{prof.nombre}</p>
                  <p className="text-xs text-slate-500">PACI de {prof.estudiante}</p>
                </div>
                <button 
                  onClick={() => handleRecordar(i)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    recordados.includes(i) ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  {recordados.includes(i) ? (
                    <>✓ Enviado</>
                  ) : (
                    <><Bell size={14} /> Recordar</>
                  )}
                </button>
              </div>
            ))}
            {cuellos_botella.profesores_pendientes.length === 0 && (
              <div className="text-center py-10 text-slate-400">No hay validaciones pendientes.</div>
            )}
          </div>
        </div>

        {/* Informes Faltantes */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <FileWarning size={20} />
            </div>
            <div>
              <h3 className="font-bold text-brand-deep">Evidencias Faltantes</h3>
              <p className="text-xs text-slate-500">Expedientes bloqueados por falta de documentos clave.</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {cuellos_botella.informes_faltantes.map((info: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100 hover:border-red-200 transition-colors">
                <div>
                  <p className="font-bold text-brand-deep">{info.estudiante}</p>
                  <p className="text-xs text-red-500 font-bold mt-1 uppercase tracking-wider">Falta: {info.faltante}</p>
                </div>
                <Link href={`/expedientes/${info.expediente_id}`} className="w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
            {cuellos_botella.informes_faltantes.length === 0 && (
              <div className="text-center py-10 text-slate-400">Todos los expedientes están al día.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
