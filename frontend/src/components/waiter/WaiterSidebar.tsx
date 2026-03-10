import { useLocation, useNavigate } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuthQueries";
import {
    UtensilsCrossed,
    Table,
    ShoppingCart,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const WaiterSidebar = () => {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();
    const navigate = useNavigate();
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const logout = useLogout();

    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
            navigate("/staff-login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const menuItems = [
        {
            title: "Dashboard",
            icon: UtensilsCrossed,
            url: "/waiter/dashboard",
            isActive: location.pathname === "/waiter/dashboard",
        },
        {
            title: "Tables",
            icon: Table,
            url: "/waiter/tables",
            isActive: location.pathname.startsWith("/waiter/tables"),
        },
        {
            title: "Orders",
            icon: ShoppingCart,
            url: "/waiter/orders",
            isActive: location.pathname.startsWith("/waiter/orders"),
        },
    ];

    return (
        <Sidebar collapsible="icon" className="border-r border-border/60">
            <SidebarHeader className="border-b border-border/60 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-sm truncate">Waiter</h2>
                            <p className="text-xs text-muted-foreground truncate">
                                {staffInfo?.username}
                            </p>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="p-2">
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                onClick={() => navigate(item.url)}
                                className={item.isActive ? "bg-primary/10 text-primary" : ""}
                            >
                                <item.icon className="w-4 h-4" />
                                {!collapsed && <span>{item.title}</span>}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/60 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="w-8 h-8"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
};

export default WaiterSidebar;