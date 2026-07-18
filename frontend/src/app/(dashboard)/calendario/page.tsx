"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, X, Loader2, User } from "lucide-react";

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0],
    hora: "09:00",
    tipo: "Revisión PACI",
    estudiante_id: ""
  });

  const fetchEventos = async () => {
    try {
      const token = localStorage.getItem("pacia_token");
      
      // Obtener eventos
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/calendario`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setEventos(await res.json());

      // Obtener estudiantes para el select
      const resEst = await fetch("http://localhost:8000/api/estudiantes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resEst.ok) setEstudiantes(await resEst.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Combine fecha and hora
    const fechaInicio = new Date(`${nuevoEvento.fecha}T${nuevoEvento.hora}:00`);
    const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); // 1 hora despues
    
    try {
      const token = localStorage.getItem("pacia_token");
      const payload = {
        titulo: nuevoEvento.titulo,
        descripcion: nuevoEvento.descripcion,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        tipo: nuevoEvento.tipo,
        estudiante_id: nuevoEvento.estudiante_id ? parseInt(nuevoEvento.estudiante_id) : null
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/calendario`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNuevoEvento({ ...nuevoEvento, titulo: "", descripcion: "" });
        fetchEventos();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Hacer que Lunes sea 0
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Helper para pintar eventos en el dia
  const getEventosDelDia = (day: number) => {
    return eventos.filter(ev => {
      const evDate = new Date(ev.fecha_inicio);
      return evDate.getDate() === day && evDate.getMonth() === currentMonth && evDate.getFullYear() === currentYear;
    });
  };

  const getColorPorTipo = (tipo: string) => {
    switch (tipo) {
      case "Revisión PACI": return "bg-red-100 text-red-700 border-red-200";
      case "Reunión Apoderado": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Evaluación": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full h-full flex gap-6">
      
      {/* Columna Principal - Calendario */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-deep font-[DIN Alternate]">Calendario</h1>
            <p className="text-foreground-muted mt-1">Organización de tiempo y seguimiento de procesos.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-pacia-indigo text-white font-bold rounded-xl shadow-lg shadow-pacia-indigo/20 hover:bg-pacia-indigo/90 transition-all"
          >
            <Plus size={20} /> Nuevo Evento
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-pacia-cyan/20 via-pacia-indigo/10 to-transparent">
            <h2 className="text-2xl font-bold text-brand-deep capitalize flex items-center gap-2">
              <CalendarIcon className="text-pacia-indigo" />
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg hover:bg-white text-slate-600 transition-colors shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg hover:bg-white text-slate-600 transition-colors shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
              <div key={day} className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-100 gap-[1px] overflow-y-auto custom-scrollbar">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="bg-slate-50/50 p-2 min-h-[120px]"></div>
            ))}
            {days.map(day => {
              const esHoy = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
              const eventosDelDia = getEventosDelDia(day);
              
              return (
                <div key={day} className={`p-2 min-h-[120px] transition-colors cursor-pointer relative ${esHoy ? 'bg-gradient-to-br from-pacia-cyan/10 to-pacia-indigo/5 border-2 border-pacia-cyan z-10 shadow-sm' : 'bg-white hover:bg-slate-50'}`}>
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full ${esHoy ? 'bg-pacia-cyan text-white shadow-md scale-110' : 'text-slate-600'}`}>
                      {day}
                    </span>
                    {esHoy && <span className="text-[9px] font-bold uppercase tracking-wider text-pacia-indigo bg-white px-2 py-0.5 rounded-full shadow-sm">Hoy</span>}
                  </div>
                  
                  <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {eventosDelDia.map(ev => (
                      <div key={ev.id} className={`text-[10px] p-1.5 rounded-md border font-medium truncate shadow-sm ${getColorPorTipo(ev.tipo)}`} title={ev.titulo}>
                        {new Date(ev.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {ev.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columna Lateral - Próximos Eventos */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon size={20} className="text-pacia-indigo" />
            <h3 className="font-bold text-brand-deep text-lg">Próximos Eventos</h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8 text-slate-400"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              {eventos.filter(e => new Date(e.fecha_inicio) >= new Date()).slice(0,5).map(ev => (
                <div key={ev.id} className="relative pl-4 border-l-2 border-pacia-cyan">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-pacia-cyan"></div>
                  <p className="text-xs font-bold text-pacia-indigo mb-1">
                    {new Date(ev.fecha_inicio).toLocaleDateString([], {weekday: 'long', day: 'numeric', month: 'short'})}
                  </p>
                  <p className="font-semibold text-brand-deep leading-tight text-sm mb-1">{ev.titulo}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Clock size={12} /> {new Date(ev.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ))}
              
              {eventos.length === 0 && (
                <p className="text-sm text-slate-500 text-center mt-10">No hay eventos próximos.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-brand-deep font-[DIN Alternate]">Nuevo Evento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Título del Evento</label>
                <input 
                  required type="text"
                  value={nuevoEvento.titulo} onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo focus:ring-1 focus:ring-pacia-indigo"
                  placeholder="Ej. Revisión PACI Martina"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha</label>
                  <input 
                    required type="date"
                    value={nuevoEvento.fecha} onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hora</label>
                  <input 
                    required type="time"
                    value={nuevoEvento.hora} onChange={e => setNuevoEvento({...nuevoEvento, hora: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo de Evento</label>
                <select 
                  value={nuevoEvento.tipo} onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo"
                >
                  <option>Revisión PACI</option>
                  <option>Reunión Apoderado</option>
                  <option>Evaluación</option>
                  <option>General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estudiante (Opcional)</label>
                <select 
                  value={nuevoEvento.estudiante_id} onChange={e => setNuevoEvento({...nuevoEvento, estudiante_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pacia-indigo"
                >
                  <option value="">-- Ninguno --</option>
                  {estudiantes.map(est => (
                    <option key={est.id} value={est.id}>{est.nombre_completo}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button disabled={isSaving} type="submit" className="flex-1 flex justify-center items-center gap-2 py-3 bg-pacia-indigo text-white font-bold rounded-xl hover:bg-pacia-indigo/90 shadow-lg shadow-pacia-indigo/20 transition-all disabled:opacity-50">
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : "Guardar Evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
