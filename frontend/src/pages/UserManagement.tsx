import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  ApiUser,
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from '@/lib/api';
import { User, UserRole } from '@/types';

const normalizeRole = (role: string | null | undefined): UserRole => {
  if (!role) return 'user';
  const cleaned = role.toLowerCase().replace(/[\s_-]+/g, '');
  if (cleaned === 'superadmin') return 'superadmin';
  if (cleaned === 'admin') return 'admin';
  return 'user';
};

const toApiRole = (role: UserRole): string => (role === 'superadmin' ? 'super_admin' : role);

interface FormState {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

const DEFAULT_FORM_STATE: FormState = {
  name: '',
  email: '',
  role: 'user',
  password: '',
};

const UserManagement: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const isSuperAdmin = user?.role === 'superadmin';

  const loadUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const apiUsers = await fetchUsers(token);
      const mapped = apiUsers.map<User>((apiUser: ApiUser) => ({
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: normalizeRole(apiUser.role),
      }));
      setUsers(mapped);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Chargement impossible',
        description: 'Une erreur est survenue lors de la recuperation des utilisateurs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateUser = () => {
    setEditingUserId(null);
    setFormState(DEFAULT_FORM_STATE);
    setIsDialogOpen(true);
  };

  const handleEditUser = (selected: User) => {
    setEditingUserId(selected.id);
    setFormState({
      name: selected.name,
      email: selected.email,
      role: selected.role,
      password: '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!token) return;
    setIsSubmitting(true);

    try {
      if (editingUserId) {
        await updateUser(
          editingUserId,
          {
            name: formState.name || undefined,
            email: formState.email || undefined,
            role: toApiRole(formState.role),
            ...(formState.password ? { password: formState.password } : {}),
          },
          token,
        );
        toast({
          title: 'Utilisateur modifie',
          description: `${formState.name} a ete mis a jour avec succes.`,
        });
      } else {
        const passwordToUse =
          formState.password.trim().length > 0 ? formState.password : 'TempPass123!';
        await createUser(
          {
            name: formState.name,
            email: formState.email,
            role: toApiRole(formState.role),
            password: passwordToUse,
          },
          token,
        );
        toast({
          title: 'Utilisateur cree',
          description: `${formState.name} a ete ajoute avec succes.`,
        });
      }
      setIsDialogOpen(false);
      setFormState(DEFAULT_FORM_STATE);
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Operation impossible',
        description: 'Veuillez verifier les informations saisies et reessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!token) return;
    try {
      await deleteUser(userId, token);
      toast({
        title: 'Utilisateur supprime',
        description: `${name} a ete retire avec succes.`,
        variant: 'destructive',
      });
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Suppression impossible',
        description: 'Une erreur est survenue lors de la suppression.',
        variant: 'destructive',
      });
    }
  };

  const roleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const roleLabel = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  };

  const totalUsers = useMemo(() => users.length, [users]);

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acces refuse</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions necessaires pour consulter cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Creez, modifiez et supprimez les comptes de la plateforme.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUserId ? "Modifier l'utilisateur" : 'Creer un utilisateur'}
              </DialogTitle>
              <DialogDescription>
                {editingUserId
                  ? 'Mettre a jour les informations de compte.'
                  : 'Ajouter un nouvel utilisateur a la plateforme.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="jean.dupont@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formState.role}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, role: value as UserRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe {editingUserId ? '(laisser vide pour conserver actuel)' : ''}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder={editingUserId ? 'Saisir un nouveau mot de passe' : 'TempPass123!'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {editingUserId ? 'Modifier' : 'Creer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Chargement en cours...'
              : `${totalUsers} utilisateur${totalUsers > 1 ? 's' : ''} enregistre${totalUsers > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(u.role)}>{roleLabel(u.role)}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditUser(u)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {u.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

