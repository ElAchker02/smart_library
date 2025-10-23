import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Rediriger si déjà connecté
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userRole = await login(email, password);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans votre bibliothèque numérique',
      });
      
      // Redirection selon le rôle
      if (userRole === 'user') {
        navigate('/chat');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: 'Identifiants incorrects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Bibliothèque Numérique</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre espace documentaire intelligent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-accent rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Comptes de test :</p>
            <p className="text-xs text-muted-foreground">
              <strong>Super Admin :</strong> superadmin@biblio.com
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Admin :</strong> admin@biblio.com
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Utilisateur :</strong> user@biblio.com
            </p>
            <p className="text-xs text-muted-foreground italic">
              (Mot de passe : n'importe lequel)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
