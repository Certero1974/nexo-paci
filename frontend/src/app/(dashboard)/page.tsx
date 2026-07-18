"use client";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Clock, AlertCircle, ArrowRight, UserCircle2, RefreshCw, Zap, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const auth = useAuth();
  const user = auth?.user;
  const [isSwappingRole, setIsSwappingRole] = useState(false);
  
  const firstName = user?.nombre ? user.nombre.split(" ")[0] : "Usuario";

  // Saludo dinámico según la hora
  const hour = new Date().getHours();
  let greeting = "Buenos días";
  let greetingIcon = "☀️";
  if (hour >= 12 && hour < 20) {
    greeting = "Buenas tardes";
    greetingIcon = "👋";
  } else if (hour >= 20 || hour < 5) {
    greeting = "Buenas noches";
    greetingIcon = "🌙";
  }

  // Función exclusiva para la demo: Cambiar rol en vivo
  const changeRoleForDemo = (newRole: string) => {
    if (!user || !auth) return;
    setIsSwappingRole(true);
    setTimeout(() => {
      auth.login(auth.token || "", { ...user, rol: newRole });
      setIsSwappingRole(false);
    }, 500);
  };

  const renderDashboardByRole = () => {
    switch (user?.rol) {
      case "Educadora Diferencial":
        return <DashboardEducadora />;
      case "Profesor Aula":
        return <DashboardProfesor />;
      case "Psicólogo":
        return <DashboardPsicologo />;
      case "Fonoaudiólogo":
        return <DashboardEspecialista rol="Fonoaudiólogo" />;
      case "Psicopedagoga":
        return <DashboardEspecialista rol="Psicopedagoga" />;
      case "Parvularia":
        return <DashboardEspecialista rol="Parvularia" />;
      case "Terapeuta Ocupacional":
        return <DashboardEspecialista rol="Terapeuta Ocupacional" />;
      case "Coordinador PIE":
        return <DashboardCoordinador />;
      case "Jefe UTP":
        return <DashboardUTP />;
      default:
        return <DashboardEspecialista rol={user?.rol || "Profesional"} />;
    }
  };

  const getRoleColor = (r: string) => {
    switch (r) {
      case "Educadora Diferencial": return "text-white border-role-eddif bg-role-eddif";
      case "Profesor Aula": return "text-white border-role-docente bg-role-docente";
      case "Psicólogo": return "text-white border-role-psicologa bg-role-psicologa";
      case "Psicopedagoga": return "text-white border-teal-600 bg-teal-600";
      case "Fonoaudiólogo": return "text-white border-role-fono bg-role-fono";
      case "Terapeuta Ocupacional": return "text-white border-role-terapeuta bg-role-terapeuta";
      case "Coordinador PIE": return "text-white border-pacia-indigo bg-pacia-indigo";
      case "Jefe UTP": return "text-white border-role-normativa bg-role-normativa";
      default: return "text-slate-800 border-pacia-cyan bg-white";
    }
  };

  const currentRoleColor = getRoleColor(user?.rol || "");

  return (
    <div className="w-full h-full flex flex-col max-w-[1200px] mx-auto">
      {/* Saludo Empático */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="bg-gradient-to-r from-pacia-cyan/10 via-pacia-indigo/10 to-transparent p-6 rounded-3xl border-l-4 border-pacia-cyan">
          <h2 className="text-4xl font-bold tracking-tight font-[DIN Alternate] text-brand-deep flex items-center gap-3">
            ¡{greeting}, <span className="pacia-gradient-text">{firstName}</span>! {greetingIcon}
          </h2>
          <p className="text-slate-600 mt-2 text-lg font-medium">Tu asistente PACIA está listo para organizar una excelente jornada.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-5 py-2.5 rounded-full border-2 font-black text-sm flex items-center gap-2 shadow-md transition-colors ${currentRoleColor}`}>
            <UserCircle2 size={20} className="opacity-80" />
            <span className="uppercase tracking-wider">{user?.rol || "Cargando perfil..."}</span>
          </div>
          
          {/* BOTON DE PRUEBA RÁPIDA (SOLO PARA DEMO) */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner max-w-sm justify-end">
            <div className="w-full text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right mb-1">Simulador de Roles (Diagnóstico):</div>
            <button onClick={() => changeRoleForDemo("Educadora Diferencial")} className="text-[11px] px-2.5 py-1 hover:bg-role-eddif hover:text-white rounded-md transition-colors text-role-eddif font-bold border border-role-eddif/30" title="Educadora">Edu</button>
            <button onClick={() => changeRoleForDemo("Profesor Aula")} className="text-[11px] px-2.5 py-1 hover:bg-role-docente hover:text-white rounded-md transition-colors text-role-docente font-bold border border-role-docente/30" title="Profesor">Prof</button>
            <button onClick={() => changeRoleForDemo("Psicólogo")} className="text-[11px] px-2.5 py-1 hover:bg-role-psicologa hover:text-white rounded-md transition-colors text-role-psicologa font-bold border border-role-psicologa/30" title="Psicólogo">Psi</button>
            <button onClick={() => changeRoleForDemo("Psicopedagoga")} className="text-[11px] px-2.5 py-1 hover:bg-teal-600 hover:text-white rounded-md transition-colors text-teal-600 font-bold border border-teal-600/30" title="Psicopedagoga">Psp</button>
            <button onClick={() => changeRoleForDemo("Fonoaudiólogo")} className="text-[11px] px-2.5 py-1 hover:bg-role-fono hover:text-white rounded-md transition-colors text-role-fono font-bold border border-role-fono/30" title="Fonoaudiólogo">Fono</button>
            <button onClick={() => changeRoleForDemo("Terapeuta Ocupacional")} className="text-[11px] px-2.5 py-1 hover:bg-role-terapeuta hover:text-white rounded-md transition-colors text-role-terapeuta font-bold border border-role-terapeuta/30" title="Terapeuta Ocupacional">TO</button>
            <button onClick={() => changeRoleForDemo("Coordinador PIE")} className="text-[11px] px-2.5 py-1 hover:bg-pacia-indigo hover:text-white rounded-md transition-colors text-pacia-indigo font-bold border border-pacia-indigo/30" title="Coordinador PIE">Coord</button>
            <button onClick={() => changeRoleForDemo("Jefe UTP")} className="text-[11px] px-2.5 py-1 hover:bg-role-normativa hover:text-white rounded-md transition-colors text-role-normativa font-bold border border-role-normativa/30" title="Jefe UTP">UTP</button>
          </div>
        </div>
      </div>

      {isSwappingRole ? (
        <div className="flex-1 flex items-center justify-center mt-20">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <RefreshCw className="animate-spin text-pacia-cyan" size={40} />
            <p className="font-bold animate-pulse text-sm">Adaptando PACIA al rol seleccionado...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up tour-dashboard-tasks">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Zap className="text-role-docente" size={24} />
              Tareas Prioritarias
            </h3>
            <div className="space-y-4">
              {renderDashboardByRole()}
            </div>
          </div>

          {/* Resumen de Jornada (Común para todos) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 pacia-glow transition-shadow duration-500">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Resumen de tu día</h3>
              
              <div className="space-y-6">
                <SummaryItem icon={<AlertCircle className="text-red-500" />} count={2} label="Urgentes" />
                <SummaryItem icon={<Clock className="text-amber-500" />} count={5} label="Pendientes" />
                <SummaryItem icon={<CheckCircle2 className="text-green-500" />} count={3} label="Completadas" />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-2">Tiempo estimado para finalizar:</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold font-[DIN Alternate] pacia-gradient-text">45</span>
                  <span className="text-slate-400 font-medium mb-1">minutos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Créditos */}
      <div className="mt-12 mb-4 flex justify-center w-full">
        <p className="text-[11px] font-medium text-slate-400 font-[DIN Alternate] tracking-wide">
          Pensado por CERTERO. Creado con IA.
        </p>
      </div>
    </div>
  );
}

// COMPONENTES POR ROL
function DashboardEducadora() {
  return (
    <>
      <ActionTask title="Revisar nuevo informe de Benjamín Rojas" time="5 minutos" tag="Documento" tagColor="bg-rose-100 text-rose-700" href="/expedientes/1" waitingFor="Psicólogo" />
      <ActionTask title="Aprobar PACI Matemática - Curso 5to B" time="10 minutos" tag="Validación" tagColor="bg-amber-100 text-amber-700" href="/revisiones/2" waitingFor="Profesor Aula" />
      <ActionTask title="Responder consulta equipo Aula" time="2 minutos" tag="Coordinación" tagColor="bg-rose-100 text-rose-700" href="/expedientes/1" waitingFor="Equipo de Aula" />
    </>
  );
}

function DashboardProfesor() {
  return (
    <>
      <ActionTask title="Aplicar Adecuaciones Lenguaje - Martina" time="Hoy en clases" tag="Aula" tagColor="bg-blue-100 text-blue-700" href="/revisiones/1" waitingFor="Coordinador PIE" />
      <ActionTask title="Dejar observación de progreso (Benjamín)" time="3 minutos" tag="Seguimiento" tagColor="bg-amber-100 text-amber-700" href="/expedientes/1" waitingFor="Educadora Diferencial" />
    </>
  );
}

function DashboardPsicologo() {
  return (
    <>
      <ActionTask title="Subir informe de evaluación - Sofía P." time="Subir PDF" tag="Evaluación" tagColor="bg-purple-100 text-purple-700" href="/expedientes/3" waitingFor="Educadora Diferencial" />
      <ActionTask title="Revisar meta socioemocional - Benjamín" time="5 minutos" tag="PACI" tagColor="bg-amber-100 text-amber-700" href="/revisiones/1" waitingFor="Coordinador PIE" />
    </>
  );
}

function DashboardCoordinador() {
  return (
    <>
      <ActionTask title="Auditar PACIs pendientes de firma" time="7 expedientes" tag="Auditoría" tagColor="bg-indigo-100 text-indigo-700" href="/reportes" waitingFor="Director" />
      <ActionTask title="Revisar métricas de cumplimiento mensual" time="10 minutos" tag="Reporte" tagColor="bg-emerald-100 text-emerald-700" href="/reportes" />
    </>
  );
}

function DashboardUTP() {
  return (
    <>
      <ActionTask title="Validar adecuaciones curriculares 5to Básico" time="3 expedientes" tag="Validación" tagColor="bg-blue-100 text-blue-700" href="/revisiones" waitingFor="Equipo PIE" />
      <ActionTask title="Firmar PACIs aprobados del mes" time="15 minutos" tag="Firma" tagColor="bg-indigo-100 text-indigo-700" href="/paci" />
    </>
  );
}

function DashboardEspecialista({ rol }: { rol: string }) {
  return (
    <>
      <ActionTask title={`Aportar informe disciplinar - Benjamín`} time="Subir PDF" tag="Evaluación" tagColor="bg-slate-100 text-slate-700" href="/expedientes/1" waitingFor="Educadora Diferencial" />
      <ActionTask title={`Establecer objetivos desde rol de ${rol}`} time="5 minutos" tag="PACI" tagColor="bg-slate-100 text-slate-700" href="/revisiones/1" waitingFor="Coordinador PIE" />
      <ActionTask title="Coordinar en muro interdisciplinario" time="2 minutos" tag="Coordinación" tagColor="bg-slate-100 text-slate-700" href="/expedientes/2" />
    </>
  );
}

// UTILIDADES
function ActionTask({ title, time, tag, tagColor, href, waitingFor }: any) {
  return (
    <Link href={href || "#"} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-300 transition-all group cursor-pointer flex items-center justify-between block">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${tagColor}`}>{tag}</span>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Clock size={12} /> {time}
          </span>
          {waitingFor && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-200">
              <UserCircle2 size={10} /> Espera tu respuesta: {waitingFor}
            </span>
          )}
        </div>
        <h4 className="text-lg font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{title}</h4>
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-role-docente text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-md shrink-0">
        <ArrowRight size={20} />
      </div>
    </Link>
  );
}

function SummaryItem({ icon, count, label }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-slate-600 font-medium">{label}</span>
      </div>
      <span className="text-xl font-bold text-slate-800 font-[DIN Alternate]">{count}</span>
    </div>
  );
}
