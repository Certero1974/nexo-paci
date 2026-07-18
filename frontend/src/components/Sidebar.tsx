"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderOpen, FileText, FileSignature, CheckSquare, CalendarDays, BarChart2, Settings } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import logoImg from "../../public/logo-def2.png";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const allNavItems = [
    { icon: <LayoutDashboard size={18} />, label: "Escritorio", href: "/" },
    { icon: <Users size={18} />, label: "Estudiantes", href: "/estudiantes" },
    { icon: <FolderOpen size={18} />, label: "Expedientes", href: "/expedientes" },
    { icon: <FileText size={18} />, label: "Documentos", href: "/documentos" },
    { icon: <FileSignature size={18} />, label: "PACI", href: "/paci" },
    { icon: <CheckSquare size={18} />, label: "Revisiones", href: "/revisiones" },
    { icon: <CalendarDays size={18} />, label: "Calendario", href: "/calendario" },
    { icon: <BarChart2 size={18} />, label: "Reportes", href: "/reportes" },
    { icon: <Settings size={18} />, label: "Configuración", href: "/configuracion" },
  ];

  // Filtrar según rol
  const isProfesor = user?.rol === "Profesor Aula";
  const navItems = isProfesor 
    ? allNavItems.filter(item => !["Reportes", "Configuración"].includes(item.label))
    : allNavItems;

  return (
    <aside className="w-64 h-screen bg-brand-deep flex flex-col flex-shrink-0 text-white z-20 shadow-2xl relative overflow-hidden">
      {/* Subtle glow behind logo */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pacia-indigo/20 to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col items-center justify-center px-2 pt-4 pb-1 relative z-10 text-center w-full">
        <Link href="/" className="w-full max-w-[240px] mx-auto flex items-center justify-center cursor-pointer">
          <Image 
            src={logoImg} 
            alt="PACiA Logo" 
            className="w-full h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 relative z-10 overflow-y-auto custom-scrollbar mt-1">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          // Determinar clases extra para el Onboarding Tour
          let tourClass = "";
          if (item.label === "Estudiantes") tourClass = "tour-menu-estudiantes";
          if (item.label === "Revisiones") tourClass = "tour-menu-revisiones";
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all font-semibold text-base group relative ${tourClass} ${
                isActive 
                  ? "bg-pacia-cyan/15 text-pacia-cyan scale-[1.02] shadow-sm" 
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-pacia-cyan rounded-r-full"></div>}
              <span className={`opacity-100 scale-110 transition-colors ${isActive ? 'text-pacia-cyan drop-shadow-md' : 'group-hover:text-white'}`}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* User Mini Profile at bottom */}
      <div className="p-4 border-t border-white/10 mt-auto flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
               <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.nombre || 'User'}`} alt="User" />
             </div>
             <div className="flex flex-col">
                 <span className="text-xs font-bold text-white max-w-[120px] truncate">{user?.nombre || "Cargando..."}</span>
                 <span className="text-[10px] text-white/50">{user?.rol || "Online"}</span>
             </div>
         </div>
         
         <button 
           onClick={logout}
           className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
           title="Cerrar sesión"
         >
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
         </button>
      </div>
    </aside>
  );
}
