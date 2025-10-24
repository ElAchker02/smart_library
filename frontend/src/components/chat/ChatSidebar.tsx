import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-full md:w-72 bg-card border-b md:border-b-0 md:border-r border-border flex flex-col md:h-screen">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Assistant documentaire</h2>
            <p className="text-xs text-muted-foreground truncate">{user?.name}</p>
          </div>
        </div>
        <Button className="w-full gap-2" size="sm" onClick={onNewConversation}>
          <Plus className="w-4 h-4" />
          Nouvelle conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="py-3 space-y-1">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md transition-colors',
                  selectedConversationId === conversation.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-sm',
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.lastActivity || conversation.startedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground px-3">Commencez une nouvelle discussion.</p>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border grid gap-2 sm:grid-cols-2 md:grid-cols-1">
        <Link to="/dashboard" className="sm:col-span-1">
          <Button variant="outline" className="w-full justify-start gap-2" size="sm">
            <LayoutDashboard className="w-4 h-4" />
            Mon tableau de bord
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          size="sm"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Deconnexion
        </Button>
      </div>
    </aside>
  );
};

export default ChatSidebar;

