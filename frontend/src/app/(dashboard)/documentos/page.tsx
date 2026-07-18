"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, UploadCloud, FileType, Calendar, BrainCircuit, Filter, X, Trash2 } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";

export default function BibliotecaInteligentePage() {
  const { user } = useAuth();
  const isProfesor = user?.rol === "Profesor Aula";
  
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);

  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch("http://localhost:8000/api/documents", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocumentos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
    
  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadClick = () => {
    const fileInput = document.getElementById('ai-upload');
    if (fileInput) fileInput.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch("http://localhost:8000/api/documents/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        fetchDocs();
      } else {
        alert("Error al subir documento institucional.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (docId: number, nombre: string) => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/documents/download/${docId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      alert("Error al descargar el documento");
    }
  };

  const handleChangeCategory = async (docId: number, newCategory: string) => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/documents/${docId}/categoria`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ categoria: newCategory })
      });
      if (res.ok) {
        fetchDocs(); // Refrescar lista para ver el nuevo color
        setEditingDocId(null);
      } else {
        alert("Error al cambiar la categoría");
      }
    } catch (e) {
      alert("Error de conexión al cambiar categoría");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDocToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (docToDelete === null) return;
    
    try {
      const token = localStorage.getItem("pacia_token");
      const response = await fetch(`http://localhost:8000/api/documents/${docToDelete}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el documento");
      }
      
      setDocumentos(documentos.filter(d => d.id !== docToDelete));
      setDeleteModalOpen(false);
      setDocToDelete(null);
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo eliminar el documento.");
    }
  };

  // Categorías y Colores
  const CATEGORIES = [
    { id: "Profesor de Aula", label: "Profesor de Aula", color: "blue" },
    { id: "Psicología", label: "Psicología", color: "purple" },
    { id: "Psicopedagogía", label: "Psicopedagogía", color: "cyan" },
    { id: "Fonoaudiología", label: "Fonoaudiología", color: "sky" },
    { id: "Terapia Ocupacional", label: "Terapia Ocupacional", color: "orange" },
    { id: "Educación Diferencial", label: "Educación Diferencial", color: "rose" },
    { id: "Médico", label: "Médico", color: "green" },
    { id: "Familia", label: "Familia", color: "yellow" },
    { id: "Normativa", label: "Normativa", color: "slate" },
    { id: "Sin clasificar", label: "Otros", color: "gray" },
  ];

  const getColorClasses = (colorName: string) => {
    const map: Record<string, { headerBg: string, bodyBg: string, textHeader: string, textIcon: string, border: string, pill: string }> = {
      blue: { headerBg: "bg-blue-600", bodyBg: "bg-blue-50", textHeader: "text-white", textIcon: "text-blue-700", border: "border-blue-200", pill: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      purple: { headerBg: "bg-purple-600", bodyBg: "bg-purple-50", textHeader: "text-white", textIcon: "text-purple-700", border: "border-purple-200", pill: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
      rose: { headerBg: "bg-rose-700", bodyBg: "bg-rose-50", textHeader: "text-white", textIcon: "text-rose-700", border: "border-rose-200", pill: "bg-rose-100 text-rose-800 hover:bg-rose-200" },
      cyan: { headerBg: "bg-cyan-600", bodyBg: "bg-cyan-50", textHeader: "text-white", textIcon: "text-cyan-700", border: "border-cyan-200", pill: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
      sky: { headerBg: "bg-sky-500", bodyBg: "bg-sky-50", textHeader: "text-white", textIcon: "text-sky-700", border: "border-sky-200", pill: "bg-sky-100 text-sky-800 hover:bg-sky-200" },
      green: { headerBg: "bg-emerald-600", bodyBg: "bg-emerald-50", textHeader: "text-white", textIcon: "text-emerald-700", border: "border-emerald-200", pill: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
      orange: { headerBg: "bg-orange-500", bodyBg: "bg-orange-50", textHeader: "text-white", textIcon: "text-orange-700", border: "border-orange-200", pill: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
      yellow: { headerBg: "bg-amber-500", bodyBg: "bg-amber-50", textHeader: "text-white", textIcon: "text-amber-700", border: "border-amber-200", pill: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
      slate: { headerBg: "bg-slate-600", bodyBg: "bg-slate-50", textHeader: "text-white", textIcon: "text-slate-700", border: "border-slate-200", pill: "bg-slate-100 text-slate-800 hover:bg-slate-200" },
      gray: { headerBg: "bg-gray-500", bodyBg: "bg-gray-50", textHeader: "text-white", textIcon: "text-gray-700", border: "border-gray-200", pill: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    };
    return map[colorName] || map.gray;
  };

  const filteredDocumentos = documentos.filter(doc => {
    if (selectedCategory && doc.categoria !== selectedCategory) return false;
    
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const nombreDoc = (doc.nombre_archivo || "").toLowerCase();
    const nombreAlumno = (doc.expediente?.estudiante?.nombre_completo || "").toLowerCase();
    
    return nombreDoc.includes(term) || nombreAlumno.includes(term);
  });

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Overlay Animado de Carga de IA */}
      {isUploading && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-pacia-cyan/20 flex flex-col items-center max-w-sm text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full border-t-2 border-pacia-cyan animate-spin opacity-50 w-16 h-16"></div>
              <div className="w-16 h-16 rounded-full bg-cyan-50 text-pacia-cyan flex items-center justify-center relative">
                <BrainCircuit size={28} className="animate-pulse" />
              </div>
            </div>
            <h3 className="font-bold text-xl text-brand-deep mb-2 font-[DIN Alternate]">Clasificando con IA</h3>
            <p className="text-sm text-slate-500">
              PACIA está leyendo el contenido de tu documento y asignando la categoría correcta de forma automática...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-brand-deep font-[DIN Alternate]">Biblioteca Inteligente</h1>
          <p className="text-foreground-muted mt-2 text-base">Sube cualquier documento y la IA lo clasificará automáticamente por especialidad o normativa.</p>
        </div>
        <input 
          type="file" 
          id="ai-upload" 
          className="hidden" 
          onChange={handleFileChange} 
          accept=".pdf,.docx"
        />
        <button 
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center gap-3 px-6 py-3 bg-cyan-700 text-white font-bold text-base rounded-xl shadow-lg shadow-cyan-900/20 hover:bg-cyan-800 transition-all disabled:opacity-50 hover:-translate-y-0.5"
        >
          <UploadCloud size={22} />
          Subir con Auto-Clasificación IA
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Buscador */}
        <div className="relative w-full lg:w-96 shrink-0">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar informes, normativas, o estudiantes..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan transition-all"
          />
        </div>

        {/* Filtros de Categoría Rápidos */}
        <div className="flex flex-wrap items-center gap-2 w-full justify-start lg:justify-end">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1"><Filter size={14}/> FILTRAR:</span>
          {CATEGORIES.map(cat => {
            const colors = getColorClasses(cat.color);
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wide font-bold rounded-lg border transition-all ${
                  isSelected 
                    ? `${colors.pill} ring-2 ring-offset-1 ring-${cat.color}-300 shadow-sm` 
                    : `bg-white text-slate-600 border-slate-200 hover:bg-slate-50`
                }`}
              >
                {cat.label}
              </button>
            );
          })}
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Quitar filtros"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 h-64">
          <Loader2 size={32} className="animate-spin mb-4 text-pacia-cyan" />
          <p className="text-lg">Cargando biblioteca inteligente...</p>
        </div>
      ) : filteredDocumentos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex-1 flex flex-col items-center justify-center">
          <BrainCircuit size={56} className="text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-brand-deep mb-2">No se encontraron documentos</h3>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            {searchTerm || selectedCategory 
              ? "Prueba eliminando algunos filtros de búsqueda." 
              : "Sube tu primer documento y deja que la IA lo organice por ti."}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDocumentos.map((doc: any) => {
              const catDef = CATEGORIES.find(c => c.id === doc.categoria) || CATEGORIES[9]; // 9 es Sin clasificar
              const colors = getColorClasses(catDef.color);
              const isInstitucional = !doc.expediente_id;
              
              return (
                <div key={doc.id} className={`${colors.bodyBg} rounded-2xl border ${colors.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group relative`}>
                  {/* Card Header (Strong Solid Color) */}
                  <div className={`px-5 py-3 ${colors.headerBg} flex justify-between items-center min-h-[3rem]`}>
                    {editingDocId === doc.id ? (
                      <select 
                        autoFocus
                        className="text-sm font-bold bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 outline-none"
                        defaultValue={doc.categoria}
                        onChange={(e) => handleChangeCategory(doc.id, e.target.value)}
                        onBlur={() => setEditingDocId(null)}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id} className="text-slate-800 bg-white">{c.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-black/10 px-3 py-1.5 rounded-lg" 
                        onClick={() => setEditingDocId(doc.id)}
                        title="Clic para reclasificar manualmente"
                      >
                        <span className={`text-sm font-bold ${colors.textHeader}`}>{doc.categoria}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 text-white"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </div>
                    )}
                    {doc.procesado_ocr && !editingDocId && (
                      <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded text-white shadow-sm tracking-wider">OCR IA</span>
                    )}
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-xl bg-white ${colors.textIcon} flex items-center justify-center shrink-0 shadow-sm border border-black/5`}>
                        <FileType size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base leading-tight line-clamp-2 break-all" title={doc.nombre_archivo}>
                          {doc.nombre_archivo}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1.5 uppercase font-mono bg-white/60 inline-block px-2 py-0.5 rounded border border-slate-200/50">
                          {(doc.tipo_mime || 'PDF').split('/').pop()} • {(doc.tamano || "1.2MB")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
                      {isInstitucional ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5">
                            <span className="text-xs font-bold text-slate-500">INS</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">Documento</span>
                            <span className="text-xs font-medium text-slate-500">Institucional</span>
                          </div>
                        </div>
                      ) : (
                        <Link href={`/expedientes/${doc.expediente_id}`} className="flex items-center gap-3 hover:opacity-80 p-1 -ml-1 rounded-lg transition-all">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 shadow-sm border border-white">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${doc.expediente?.estudiante?.rut}`} alt="Avatar" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 max-w-[140px] truncate">
                              {doc.expediente?.estudiante?.nombre_completo}
                            </span>
                            <span className="text-xs font-medium text-slate-500">Expediente Alumno</span>
                          </div>
                        </Link>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => window.open(`http://localhost:8000/${doc.archivo_url}`, '_blank')}
                          className="w-9 h-9 rounded-xl bg-white shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center text-brand-deep transition-all hover:scale-105"
                          title="Descargar/Ver Documento"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteClick(doc.id)}
                          className="w-9 h-9 rounded-xl bg-white shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 transition-all hover:scale-105"
                          title="Eliminar Documento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDocToDelete(null); }}
        onConfirm={handleDeleteDocument}
        title="¡ADVERTENCIA CRÍTICA!"
        message="Estás a punto de ELIMINAR este DOCUMENTO de la biblioteca. Esta acción es PERMANENTE y NO SE PUEDE DESHACER. No podrás recuperar el archivo."
      />
    </div>
  );
}
