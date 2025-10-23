import { User } from '@/types';

// Comptes de test
export const mockSuperAdmin: User = {
  id: '1',
  email: 'superadmin@biblio.com',
  name: 'Sophie Rousseau',
  role: 'superadmin'
};

export const mockAdmin: User = {
  id: '2',
  email: 'admin@biblio.com',
  name: 'Marie Martin',
  role: 'admin'
};

export const mockUser: User = {
  id: '3',
  email: 'user@biblio.com',
  name: 'Jean Dupont',
  role: 'user'
};

export const allMockUsers = [mockSuperAdmin, mockAdmin, mockUser];

