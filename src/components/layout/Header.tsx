import { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user } = useAuth();
  const [unreadCount] = useState(3); // This would come from API

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-foreground hover:bg-accent hover:text-accent-foreground" />
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alumni, posts, events..."
              className="w-64 pl-10"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[1.25rem]"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                <div className="font-medium">New mentorship request</div>
                <div className="text-sm text-muted-foreground">
                  John Doe wants to connect with you for career guidance
                </div>
                <div className="text-xs text-muted-foreground">2 minutes ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                <div className="font-medium">Event reminder</div>
                <div className="text-sm text-muted-foreground">
                  Alumni networking event starts in 1 hour
                </div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                <div className="font-medium">Job application update</div>
                <div className="text-sm text-muted-foreground">
                  Your application for Backend Engineer has been reviewed
                </div>
                <div className="text-xs text-muted-foreground">3 hours ago</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User info */}
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}