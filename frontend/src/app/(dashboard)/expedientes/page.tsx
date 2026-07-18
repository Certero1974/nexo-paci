"use client";

import { useState, useEffect } from "react";
import { FolderOpen, Search, Clock, FileText, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        const token = localStorage.getItem("pacia_token");
        const res = await fetch("http://localhost:8000/api/expedientes", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setExpedientes(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpedientes();
  }, []);

  const filteredExpedientes = expedientes.filter(exp => {
    if (!searchTerm.trim()) return true;
    
    const nombre = (exp.estudiante?.nombre_completo || "").toLowerCase();
    const rut = (exp.estudiante?.rut || "").toLowerCase();
    
    const term = searchTerm.toLowerCase().trim();
    const termClean = term.replace(/[^a-z0-9k]/g, '');
    const rutClean = rut.replace(/[^a-z0-9k]/g, '');
    
    if (termClean && rutClean.includes(termClean)) return true;
    if (term && nombre.includes(term)) return true;
    
    return false;
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-deep font-[DIN Alternate]">Expedientes Digitales</h1>
        <p className="text-foreground-muted mt-1">Carpetas virtuales y documentación oficial de los alumnos PIE.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar carpeta por nombre o RUT..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan transition-all"
          />
        </div>
      </div>

      {/* Grid de Carpetas */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4 text-pacia-cyan" />
          <p>Cargando expedientes...</p>
        </div>
      ) : expedientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-pacia-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6 text-pacia-cyan">
            <FolderOpen size={40} />
          </div>
          <h3 className="text-xl font-bold text-brand-deep mb-3">La colaboración comienza aquí</h3>
          <p className="text-slate-500 mb-6 leading-relaxed">
            PACIA se encarga de estructurar automáticamente el expediente de cada estudiante que registres, 
            para que tú y tu equipo solo se preocupen de lo importante: apoyarlos.
          </p>
          <Link href="/estudiantes" className="inline-flex items-center gap-2 px-6 py-3 pacia-gradient-bg text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-pacia-cyan/20">
            Ir al Directorio de Estudiantes
          </Link>
        </div>
      ) : filteredExpedientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto">
          <Search size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-brand-deep mb-2">No encontramos evidencias</h3>
          <p className="text-slate-500">
            No hay ningún expediente que coincida con "{searchTerm}". Revisa el nombre o RUT e inténtalo nuevamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExpedientes.map((exp: any) => (
            <Link 
              key={exp.id} 
              href={`/expedientes/${exp.id}`}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-pacia-cyan/30 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-pacia-indigo/10 flex items-center justify-center text-pacia-indigo group-hover:scale-110 transition-transform">
                  <FolderOpen size={24} />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                  {exp.estado}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-brand-deep mb-1 line-clamp-1">
                {exp.estudiante.nombre_completo}
              </h3>
              <p className="text-sm text-slate-500 mb-4 font-mono">RUT: {exp.estudiante.rut}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Actualizado hoy</span>
                </div>
                <div className="text-pacia-cyan font-medium flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Abrir <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
