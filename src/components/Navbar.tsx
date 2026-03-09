import { Bell, Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface NavbarProps { title?: string }

const Navbar = ({ title = "Dashboard" }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "MC";

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-display font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm">
          <Search className="w-4 h-4" />
          <span>Quick search...</span>
          <kbd className="ml-2 text-xs bg-card px-1.5 py-0.5 rounded border">⌘K</kbd>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(!notifOpen)}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full gradient-danger" />
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold leading-none">{user?.username}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="font-medium">Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
