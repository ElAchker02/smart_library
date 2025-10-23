import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, MessageSquare } from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    // Simuler une recherche
    if (query.trim()) {
      setResults([
        {
          id: '1',
          documentTitle: 'Guide de démarrage React',
          excerpt: 'React est une bibliothèque JavaScript pour créer des interfaces utilisateur...',
          score: 0.95,
          source: 'general',
          page: 12
        },
        {
          id: '2',
          documentTitle: 'Introduction à l\'IA',
          excerpt: 'L\'intelligence artificielle est un domaine de l\'informatique qui vise à créer des machines...',
          score: 0.87,
          source: 'general',
          page: 5
        }
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Recherche Intelligente</h1>
        <p className="text-muted-foreground">
          Recherchez dans vos documents avec des mots-clés ou des questions en langage naturel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Effectuer une recherche</CardTitle>
          <CardDescription>
            Utilisez des mots-clés ou posez une question pour trouver des informations pertinentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={searchScope} onValueChange={setSearchScope}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Toutes les bibliothèques</TabsTrigger>
              <TabsTrigger value="general">Bibliothèque Générale</TabsTrigger>
              <TabsTrigger value="personal">Ma Bibliothèque</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Ex: Comment créer un composant React ? ou architecture microservices..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
            </h2>
          </div>

          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{result.documentTitle}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={result.source === 'general' ? 'default' : 'secondary'}>
                          {result.source === 'general' ? 'Bibliothèque Générale' : 'Ma Bibliothèque'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Page {result.page}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">
                      {(result.score * 100).toFixed(0)}% pertinent
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{result.excerpt}</p>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ouvrir dans le Chat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Aucun résultat trouvé</p>
            <p className="text-sm text-muted-foreground mt-2">
              Essayez avec d'autres termes de recherche
            </p>
          </CardContent>
        </Card>
      )}

      {!query && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Commencez votre recherche
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Saisissez des mots-clés ou une question pour trouver des informations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;
