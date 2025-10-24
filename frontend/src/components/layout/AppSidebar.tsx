import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  LayoutDashboard,
  Library,
  FolderOpen,
  Search,
  Users,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface AppSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isMobileOpen = false, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isUser = user?.role === 'user';
  const isSuperAdmin = user?.role === 'superadmin';

  const userMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: FolderOpen, label: 'Ma bibliotheque', path: '/my-library' },
    { icon: Search, label: 'Recherche', path: '/search' },
  ];

  const adminMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Library, label: 'Bibliotheque generale', path: '/general-library' },
    { icon: FolderOpen, label: 'Ma bibliotheque', path: '/my-library' },
    { icon: Search, label: 'Recherche', path: '/search' },
  ];

  const superAdminMenuItems: MenuItem[] = [
    ...adminMenuItems,
    { icon: ShieldCheck, label: 'Validation documents', path: '/approvals' },
  ];

  const menuItems = isUser ? userMenuItems : isSuperAdmin ? superAdminMenuItems : adminMenuItems;

  const SidebarContent = (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">Bibliotheque</h1>
            <p className="text-xs text-muted-foreground">Espace documentaire intelligent</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
              )}
              onClick={onClose}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {isSuperAdmin && (
          <Link
            to="/users"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
              location.pathname === '/users'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
            )}
            onClick={onClose}
          >
            <Users className="w-5 h-5" />
            <span>Gestion utilisateurs</span>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen">
        {SidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            role="button"
            aria-label="Fermer le menu"
            tabIndex={-1}
          />
          <div className="relative h-full">
            {SidebarContent}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-sidebar-foreground"
              onClick={onClose}
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppSidebar;
