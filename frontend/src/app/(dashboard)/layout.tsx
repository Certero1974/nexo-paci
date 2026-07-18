import { Menu, Bell, ChevronDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import CopilotSidebar from "@/components/CopilotSidebar";
import TopBar from "@/components/TopBar";
import OnboardingTour from "@/components/OnboardingTour";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full h-full relative">
        <OnboardingTour />
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-nodes-pattern">
          
          {/* Top Header */}
          <TopBar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8 relative z-0">
            {children}
          </main>
          
        </div>
        
        <CopilotSidebar />
    </div>
  );
}

