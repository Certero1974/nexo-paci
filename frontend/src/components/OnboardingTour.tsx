"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Step } from "react-joyride";
import { STATUS } from "react-joyride";

const Joyride = dynamic(() => import("react-joyride").then(mod => mod.Joyride as any), { ssr: false }) as any;

export default function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const handleStartTour = () => setRun(true);
    window.addEventListener("start-pacia-tour", handleStartTour);

    const tourCount = parseInt(localStorage.getItem("pacia_tour_count") || "0");
    if (tourCount < 2) {
      setTimeout(() => {
        setRun(true);
        localStorage.setItem("pacia_tour_count", (tourCount + 1).toString());
      }, 500);
    }

    return () => window.removeEventListener("start-pacia-tour", handleStartTour);
  }, []);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="text-left">
          <h2 className="text-xl font-bold mb-2 text-brand-deep">¡Bienvenido a PACiA!</h2>
          <p className="text-sm text-gray-600">El nuevo ecosistema PIE donde el centro es el estudiante, no el papel. Haremos un recorrido rápido de 30 segundos.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".tour-dashboard-tasks",
      content: (
        <div className="text-left">
          <h3 className="font-bold mb-1 text-brand-deep">Tu nuevo escritorio</h3>
          <p className="text-sm text-gray-600">Aquí solo verás las tareas urgentes que te corresponden según tu rol. Se acabó el perder tiempo buscando qué hacer.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".tour-menu-estudiantes",
      content: (
        <div className="text-left">
          <h3 className="font-bold mb-1 text-brand-deep">Estudiantes</h3>
          <p className="text-sm text-gray-600">El corazón del sistema. En lugar de crear un PACI desde cero, aquí buscarás a tu estudiante, revisarás su expediente, y la IA redactará el documento por ti al final del proceso.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".tour-menu-revisiones",
      content: (
        <div className="text-left">
          <h3 className="font-bold mb-1 text-brand-deep">Revisiones Colaborativas</h3>
          <p className="text-sm text-gray-600">Aquí podrás ver los borradores de PACI y validarlos junto a tu equipo de forma remota. ¡Menos papeleo, más inclusión!</p>
        </div>
      ),
      placement: "right",
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Si el usuario lo termina o lo salta explícitamente, no se lo mostramos más automáticamente
      localStorage.setItem("pacia_tour_count", "2");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#00B9DB', // pacia-cyan
          textColor: '#333',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#00B9DB',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          marginRight: '8px',
          color: '#666'
        },
        buttonSkip: {
          color: '#999'
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        }
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar tour',
      }}
    />
  );
}
