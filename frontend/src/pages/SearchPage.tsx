import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon, FileText, MessageSquare, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Document, SearchResult } from '@/types';
import { ApiDocument, ApiTag, fetchDocuments, fetchTags } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const SearchPage: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'general' | 'personal'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tagMap, setTagMap] = useState<Record<number, string>>({});

  const mapDocument = useCallback(
    (doc: ApiDocument): Document => ({
      id: doc.id,
      title: doc.title,
      filename: doc.filename,
      file: doc.file,
      language: doc.language ?? 'N/A',
      source: doc.source,
      status: doc.status,
      dateAdded: doc.date_added,
      owner: doc.owner,
      tagId: doc.tag,
      tagName: doc.tag ? tagMap[doc.tag] ?? undefined : undefined,
      path: doc.path ?? undefined,
    }),
    [tagMap],
  );

  const loadTags = useCallback(async () => {
    if (!token) return;
    try {
      const tags = await fetchTags(token);
      const map = tags.reduce<Record<number, string>>((acc, tag: ApiTag) => {
        acc[tag.id] = tag.name;
        return acc;
      }, {});
      setTagMap(map);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const loadDocuments = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchDocuments(token);
      setDocuments(data.map(mapDocument));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Chargement impossible',
        description: 'La recuperation des documents a echoue.',
        variant: 'destructive',
      });
    }
  }, [token, mapDocument, toast]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const scopedDocuments = useMemo(() => {
    if (!user) return [];
    switch (searchScope) {
      case 'general':
        return documents.filter((doc) => doc.source === 'general');
      case 'personal':
        return documents.filter((doc) => doc.source === 'personal' && doc.owner === user.id);
      default:
        return documents.filter(
          (doc) => doc.source === 'general' || (doc.source === 'personal' && doc.owner === user.id),
        );
    }
  }, [documents, searchScope, user]);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const normalized = query.trim().toLowerCase();
    setIsSearching(true);

    const filtered = scopedDocuments
      .filter((doc) => {
        const tag = doc.tagName ?? (doc.tagId !== null ? `Tag ${doc.tagId}` : '');
        const haystack = [
          doc.title,
          doc.filename ?? '',
          doc.language ?? '',
          tag ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalized);
      })
      .map<SearchResult>((doc) => ({
        documentId: doc.id,
        documentTitle: doc.title,
        filename: doc.filename,
        language: doc.language,
        source: doc.source,
        status: doc.status,
        dateAdded: doc.dateAdded,
        tagName: doc.tagName,
        file: doc.file ?? doc.path ?? undefined,
      }));

    setResults(filtered);
    setIsSearching(false);
  };

  const openDocument = (result: SearchResult) => {
    if (result.file) {
      window.open(result.file, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Fichier indisponible',
        description: "Ce document n'a pas encore de fichier accessible.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Recherche intelligente</h1>
        <p className="text-muted-foreground">
          Parcourez vos documents personnels ou la bibliotheque generale a partir dun mot-cle.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Effectuer une recherche</CardTitle>
          <CardDescription>
            Saisissez un titre, un tag ou un mot-cle pour trouver rapidement vos documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={searchScope} onValueChange={(value) => setSearchScope(value as typeof searchScope)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Toutes les sources</TabsTrigger>
              <TabsTrigger value="general">Bibliotheque generale</TabsTrigger>
              <TabsTrigger value="personal">Ma bibliotheque</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Ex : Procedure, rapport annuel, architecture microservices..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {results.length} resultat{results.length > 1 ? 's' : ''} trouve{results.length > 1 ? 's' : ''}
            </h2>
          </div>

          {results.map((result) => (
            <Card key={result.documentId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{result.documentTitle}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={result.source === 'general' ? 'default' : 'secondary'}>
                          {result.source === 'general' ? 'Bibliotheque generale' : 'Ma bibliotheque'}
                        </Badge>
                        {result.tagName && (
                          <Badge variant="outline">{result.tagName}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Ajoute le {new Date(result.dateAdded).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3 items-center">
                <div className="text-sm text-muted-foreground flex-1 min-w-[200px]">
                  Fichier : {result.filename || 'Non renseigne'}  Langue : {result.language}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => openDocument(result)}>
                    <Download className="w-4 h-4" />
                    Telecharger
                  </Button>
                  <Button variant="default" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Ouvrir dans le chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <SearchIcon className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Aucun resultat</p>
            <p className="text-sm text-muted-foreground mt-2">
              Verifiez lorthographe ou essayez un autre mot-cle.
            </p>
          </CardContent>
        </Card>
      )}

      {!query && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <SearchIcon className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Commencez par saisir un mot-cle pour explorer vos documents.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;

