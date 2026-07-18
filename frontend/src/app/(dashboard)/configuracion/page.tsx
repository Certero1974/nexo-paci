"use client";

import { useState, useEffect } from "react";
import { Loader2, Building2, Users, Save, UploadCloud, ShieldCheck, Mail, Lock, Trash2 } from "lucide-react";

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("institucion");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Data states
  const [ajustes, setAjustes] = useState({
    nombre_colegio: "Escuela Base",
    rbd: "",
    director: "",
    prompt_ia: ""
  });
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Form states
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "", email: "", password: "", rol: "Profesor Aula"
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("pacia_token");
      
      // Fetch Ajustes
      const resAj = await fetch("http://localhost:8000/api/configuracion/ajustes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resAj.ok) {
        const data = await resAj.json();
        setAjustes({
          nombre_colegio: data.nombre_colegio || "",
          rbd: data.rbd || "",
          director: data.director || "",
          prompt_ia: data.prompt_ia || ""
        });
        setLogoPath(data.logo_path);
      }

      // Fetch Usuarios
      const resUs = await fetch("http://localhost:8000/api/configuracion/usuarios", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resUs.ok) {
        setUsuarios(await resUs.json());
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAjustes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch("http://localhost:8000/api/configuracion/ajustes", {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ajustes)
      });
      if (res.ok) alert("Ajustes guardados correctamente.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch("http://localhost:8000/api/configuracion/logo", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert("Logo actualizado.");
        fetchData(); // Reload path
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch("http://localhost:8000/api/configuracion/usuarios", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoUsuario)
      });
      if (res.ok) {
        alert("Usuario creado exitosamente.");
        setNuevoUsuario({ nombre: "", email: "", password: "", rol: "Profesor Aula" });
        fetchData(); // Reload list
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar a este usuario?")) return;
    try {
      const token = localStorage.getItem("pacia_token");
      const res = await fetch(`http://localhost:8000/api/configuracion/usuarios/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Usuario eliminado correctamente.");
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail}`);
      }
    } catch (err) {
      console.error(err);
    }
  };


  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin mb-4 text-pacia-cyan" />
        <p>Cargando panel de configuración...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-deep font-[DIN Alternate]">Configuración del Sistema</h1>
        <p className="text-foreground-muted mt-1">Ajustes institucionales, gestión de usuarios y personalización de la plataforma.</p>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        
        {/* Sidebar Nav */}
        <div className="w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab("institucion")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${activeTab === "institucion" ? "bg-pacia-indigo text-white shadow-lg shadow-pacia-indigo/20" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Building2 size={20} />
            Institución
          </button>
          
          <button 
            onClick={() => setActiveTab("usuarios")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${activeTab === "usuarios" ? "bg-pacia-indigo text-white shadow-lg shadow-pacia-indigo/20" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Users size={20} />
            Equipo de Trabajo
          </button>

          <button 
            onClick={() => setActiveTab("ia")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${activeTab === "ia" ? "bg-pacia-indigo text-white shadow-lg shadow-pacia-indigo/20" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <ShieldCheck size={20} />
            Ajustes de IA
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          
          {/* TAB: INSTITUCION */}
          {activeTab === "institucion" && (
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold text-brand-deep mb-6">Perfil de la Institución</h2>
              
              <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative group">
                  {logoPath ? (
                    <>
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">LOGO OK</div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <UploadCloud className="text-white" />
                      </div>
                    </>
                  ) : (
                    <UploadCloud size={32} className="mb-2" />
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleUploadLogo} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-deep">Logo Institucional</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-2">Este logo se utilizará en la cabecera de los PACI exportados en PDF.</p>
                  {isUploading && <span className="text-xs font-bold text-pacia-cyan animate-pulse">Subiendo...</span>}
                </div>
              </div>

              <form onSubmit={handleSaveAjustes} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre del Establecimiento</label>
                    <input type="text" required value={ajustes.nombre_colegio} onChange={e => setAjustes({...ajustes, nombre_colegio: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RBD</label>
                    <input type="text" value={ajustes.rbd} onChange={e => setAjustes({...ajustes, rbd: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre del Director(a)</label>
                  <input type="text" value={ajustes.director} onChange={e => setAjustes({...ajustes, director: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo" />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-brand-deep text-white font-bold rounded-xl hover:bg-brand-deep/90 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: USUARIOS */}
          {activeTab === "usuarios" && (
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-xl font-bold text-brand-deep mb-2">Equipo de Trabajo</h2>
                <p className="text-slate-500 text-sm">Gestiona los accesos de los profesores y especialistas a la plataforma.</p>
              </div>

              <div className="flex flex-col lg:flex-row">
                {/* Lista de Usuarios */}
                <div className="w-full lg:w-1/2 lg:border-r border-slate-100 p-8">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Usuarios Registrados ({usuarios.length})</h3>
                  <div className="space-y-3">
                    {usuarios.map(u => (
                      <div key={u.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.nombre}`} alt="Avatar" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-brand-deep text-sm">{u.nombre}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-pacia-indigo/10 text-pacia-indigo font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{u.rol}</span>
                            <span className="text-xs text-slate-500">{u.email}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crear Usuario Form */}
                <div className="w-full lg:w-1/2 p-8 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-brand-deep mb-6">Invitar Nuevo Miembro</h3>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                      <input required type="text" value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                      <input required type="email" value={nuevoUsuario.email} onChange={e => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contraseña Temporal</label>
                        <input required type="password" value={nuevoUsuario.password} onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rol en el Sistema</label>
                        <select required value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo">
                          <option>Profesor Aula</option>
                          <option>Educadora Diferencial</option>
                          <option>Coordinador PIE</option>
                          <option>Psicólogo</option>
                          <option>Fonoaudiólogo</option>
                          <option>Psicopedagoga</option>
                          <option>Parvularia</option>
                          <option>Terapeuta Ocupacional</option>
                          <option>Jefe UTP</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-4 pb-8">
                      <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-brand-deep text-white font-bold rounded-xl hover:bg-brand-deep/90 transition-all shadow-lg shadow-brand-deep/20">
                        <Users size={18} /> Crear Cuenta
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB: IA */}
          {activeTab === "ia" && (
            <div className="p-8 h-full flex flex-col">
              <h2 className="text-xl font-bold text-brand-deep mb-2">Comportamiento de la Inteligencia Artificial</h2>
              <p className="text-slate-500 text-sm mb-8">Define reglas institucionales que el motor de IA de PACIA deberá obedecer al redactar un PACI.</p>
              
              <form onSubmit={handleSaveAjustes} className="flex-1 flex flex-col">
                <div className="flex-1 mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prompt Institucional Base (Instrucciones Personalizadas)</label>
                  <textarea 
                    value={ajustes.prompt_ia} 
                    onChange={e => setAjustes({...ajustes, prompt_ia: e.target.value})} 
                    className="w-full h-full min-h-[200px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo resize-none font-mono text-sm"
                    placeholder="Ejemplo: 'Siempre utiliza un tono formal y prioriza la diversificación universal antes que adecuaciones significativas. Para lenguaje, usar como referencia la metodología X...'"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-brand-deep text-white font-bold rounded-xl hover:bg-brand-deep/90 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Guardar Instrucciones
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
