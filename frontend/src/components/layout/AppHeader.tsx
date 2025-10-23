import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Déconnexion réussie',
      description: 'À bientôt !',
    });
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-10 flex items-center justify-between px-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Bienvenue, {user?.name}
        </h2>
        <p className="text-sm text-muted-foreground capitalize">
          {user?.role === 'superadmin' ? 'Super Administrateur' : 
           user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
        </p>
      </div>
      <Button variant="ghost" onClick={handleLogout} className="gap-2">
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </Button>
    </header>
  );
};

export default AppHeader;
