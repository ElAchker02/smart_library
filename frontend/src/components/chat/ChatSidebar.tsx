import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, LayoutDashboard, BookOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

const mockConversations = [
  { id: 1, title: 'Question sur le rapport annuel', date: '2024-01-15' },
  { id: 2, title: 'Analyse des données financières', date: '2024-01-14' },
  { id: 3, title: 'Résumé de la documentation technique', date: '2024-01-13' },
  { id: 4, title: 'Questions sur les procédures', date: '2024-01-12' },
];

const ChatSidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Bibliothèque IA</h2>
            <p className="text-xs text-muted-foreground">{user?.name}</p>
          </div>
        </div>
        <Button className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="py-2 space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-3 py-2">Historique</p>
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors group"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">{conv.date}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border space-y-2">
        <Link to="/dashboard">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Mon Dashboard
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive" 
          size="sm"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};

export default ChatSidebar;
