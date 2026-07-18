"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, ChevronRight, FileText, CheckCircle2, MessageSquareWarning } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function CopilotSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTourOffer, setShowTourOffer] = useState(false);
  
  const pathname = usePathname();
  const auth = useAuth();
  
  // Determinar el contexto basado en la ruta actual
  const isExpediente = pathname.includes("/expedientes/");
  const isRevision = pathname.includes("/revisiones/");
  const isDashboard = pathname === "/";

  useEffect(() => {
    const tourCount = parseInt(localStorage.getItem("pacia_tour_count") || "0");
    const oldCompleted = localStorage.getItem("pacia_tour_completed");
    if (tourCount >= 2 || oldCompleted) {
      setShowTourOffer(true);
    }
  }, []);

  const handleStartTour = () => {
    window.dispatchEvent(new Event("start-pacia-tour"));
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);
    
    try {
      const contextoStr = isExpediente ? "Viendo Expediente de estudiante" : isRevision ? "Revisando y editando PACI" : "Dashboard principal (Escritorio)";
      
      let paciIdOpt = undefined;
      if (isRevision) {
        const match = pathname.match(/\/revisiones\/(\d+)/);
        if (match) paciIdOpt = parseInt(match[1]);
      }

      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: userMsg, contexto: contextoStr, paci_id: paciIdOpt })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "bot", text: data.respuesta }]);
      } else {
        setMessages(prev => [...prev, { role: "bot", text: "Error de conexión con el copiloto." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "bot", text: "Error de conexión con el copiloto." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform group flex items-center justify-center"
      >
        <Sparkles size={24} className="text-pacia-cyan group-hover:animate-spin" />
      </button>
    );
  }

  return (
    <div className="w-80 h-screen bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 shadow-2xl relative z-40 transition-all duration-300">
      
      {/* Header Copilot */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pacia-cyan/20 flex items-center justify-center text-pacia-cyan">
            <Sparkles size={18} />
          </div>
          <span className="font-bold text-white tracking-wide font-[DIN Alternate]">PACIA AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        
        {isDashboard && (
          <div className="space-y-4 animate-fade-in-up">
            <p className="text-sm text-slate-300 leading-relaxed">
              Hola <span className="font-bold text-pacia-cyan">{auth?.user?.nombre?.split(" ")[0] || "Usuario"}</span>, soy tu copiloto PACIA. He organizado las evidencias recientes de tu equipo.
            </p>
            {showTourOffer && (
              <SuggestionCard 
                type="info"
                text="¿Quieres que te dé un recorrido rápido por la plataforma para ver cómo funciona el nuevo Escritorio inteligente?"
                action="Iniciar recorrido (Tour)"
                onClick={handleStartTour}
              />
            )}
            <SuggestionCard 
              type="alert"
              text="Detecté que Benjamín Rojas tiene 2 informes nuevos que aún no han sido procesados para el PACI."
              action="Analizar Expediente"
              href="/expedientes/1"
            />
            <SuggestionCard 
              type="info"
              text="El PACI de Martina ya fue aprobado por la educadora diferencial y está listo para tu visto bueno."
              action="Ver PACI"
              href="/revisiones/2"
            />
          </div>
        )}

        {/* Contexto: Expediente Vivo */}
        {isExpediente && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="bg-pacia-cyan/10 border border-pacia-cyan/20 rounded-xl p-4">
              <h4 className="text-xs font-bold text-pacia-cyan uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 size={14} /> Análisis de Contexto
              </h4>
              <p className="text-sm text-slate-300">
                Se detectaron coincidencias importantes entre el Informe Psicológico y la Evaluación Psicopedagógica.
              </p>
            </div>
            
            <SuggestionCard 
              type="insight"
              text="Ambos informes coinciden en la necesidad de aumentar los tiempos de evaluación (Adecuación de Acceso)."
              source="Informe Psicológico - Pág 4"
              author="Diego S. (Psicólogo)"
              date="14 Abr 2026"
              confidence="98%"
            />
            
            <SuggestionCard 
              type="warning"
              text="Falta el certificado médico actualizado del neurólogo para este año."
              action="Solicitar a Familia"
            />
          </div>
        )}

        {/* Contexto: Revisión PACI */}
        {isRevision && (
          <div className="space-y-4 animate-fade-in-up">
            <p className="text-sm text-slate-300">
              Mientras tomas decisiones, cruzaré tu PACI con las evidencias subidas por el equipo.
            </p>
            <SuggestionCard 
              type="insight"
              text="Sugerencia para Metas: 'Mejorar tolerancia a la frustración en matemáticas'."
              source="Eval. Psicopedagógica - Pág 2"
              author="María José V. (Ed. Diferencial)"
              date="10 Abr 2026"
              confidence="95%"
              action="Aplicar sugerencia"
              href="#"
            />
          </div>
        )}

        {/* Mensajes del Chat Interactivo */}
        {messages.length > 0 && (
          <div className="mt-6 space-y-4 border-t border-slate-700/50 pt-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-pacia-cyan text-slate-900 rounded-br-sm' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm p-4 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-pacia-cyan animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-pacia-cyan animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-pacia-cyan animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      
      {/* Footer IA */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
        <div className="relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Pregunta algo sobre el caso..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-pacia-cyan"
            disabled={isTyping}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isTyping || !inputValue.trim()}
            className="absolute right-2 top-2 w-8 h-8 bg-pacia-cyan rounded-lg flex items-center justify-center text-slate-900 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            <ArrowUpIcon size={16} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-3 px-2">
          PACIA AI es un copiloto basado en evidencia. La decisión final siempre es del equipo profesional.
        </p>
      </div>

    </div>
  );
}

function ArrowUpIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 7-7 7 7"/>
      <path d="M12 19V5"/>
    </svg>
  );
}

function SuggestionCard({ type, text, action, source, author, date, confidence, href, onClick }: any) {
  const isAlert = type === "alert" || type === "warning";
  const Icon = isAlert ? MessageSquareWarning : FileText;
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm relative overflow-hidden group">
      {isAlert && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
      
      <p className="text-sm text-slate-200 mb-3 leading-relaxed">{text}</p>
      
      {source && (
        <div className="flex flex-col mt-3 pt-3 border-t border-slate-700/50 gap-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded flex items-center gap-1 leading-tight max-w-[75%]">
              <Icon size={10} className="shrink-0" /> <span className="truncate" title={source}>{source}</span>
            </span>
            <span className="text-[10px] font-bold text-pacia-cyan shrink-0">IA: {confidence}</span>
          </div>
          {(author || date) && (
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium px-1">
              <span>{author ? `Subido por: ${author}` : ''}</span>
              <span>{date ? date : ''}</span>
            </div>
          )}
        </div>
      )}

      {action && href ? (
        <Link href={href} className="inline-flex text-xs font-bold text-pacia-cyan hover:text-white items-center gap-1 mt-3 transition-colors">
          {action} <ChevronRight size={14} />
        </Link>
      ) : action ? (
        <button onClick={onClick} className="text-xs font-bold text-pacia-cyan hover:text-white flex items-center gap-1 mt-3 transition-colors">
          {action} <ChevronRight size={14} />
        </button>
      ) : null}
    </div>
  );
}
