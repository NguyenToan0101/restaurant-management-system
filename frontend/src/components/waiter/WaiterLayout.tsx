import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import WaiterSidebar from "./WaiterSidebar";

const WaiterLayout = () => {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <WaiterSidebar />
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    );
};

export default WaiterLayout;