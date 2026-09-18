import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
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
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  onLogout: () => void;
}

const navItems = [
  { to: '/', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'nav.leads', icon: Users, roles: ['super_admin', 'branch_manager', 'sales'] },
  { to: '/students', label: 'nav.students', icon: GraduationCap, roles: ['super_admin', 'branch_manager', 'sales', 'finance', 'academic', 'teacher'] },
  { to: '/courses', label: 'nav.courses', icon: BookOpen },
  { to: '/groups', label: 'nav.groups', icon: CalendarDays, roles: ['super_admin', 'academic', 'branch_manager', 'teacher'] },
  { to: '/sessions', label: 'nav.sessions', icon: Clock, roles: ['super_admin', 'academic', 'branch_manager', 'teacher'] },
  { to: '/branches', label: 'nav.branches', icon: Building2, roles: ['super_admin', 'branch_manager'] },
  { to: '/users', label: 'nav.users', icon: UserCog, roles: ['super_admin', 'branch_manager', 'hr'] },
  { to: '/roles', label: 'nav.roles', icon: ShieldCheck, roles: ['super_admin'] },
];

export function Sidebar({ open, onClose, isMobile, onLogout }: SidebarProps) {
  const { t } = useTranslation('common');
  const location = useLocation();
  const { user } = useAuth();

  const userRoles = user?.roles ?? (user?.role ? [user.role] : []);
  const isSuperAdmin = userRoles.includes('super_admin');

  const visibleItems = navItems.filter((item) =>
    !item.roles || isSuperAdmin || item.roles.some((role) => userRoles.includes(role)),
  );

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300 h-full',
        isMobile
          ? cn('fixed inset-y-0 left-0 z-50 w-64', open ? 'translate-x-0' : '-translate-x-full')
          : cn('w-64', !open && 'w-0 overflow-hidden border-r-0'),
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
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
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
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
