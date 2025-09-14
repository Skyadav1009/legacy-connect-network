import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  MessageCircle, 
  Calendar,
  Briefcase,
  BookOpen,
  Settings,
  LogOut,
  User,
  UserCheck,
  GraduationCap,
  Building2,
  Shield,
  Menu,
  Bell
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = {
  common: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Feed", url: "/feed", icon: MessageCircle },
    { title: "Messages", url: "/messages", icon: MessageCircle },
    { title: "Events", url: "/events", icon: Calendar },
    { title: "Directory", url: "/directory", icon: Users },
  ],
  student: [
    { title: "Jobs", url: "/jobs", icon: Briefcase },
    { title: "Mentorship", url: "/mentorship", icon: BookOpen },
  ],
  alumni: [
    { title: "Mentorship", url: "/mentorship", icon: BookOpen },
  ],
  faculty: [
    { title: "Students", url: "/students", icon: GraduationCap },
  ],
  employer: [
    { title: "Jobs", url: "/jobs", icon: Briefcase },
    { title: "Applications", url: "/applications", icon: User },
  ],
  admin: [
    { title: "User Management", url: "/admin/users", icon: Shield },
    { title: "Analytics", url: "/admin/analytics", icon: Settings },
  ]
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "w-full justify-start transition-all duration-300",
      isActive 
        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg border-l-4 border-sidebar-ring" 
        : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    );

  const roleItems = user?.role ? navItems[user.role as keyof typeof navItems] || [] : [];
  const allItems = [...navItems.common, ...roleItems];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error handled in context
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return GraduationCap;
      case 'alumni': return UserCheck;
      case 'faculty': return BookOpen;
      case 'employer': return Building2;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const RoleIcon = user?.role ? getRoleIcon(user.role) : User;

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">LegacyLink</h1>
                <p className="text-xs text-sidebar-foreground/70">Alumni Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                <RoleIcon className="h-5 w-5 text-accent-foreground" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 capitalize">
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">
              {collapsed ? "" : "Navigation"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                {allItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavCls}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="ml-3">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <NavLink to="/profile">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed ? "px-0" : ""
              )}
              title={collapsed ? "Profile" : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">Profile</span>}
            </Button>
          </NavLink>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive",
              collapsed ? "px-0" : ""
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}