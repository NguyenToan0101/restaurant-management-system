import { Link, useParams, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Users, Settings,
  Store, ChevronLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { mockRestaurants } from "@/data/MockData";

const menuItems = [
  { title: "Overview", url: "", icon: LayoutDashboard },
  { title: "Menu Management", url: "/menu", icon: UtensilsCrossed },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Staff", url: "/staff", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { id } = useParams<{ id: string }>();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const restaurant = mockRestaurants.find((r) => r.id === id);
  const location = useLocation();

  const basePath = `/dashboard/${id}`;

  const isActive = (url: string) => {
    const fullPath = `${basePath}${url}`;
    return url === ""
      ? location.pathname === basePath || location.pathname === `${basePath}/`
      : location.pathname.startsWith(fullPath);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border shrink-0">
        {!collapsed && (
          <>
            <Link to="/dashboard" className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="w-7 h-7 rounded-md bg-sidebar-accent flex items-center justify-center text-base">
              {restaurant?.logo ?? "🍽"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{restaurant?.name}</p>
              <p className="text-[11px] text-sidebar-foreground/50">{restaurant?.cuisine}</p>
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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={`${basePath}${item.url}`}
                      end={item.url === ""}
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
