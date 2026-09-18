import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Clock,
  Building2,
  UserCog,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  onLogout: () => void;
}

const navItems = [
  { to: "/", label: "nav.dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "nav.leads", icon: Users, hideFor: ["student"] },
  { to: "/students", label: "nav.students", icon: GraduationCap, hideFor: ["student"] },
  { to: "/courses", label: "nav.courses", icon: BookOpen },
  { to: "/groups", label: "nav.groups", icon: CalendarDays },
  { to: "/sessions", label: "nav.sessions", icon: Clock },
  { to: "/branches", label: "nav.branches", icon: Building2 },
  { to: "/users", label: "nav.users", icon: UserCog, hideFor: ["student"] },
  { to: "/roles", label: "nav.roles", icon: ShieldCheck, hideFor: ["student"] },
];

export function Sidebar({ open, onClose, isMobile, onLogout }: SidebarProps) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const { user } = useAuth();

  // استخراج الصلاحيات بأمان
  const userRoles: string[] = Array.isArray((user as any)?.roles)
    ? (user as any).roles
    : (user as any)?.role
    ? [(user as any).role]
    : [];

  const visibleItems = navItems.filter((item) => {
    if (!item.hideFor) return true;
    return !item.hideFor.some((hiddenRole) => userRoles.includes(hiddenRole));
  });

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300 h-full",
        isMobile
          ? cn("fixed inset-y-0 left-0 z-50 w-64", open ? "translate-x-0" : "-translate-x-full")
          : cn("w-64", !open && "w-0 overflow-hidden border-r-0")
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <span className="text-lg font-bold text-primary">TMS</span>
        {isMobile && (
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{t(item.label)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t("auth.logout")}</span>
        </button>
      </div>
    </aside>
  );
}