import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Container con Bisel/Sombra profunda */}
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-t-8 border-red-600 w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 border-2 border-red-200">
               <AlertTriangle size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">{title}</h3>
          </div>
          
          <p className="text-slate-900 font-bold text-base mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3 justify-end bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-100">
            <button 
              onClick={onClose} 
              className="px-5 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }} 
              className="px-5 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-[0_4px_14px_0_rgb(220,38,38,0.39)] transition-colors"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
