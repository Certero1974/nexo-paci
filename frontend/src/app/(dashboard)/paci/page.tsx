"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, FileSignature, Clock, Download, ArrowRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";

export default function PaciHistoricoPage() {
  const [pacisOficiales, setPacisOficiales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
          // Mostramos los PACIs que fueron validados u oficializados
          const oficiales = data.filter((p: any) => 
            p.estado_global === "Oficial" || p.estado_global === "Validado"
          );
          setPacisOficiales(oficiales);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPacis();
  }, []);

  const filteredPacis = pacisOficiales.filter(p => {
    if (!searchTerm.trim()) return true;
    
    const nombre = (p.expediente?.estudiante?.nombre_completo || "").toLowerCase();
    const rut = (p.expediente?.estudiante?.rut || "").toLowerCase();
    
    const term = searchTerm.toLowerCase().trim();
    const termClean = term.replace(/[^a-z0-9k]/g, '');
    const rutClean = rut.replace(/[^a-z0-9k]/g, '');
    
    if (termClean && rutClean.includes(termClean)) return true;
    if (term && nombre.includes(term)) return true;
    
    return false;
  });

  const handleDownloadPDF = async (paciId: number, rut: string) => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/paci/${paciId}/pdf`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Error generando PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PACI_Oficial_${rut}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el documento PDF.");
    }
  };

  const handleDeleteClick = (id: number) => {
    setPaciToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (paciToDelete === null) return;
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/paci/${paciToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPacisOficiales(prev => prev.filter(p => p.id !== paciToDelete));
        setDeleteModalOpen(false);
        setPaciToDelete(null);
      } else {
        alert("Error al eliminar el PACI");
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-deep font-[DIN Alternate]">Archivo PACI Oficial</h1>
        <p className="text-foreground-muted mt-1">Biblioteca histórica de todos los Planes de Adecuación Curricular aprobados en el establecimiento.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por RUT o nombre de estudiante..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-indigo focus:ring-1 focus:ring-pacia-indigo transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4 text-pacia-indigo" />
          <p>Cargando archivo histórico...</p>
        </div>
      ) : pacisOficiales.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <FileSignature size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-brand-deep mb-2">No hay PACIs Oficializados</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Los documentos aparecerán aquí una vez que hayan sido aprobados en el módulo de Revisiones.
          </p>
        </div>
      ) : filteredPacis.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <Search size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-brand-deep mb-2">No se encontraron resultados</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Ningún PACI coincide con la búsqueda "{searchTerm}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacis.map((paci: any) => (
            <div key={paci.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
              {/* Decorative side color */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <FileSignature size={24} />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                  Oficial
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-brand-deep leading-tight mb-1 line-clamp-1">
                {paci.expediente.estudiante.nombre_completo}
              </h3>
              <p className="text-sm text-slate-400 font-mono mb-4">{paci.expediente.estudiante.rut}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Diagnóstico:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[150px]" title={paci.expediente.estudiante.diagnostico_pie}>
                    {paci.expediente.estudiante.diagnostico_pie || "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Fecha de Cierre:</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(paci.fecha_creacion).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleDownloadPDF(paci.id, paci.expediente.estudiante.rut)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-brand-deep rounded-lg font-semibold text-sm transition-colors border border-slate-200"
                  title="Descargar versión actual en PDF"
                >
                  <Download size={16} /> PDF
                </button>
                <Link 
                  href={`/revisiones/${paci.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-pacia-indigo/10 text-pacia-indigo font-bold hover:bg-pacia-indigo hover:text-white rounded-lg transition-colors"
                  title="Abrir editor del documento"
                >
                  <Pencil size={16} /> Ver / Editar
                </Link>
                <button 
                  onClick={() => handleDeleteClick(paci.id)}
                  className="w-10 flex flex-shrink-0 items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  title="Eliminar PACI permanentemente"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setPaciToDelete(null); }}
        onConfirm={handleDelete}
        title="¡ADVERTENCIA CRÍTICA!"
        message="¿Estás completamente seguro de eliminar este PACI? Se borrará todo el trabajo asociado de forma PERMANENTE y no se podrá recuperar."
      />
    </div>
  );
}
