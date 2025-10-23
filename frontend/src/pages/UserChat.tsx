import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    excerpt: string;
    page?: number;
  }>;
}

const UserChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Bonjour ! Je suis votre assistant IA. Posez-moi des questions sur vos documents ou la bibliothèque générale.",
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input,
    };

    const assistantMessage: Message = {
      id: messages.length + 2,
      role: 'assistant',
      content: "Voici les informations trouvées dans vos documents concernant votre question.",
      sources: [
        {
          title: "Rapport_annuel_2023.pdf",
          excerpt: "Le chiffre d'affaires a augmenté de 15% par rapport à l'année précédente, atteignant 2.3 millions d'euros...",
          page: 12,
        },
        {
          title: "Guide_procedures.pdf",
          excerpt: "La procédure standard nécessite l'approbation de deux responsables avant la validation finale...",
          page: 8,
        }
      ]
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  const handleFileUpload = () => {
    // Mock file upload
    console.log('Upload document');
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4">
          <h1 className="text-xl font-semibold">Assistant IA</h1>
          <p className="text-sm text-muted-foreground">Posez vos questions sur vos documents</p>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-[80%] p-4 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">Sources :</p>
                      {message.sources.map((source, idx) => (
                        <Card key={idx} className="p-3 bg-accent/50">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{source.title}</p>
                              {source.page && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Page {source.page}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{source.excerpt}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              Visualiser
                            </Button>
                            <Button size="sm" variant="default" className="text-xs h-7">
                              Chatter avec ce document
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFileUpload}
              title="Ajouter un document"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
