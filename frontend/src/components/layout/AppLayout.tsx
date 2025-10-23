import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import FloatingNavButton from '@/components/ui/floating-nav-button';

const AppLayout = () => {
  const { user, isLoading } = useAuth();
  const canShowChat = ['user', 'admin', 'superadmin'].includes(user?.role ?? 'user');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      {canShowChat && (
        <FloatingNavButton 
          to="/chat" 
          icon={MessageSquare} 
          label="Chat IA"
        />
      )}
      <div className="ml-64">
        <AppHeader />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

