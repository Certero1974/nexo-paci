"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Filter, MoreVertical, X, Loader2, FolderOpen, Edit, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";

export default function EstudiantesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isProfesor = user?.rol === "Profesor Aula";
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  
  // Formulario
  const [rut, setRut] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [curso, setCurso] = useState("");
  const [diagnostico, setDiagnostico] = useState("");

  const filteredEstudiantes = estudiantes.filter(est => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase().trim();
    const nombreClean = (est.nombre_completo || "").toLowerCase();
    const rutValue = (est.rut || "").toLowerCase();
    
    const termClean = term.replace(/[^a-z0-9k]/g, '');
    const rutClean = rutValue.replace(/[^a-z0-9k]/g, '');
    
    if (termClean && rutClean.includes(termClean)) return true;
    if (term && nombreClean.includes(term)) return true;
    
    return false;
  });

  const fetchEstudiantes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch("http://localhost:8000/api/estudiantes", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEstudiantes(data);
      }
    } catch (err) {
      console.error("Error al cargar estudiantes", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setStudentToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (studentToDelete === null) return;
    
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/estudiantes/${studentToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEstudiantes();
        setDeleteModalOpen(false);
        setStudentToDelete(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (est: any) => {
    setEditingId(est.id);
    setRut(est.rut);
    setNombre(est.nombre_completo);
    setFechaNacimiento(est.fecha_nacimiento);
    setCurso(est.curso || "");
    setDiagnostico(est.diagnostico_pie || "");
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleOpenNewModal = () => {
    setEditingId(null);
    setRut("");
    setNombre("");
    setFechaNacimiento("");
    setCurso("");
    setDiagnostico("");
    setIsModalOpen(true);
  };

  const handleViewExpediente = async (estudianteId: number) => {
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/expedientes/estudiante/${estudianteId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const exp = await res.json();
        router.push(`/expedientes/${exp.id}`);
      } else {
        alert("Este estudiante aún no tiene un expediente vinculado. (Los expedientes se auto-crean para estudiantes nuevos).");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("pacia_token");
      
      const url = editingId 
        ? `http://localhost:8000/api/estudiantes/${editingId}`
        : "http://localhost:8000/api/estudiantes";
        
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rut,
          nombre_completo: nombre,
          fecha_nacimiento: fechaNacimiento,
          curso,
          diagnostico_pie: diagnostico
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al crear estudiante");
      }

      // Éxito
      setIsModalOpen(false);
      setEditingId(null);
      setRut("");
      setNombre("");
      setFechaNacimiento("");
      setCurso("");
      setDiagnostico("");
      fetchEstudiantes(); // Recargar lista
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-deep font-[DIN Alternate]">Estudiantes PIE</h1>
          <p className="text-foreground-muted mt-1">Directorio oficial de alumnos en Programa de Integración Escolar.</p>
        </div>
        
        <button className="bg-role-docente text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-role-docente/20 hover:scale-105 transition-transform flex items-center gap-2" onClick={handleOpenNewModal}>
          <Plus size={18} />
          Registrar Estudiante
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o RUT..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={16} />
          Filtrar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 relative pb-32">
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 font-semibold">RUT</th>
                <th className="p-4 font-semibold">Nombre Completo</th>
                <th className="p-4 font-semibold">Curso</th>
                <th className="p-4 font-semibold">Fecha Nacimiento</th>
                <th className="p-4 font-semibold">Diagnóstico PIE</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Cargando estudiantes...
                  </td>
                </tr>
              ) : estudiantes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 bg-white">
                    <div className="max-w-md mx-auto">
                      <p className="text-lg font-bold text-brand-deep mb-2">Aún no hay estudiantes en tu red</p>
                      <p className="mb-6">El primer paso hacia una mejor inclusión es conocerlos. Registra a tu primer estudiante y PACIA organizará su expediente automáticamente.</p>
                      <button onClick={handleOpenNewModal} className="pacia-gradient-bg text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-pacia-cyan/20">
                        <UserPlus size={18} /> Registrar Alumno
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredEstudiantes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <p className="font-bold text-brand-deep text-lg mb-1">Sin resultados</p>
                    <p>No hemos encontrado evidencias para "{searchTerm}". Intenta con otro término.</p>
                  </td>
                </tr>
              ) : (
                filteredEstudiantes.map((est: any) => (
                  <tr key={est.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-sm font-medium text-slate-600">{est.rut}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pacia-cyan/10 flex items-center justify-center text-pacia-cyan font-bold text-xs">
                          {est.nombre_completo.charAt(0)}
                        </div>
                        <span className="font-semibold text-brand-deep">{est.nombre_completo}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">{est.curso || "-"}</td>
                    <td className="p-4 text-sm text-slate-600">{est.fecha_nacimiento}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pacia-indigo/10 text-pacia-indigo border border-pacia-indigo/20">
                        {est.diagnostico_pie || "No especificado"}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === est.id ? null : est.id)}
                        className="text-slate-400 hover:text-pacia-cyan transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === est.id && (
                        <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-150">
                          <div className="flex flex-col py-1">
                            <button 
                              onClick={() => handleViewExpediente(est.id)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-pacia-cyan flex items-center gap-2 transition-colors"
                            >
                              <FolderOpen size={16} /> Ver Expediente
                            </button>
                            <button  
                              onClick={() => handleEditClick(est)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                              <Edit size={16} /> Editar
                            </button>
                            
                            <div className="h-px bg-slate-100 my-1 w-full"></div>
                            <button 
                              onClick={() => handleDeleteClick(est.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={16} /> Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clic fuera del menú para cerrarlo */}
      {openMenuId !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
      )}

      {/* Modal Nuevo Estudiante */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-brand-deep font-[DIN Alternate]">
                {editingId ? "Editar Alumno" : "Registrar Nuevo Alumno"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">RUT</label>
                  <input 
                    type="text" 
                    required
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="12.345.678-9"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Martina González"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input 
                    type="date" 
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Curso</label>
                  <select 
                    required
                    value={curso}
                    onChange={(e) => setCurso(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan"
                  >
                    <option value="">Selecciona un curso...</option>
                    <optgroup label="Educación Parvularia">
                      <option value="NT1 (Pre-kínder)">NT1 (Pre-kínder)</option>
                      <option value="NT2 (Kínder)">NT2 (Kínder)</option>
                    </optgroup>
                    <optgroup label="Educación Básica - Primer Ciclo">
                      <option value="1° Básico">1° Básico</option>
                      <option value="2° Básico">2° Básico</option>
                      <option value="3° Básico">3° Básico</option>
                      <option value="4° Básico">4° Básico</option>
                    </optgroup>
                    <optgroup label="Educación Básica - Segundo Ciclo">
                      <option value="5° Básico">5° Básico</option>
                      <option value="6° Básico">6° Básico</option>
                      <option value="7° Básico">7° Básico</option>
                      <option value="8° Básico">8° Básico</option>
                    </optgroup>
                    <optgroup label="Educación Media">
                      <option value="1° Medio">1° Medio</option>
                      <option value="2° Medio">2° Medio</option>
                      <option value="3° Medio">3° Medio</option>
                      <option value="4° Medio">4° Medio</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Diagnóstico PIE</label>
                  <select
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pacia-cyan focus:ring-1 focus:ring-pacia-cyan"
                  >
                    <option value="">Selecciona un diagnóstico...</option>
                    <option value="TDAH">TDAH (Trastorno por Déficit de Atención)</option>
                    <option value="TEA">TEA (Trastorno del Espectro Autista)</option>
                    <option value="TEL">TEL (Trastorno Específico del Lenguaje)</option>
                    <option value="DEA">DEA (Dificultad Específica del Aprendizaje)</option>
                    <option value="FIL">FIL (Funcionamiento Intelectual Limítrofe)</option>
                    <option value="DIL">DI Leve (Discapacidad Intelectual Leve)</option>
                    <option value="DIM">DI Moderada (Funcionamiento Intelectual Moderado)</option>
                    <option value="DV">Discapacidad Visual</option>
                    <option value="DA">Discapacidad Auditiva</option>
                    <option value="DM">Discapacidad Motora</option>
                    <option value="Sindrome de Down">Síndrome de Down</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="pacia-gradient-bg text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Guardar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setStudentToDelete(null); }}
        onConfirm={handleDelete}
        title="¡ADVERTENCIA CRÍTICA!"
        message="Estás a punto de eliminar a este estudiante. Esta acción borrará también su expediente, documentos y PACIs. Esta acción es PERMANENTE y NO SE PUEDE DESHACER."
      />
    </div>
  );
}
