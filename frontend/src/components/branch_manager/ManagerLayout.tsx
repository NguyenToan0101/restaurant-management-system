import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ManagerSidebar } from "./ManagerSidebar";

interface ManagerLayoutProps {
  children: ReactNode;
}

const ManagerLayout = ({ children }: ManagerLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ManagerSidebar />
        <main className="flex-1 bg-background overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManagerLayout;
