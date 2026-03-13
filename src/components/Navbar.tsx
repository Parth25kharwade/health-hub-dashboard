import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileSheet from "@/components/ProfileSheet";
import SettingsSheet from "@/components/SettingsSheet";
import SearchModal from "@/components/SearchModal";
import NotificationBell from "@/components/NotificationBell";

interface NavbarProps { title?: string }

const Navbar = ({ title = "Dashboard" }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = (user?.fullName ?? "MC").slice(0, 2).toUpperCase();

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 bg-card border-b shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-display font-semibold text-foreground">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar — clickable */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm
              hover:bg-muted/80 hover:text-foreground transition-colors border border-transparent hover:border-border"
          >
            <Search className="w-4 h-4" />
            <span>Quick search...</span>
            <kbd className="ml-2 text-xs bg-card px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </button>

          {/* Notification Bell */}
          <NotificationBell open={notifOpen} onOpenChange={setNotifOpen} />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold leading-none">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="font-medium cursor-pointer" onClick={() => setProfileOpen(true)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSettingsOpen(true)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Modals / Sheets */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onProfile={() => { setSearchOpen(false); setProfileOpen(true); }}
        onSettings={() => { setSearchOpen(false); setSettingsOpen(true); }}
      />
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Navbar;
