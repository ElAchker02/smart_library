import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Download, Paperclip, Send } from 'lucide-react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Conversation, ChatMessage } from '@/types';
import {
  ApiConversation,
  ApiMessage,
  createConversation,
  fetchConversations,
  fetchMessages,
  sendMessage,
  uploadDocument,
} from '@/lib/api';

const mapConversation = (conversation: ApiConversation): Conversation => ({
  id: conversation.id,
  title: conversation.title,
  mode: conversation.mode,
  isActive: conversation.is_active,
  startedAt: conversation.started_at,
  lastActivity: conversation.last_activity,
});

const mapMessage = (message: ApiMessage): ChatMessage => ({
  id: message.id,
  conversationId: message.conversation,
  sender: message.sender,
  content: message.content,
  createdAt: message.created_at,
});

const UserChat: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchConversations(token);
      const mapped = data.map(mapConversation).sort(
        (a, b) =>
          new Date(b.lastActivity || b.startedAt).getTime() -
          new Date(a.lastActivity || a.startedAt).getTime(),
      );
      setConversations(mapped);
      if (!selectedConversationId && mapped.length > 0) {
        setSelectedConversationId(mapped[0].id);
      }
      if (mapped.length === 0) {
        const newConversation = await createConversation({}, token);
        const mappedConversation = mapConversation(newConversation);
        setConversations([mappedConversation]);
        setSelectedConversationId(mappedConversation.id);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Chargement des conversations impossible',
        description: 'Une erreur est survenue lors de la recuperation de vos conversations.',
        variant: 'destructive',
      });
    }
  }, [token, selectedConversationId, toast]);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchMessages(token);
      setMessages(data.map(mapMessage));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Chargement des messages impossible',
        description: 'Une erreur est survenue lors de la recuperation des messages.',
        variant: 'destructive',
      });
    }
  }, [token, toast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleNewConversation = async () => {
    if (!token) return;
    try {
      const conversation = await createConversation(
        {
          title: `Nouvelle conversation ${new Date().toLocaleString('fr-FR')}`,
          mode: 'personal',
        },
        token,
      );
      const mappedConversation = mapConversation(conversation);
      setConversations((prev) => [mappedConversation, ...prev]);
      setSelectedConversationId(mappedConversation.id);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Creation impossible',
        description: 'La conversation na pas pu etre creee.',
        variant: 'destructive',
      });
    }
  };

  const conversationMessages = useMemo(() => {
    if (!selectedConversationId) return [];
    return messages
      .filter((message) => message.conversationId === selectedConversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, selectedConversationId]);

  const handleSend = async () => {
    if (!token || !selectedConversationId || !input.trim()) return;
    setIsSending(true);
    try {
      const message = await sendMessage(
        { conversation: selectedConversationId, sender: 'user', content: input.trim() },
        token,
      );
      setMessages((prev) => [...prev, mapMessage(message)]);
      setInput('');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Envoi impossible',
        description: 'Votre message na pas pu etre envoye.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    try {
      await uploadDocument(
        {
          file,
          title: file.name.replace(/\.[^.]+$/, ''),
          source: 'personal',
          language: 'fr',
        },
        token,
      );
      toast({
        title: 'Document ajoute',
        description: `${file.name} est maintenant disponible dans votre bibliotheque personnelle.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Upload impossible',
        description: 'Une erreur est survenue pendant le televersement.',
        variant: 'destructive',
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleDownload = (message: ChatMessage) => {
    toast({
      title: 'Fonction a implementer',
      description: "La consultation du document depuis le chat sera bientot disponible.",
    });
    console.info('Message content for download:', message.content);
  };

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4">
          <h1 className="text-xl font-semibold">Assistant IA</h1>
          <p className="text-sm text-muted-foreground">
            Vos conversations sont synchronisees avec vos documents personnels.
          </p>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {conversationMessages.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Commencez une conversation en envoyant votre premiere question.
              </Card>
            ) : (
              conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`max-w-[80%] p-4 space-y-3 ${
                      message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70">
                      Envoye le {new Date(message.createdAt).toLocaleString('fr-FR')}
                    </div>
                    {message.sender === 'assistant' && (
                      <Button
                        variant={message.sender === 'user' ? 'secondary' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownload(message)}
                      >
                        <Download className="w-4 h-4" />
                        Voir la source
                      </Button>
                    )}
                  </Card>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Ajouter un document"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..."
              className="flex-1"
              disabled={!selectedConversationId}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isSending || !selectedConversationId}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChat;

