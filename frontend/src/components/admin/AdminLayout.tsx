import { Link, useLocation, Outlet } from "react-router-dom";
import { BarChart3, Package, Users, ChevronLeft, Shield } from "lucide-react";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";

const adminMenuItems = [
  { title: "Statistics", url: "/admin/dashboard/statistics", icon: BarChart3 },
  { title: "Packages", url: "/admin/dashboard/packages", icon: Package },
  { title: "Users", url: "/admin/dashboard/users", icon: Users },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border shrink-0">
        {!collapsed && (
          <>
            <Link to="/" className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="w-7 h-7 rounded-md bg-sidebar-accent flex items-center justify-center">
              <Shield className="w-4 h-4 text-sidebar-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Admin Panel</p>
              <p className="text-[11px] text-sidebar-foreground/50">System Management</p>
            </div>
          </>
        )}
        <SidebarTrigger className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-3 border-t border-sidebar-border flex items-center justify-center">
        <ThemeToggle />
      </div>
    </Sidebar>
  );
}

interface AdminLayoutProps {}

const AdminLayout = ({}: AdminLayoutProps) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AdminSidebar />
      <main className="flex-1 bg-background overflow-auto">
        <Outlet />
      </main>
    </div>
  </SidebarProvider>
);

export default AdminLayout;
