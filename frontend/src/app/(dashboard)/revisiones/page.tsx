"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Clock, ArrowRight, Loader2, FileText, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";

export default function RevisionesPage() {
  const { user } = useAuth();
  const isProfesor = user?.rol === "Profesor Aula";
  
  const [pacis, setPacis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paciToDelete, setPaciToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchPacis = async () => {
      try {
        const token = localStorage.getItem("pacia_token");
        const res = await fetch("http://localhost:8000/api/paci", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filtramos para ocultar los PACIs Oficiales (esos van al Archivo Histórico)
          const pendientes = data.filter((p: any) => p.estado_global !== "Oficial");
          setPacis(pendientes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPacis();
  }, []);

  const handleDeleteClick = (id: number) => {
    setPaciToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeletePaci = async () => {
    if (paciToDelete === null) return;
    
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/paci/${paciToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Error al eliminar");
      }
      
      setPacis(pacis.filter((p: any) => p.id !== paciToDelete));
      setDeleteModalOpen(false);
      setPaciToDelete(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el PACI");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-deep font-[DIN Alternate]">Revisiones y Aprobaciones</h1>
        <p className="text-foreground-muted mt-1">Flujo de corresponsabilidad para validar los PACIs generados.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar PACI por nombre de estudiante..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4 text-pacia-cyan" />
          <p>Cargando lista de revisiones...</p>
        </div>
      ) : pacis.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <CheckSquare size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-brand-deep mb-2">No hay PACIs pendientes</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Ve al Escritorio (Inicio) para generar un nuevo PACI y enviarlo a revisión.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Estudiante</th>
                <th className="p-4">Diagnóstico</th>
                <th className="p-4">Fecha Creación</th>
                <th className="p-4">Estado Global</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacis.map((paci: any) => (
                <tr key={paci.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pacia-indigo/10 flex items-center justify-center text-pacia-indigo shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-brand-deep">{paci.expediente.estudiante.nombre_completo}</p>
                        <p className="text-xs text-slate-400 font-mono">{paci.expediente.estudiante.rut}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {paci.expediente.estudiante.diagnostico_pie || "Sin diagnóstico"}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(paci.fecha_creacion).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      paci.estado_global === 'Validado' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      paci.estado_global === 'Oficial' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {paci.estado_global}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <button 
                        onClick={() => handleDeleteClick(paci.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Eliminar Revisión"
                      >
                        <Trash2 size={16} />
                      </button>
                      <Link 
                        href={`/revisiones/${paci.id}`}
                        className="flex items-center gap-2 text-sm font-bold text-pacia-cyan hover:text-pacia-cyan/80 transition-colors"
                      >
                        Ver Revisión <ArrowRight size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setPaciToDelete(null); }}
        onConfirm={handleDeletePaci}
        title="¡ADVERTENCIA CRÍTICA!"
        message="Estás a punto de ELIMINAR esta Revisión/PACI. El trabajo realizado en este documento se perderá PARA SIEMPRE."
      />
    </div>
  );
}
