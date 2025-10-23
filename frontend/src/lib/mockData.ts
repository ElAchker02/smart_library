import { User, Document } from '@/types';

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

export const mockDocuments: Document[] = [
  {
    id: 'doc1',
    title: 'Guide de démarrage React',
    description: 'Un guide complet pour débuter avec React et TypeScript',
    filename: 'react-guide.pdf',
    language: 'Français',
    category: 'Développement',
    uploadDate: '2024-01-15',
    isPublic: true,
    userId: '2',
    status: 'ready',
    pageCount: 45
  },
  {
    id: 'doc2',
    title: 'Introduction à l\'Intelligence Artificielle',
    description: 'Concepts fondamentaux de l\'IA et du Machine Learning',
    filename: 'ia-introduction.pdf',
    language: 'Français',
    category: 'IA',
    uploadDate: '2024-01-20',
    isPublic: true,
    userId: '2',
    status: 'ready',
    pageCount: 78
  },
  {
    id: 'doc3',
    title: 'Architecture Microservices',
    description: 'Patterns et bonnes pratiques pour les microservices',
    filename: 'microservices.pdf',
    language: 'Français',
    category: 'Architecture',
    uploadDate: '2024-02-01',
    isPublic: true,
    userId: '2',
    status: 'ready',
    pageCount: 120
  },
  {
    id: 'doc4',
    title: 'Bases de données NoSQL',
    description: 'Comprendre MongoDB, Redis et les bases documentaires',
    filename: 'nosql.pdf',
    language: 'Français',
    category: 'Données',
    uploadDate: '2024-02-10',
    isPublic: true,
    userId: '2',
    status: 'ready',
    pageCount: 65
  }
];
