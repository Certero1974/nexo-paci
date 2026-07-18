"use client";

import { useState, useRef } from "react";
import { Menu, Bell, ChevronDown, User, Settings, LogOut, Check, Camera } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, updateAvatar } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapear rutas a títulos y colores
  const getPageInfo = () => {
    if (pathname === "/") return { text: "Escritorio", color: "text-blue-600" };
    if (pathname.includes("/estudiantes")) return { text: "Estudiantes y Casos", color: "text-blue-600" };
    if (pathname.includes("/expedientes")) return { text: "Expedientes Vivos", color: "text-blue-600" };
    if (pathname.includes("/documentos")) return { text: "Biblioteca de Documentos", color: "text-blue-600" };
    if (pathname.includes("/revisiones")) return { text: "Revisiones y Aprobaciones", color: "text-blue-600" };
    if (pathname.includes("/reportes")) return { text: "Centro de Inteligencia", color: "text-blue-600" };
    if (pathname.includes("/paci")) return { text: "Archivo PACI Oficial", color: "text-green-600" };
    if (pathname.includes("/configuracion")) return { text: "Configuración", color: "text-blue-600" };
    if (pathname.includes("/calendario")) return { text: "Calendario", color: "text-blue-600" };
    return { text: "Escritorio", color: "text-blue-600" };
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateAvatar(base64String);
        setShowProfileMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const pageInfo = getPageInfo();
  const defaultAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.nombre || 'Usuario'}`;
  const displayAvatar = user?.avatarUrl || defaultAvatar;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-10 shrink-0 relative">
      <div className="flex items-center gap-4">
        <button className="text-foreground-muted hover:text-brand-deep transition-colors">
          <Menu size={24} />
        </button>
        <h2 className={`text-xl font-bold font-[DIN Alternate] transition-colors ${pageInfo.color}`}>
          {pageInfo.text}
        </h2>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Campana de Notificaciones */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-foreground-muted hover:text-pacia-indigo transition-colors mt-2"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">2</span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-4 animate-fade-in-up">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Notificaciones (2)</h3>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm border-b border-slate-50 pb-2">
                  <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Diego (Psicólogo)</p>
                    <p className="text-xs text-slate-500">Ha comentado en el PACI de Benjamín.</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-50 text-green-500 rounded-full flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Validación completada</p>
                    <p className="text-xs text-slate-500">Andrea V. validó el PACI de Martina.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Menú de Perfil */}
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-pacia-cyan transition-all">
              <img src={displayAvatar} alt="Perfil" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-bold text-foreground">{user?.nombre || 'Cargando...'}</span>
              <span className="text-[11px] text-foreground-muted">{user?.rol || 'Rol no definido'}</span>
            </div>
            <ChevronDown size={16} className="text-foreground-muted" />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
              <div className="p-3 border-b border-slate-50 text-center">
                <div className="relative w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-slate-100 group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={displayAvatar} alt="Perfil" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Camera size={16} className="text-white" />
                  </div>
                </div>
                <p className="font-bold text-sm">{user?.nombre}</p>
                <p className="text-xs text-slate-500">{user?.rol}</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                onClick={() => { fileInputRef.current?.click() }}
                className="w-full flex items-center gap-2 p-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-pacia-cyan transition-colors"
              >
                <Camera size={16} /> Cambiar Foto
              </button>
              <button 
                onClick={() => router.push("/configuracion")}
                className="w-full flex items-center gap-2 p-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-pacia-indigo transition-colors"
              >
                <Settings size={16} /> Configuración
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
