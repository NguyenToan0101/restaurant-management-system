import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  Grid2X2,
  ReceiptText,
  Users,
  Tag,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuthQueries";

const menuItems = [
  { title: "Overview", description: "Dashboard summary", url: "", icon: LayoutDashboard },
  { title: "Branch Info", description: "Branch details", url: "/branch", icon: Store },
  { title: "Tables", description: "Table management", url: "/tables", icon: Grid2X2 },
  { title: "Menu", description: "Menu management", url: "/menu", icon: UtensilsCrossed },
  { title: "Bills", description: "View bill history", url: "/bills", icon: ReceiptText },
  { title: "Staff", description: "Staff management", url: "/staff", icon: Users },
  { title: "Promotions", description: "Manage promotions", url: "/promotions", icon: Tag },
];

export function ManagerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const staffInfo = useAuthStore((state) => state.staffInfo);
  const logout = useLogout();

  const basePath = `/dashboard/manager`;

  const isActive = (url: string) => {
    const fullPath = `${basePath}${url}`;
    return url === ""
      ? location.pathname === basePath || location.pathname === `${basePath}/`
      : location.pathname.startsWith(fullPath);
  };

  const handleSignOut = async () => {
    await logout.mutateAsync();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <div className="flex items-center gap-3 h-16 py-4 px-2 mb-2">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 w-full">
              <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-base font-bold tracking-tight text-foreground truncate">
                  BentoX
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Manager Portal
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 mt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-14 mb-1"
                  >
                    <NavLink
                      to={`${basePath}${item.url}`}
                      end={item.url === ""}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent/50 rounded-lg transition-all"
                      activeClassName="bg-sidebar-accent/80 text-primary border-l-[4px] border-primary"
                    >
                      <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.url) ? 'text-primary' : ''}`} />
                      {!collapsed && (
                        <div className="flex flex-col flex-1 overflow-hidden h-full justify-center">
                          <span className={`text-sm truncate leading-tight ${isActive(item.url) ? 'font-bold text-primary' : 'font-semibold'}`}>
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto px-4 py-4 border-t border-sidebar-border gap-2 flex flex-col">
        {!collapsed ? (
          <div className="flex flex-col gap-4">
            {/* User Info block */}
            <div className="flex items-center gap-3 px-1 py-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                {staffInfo?.username?.charAt(0).toUpperCase() || "M"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-foreground truncate">
                  {staffInfo?.username || "Manager"}
                </span>
                <span className="text-[10px] font-bold bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full w-fit mt-1">
                  {staffInfo?.role || "BRANCH_MANAGER"}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors w-full text-left bg-muted/30"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold truncate">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
              {staffInfo?.username?.charAt(0).toUpperCase() || "M"}
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors flex items-center justify-center bg-muted/30"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 shrink-0" />
            </button>
          </div>
        )}

        <div className="pt-2 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </Sidebar>
  );
}
