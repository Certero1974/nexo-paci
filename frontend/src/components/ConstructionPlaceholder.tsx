import { Rocket, Construction } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

export default function ConstructionPlaceholder({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
      <div className="w-24 h-24 bg-pacia-cyan/10 rounded-full flex items-center justify-center mb-6 relative">
        <Construction size={48} className="text-pacia-cyan relative z-10" />
        <div className="absolute inset-0 bg-pacia-cyan/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      
      <h2 className="text-3xl font-bold font-[DIN Alternate] text-[#0D1B3D] mb-3 uppercase tracking-wide">
        Módulo en Optimización
      </h2>
      <h3 className="text-xl font-semibold text-slate-700 mb-4">{title}</h3>
      
      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      
      <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 font-medium">
        <Rocket size={16} className="text-pacia-indigo" />
        Disponible en la próxima fase del MVP
      </div>
    </div>
  );
}
