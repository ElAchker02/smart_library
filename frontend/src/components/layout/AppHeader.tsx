import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Deconnexion reussie',
      description: 'A bientot !',
    });
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-card px-4 py-4 sm:px-6 md:flex-row md:h-16 md:items-center md:justify-between md:px-8">
      <div className="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => onToggleSidebar?.()}
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Bienvenue, {user?.name}
          </h2>
          <p className="text-sm text-muted-foreground capitalize">
            {user?.role === 'superadmin' ? 'Super Administrateur' :
             user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="gap-2 justify-center md:justify-start w-full md:w-auto"
      >
        <LogOut className="w-4 h-4" />
        Se deconnecter
      </Button>
    </header>
  );
};

export default AppHeader;
