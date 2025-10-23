import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, Search, Trash2, Check } from 'lucide-react';
import { Document } from '@/types';
import {
  approveDocument,
  deleteDocument,
  fetchPendingDocuments,
} from '@/lib/api';

const PAGE_SIZE = 10;
const formatStatus = (status: Document['status']) => {
  switch (status) {
    case 'pending_meta':
      return 'Metadonnees en attente';
    case 'uploaded':
      return 'Telecharge';
    case 'processed':
      return 'Traitement en cours';
    case 'indexed':
      return 'Indexe';
    default:
      return status;
  }
};

const PAGE_SIZE = 10;

const DocumentApproval: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadDocuments = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchPendingDocuments(token);
      const mapped: Document[] = data.map((doc) => ({
        id: doc.id,
        title: doc.title,
        filename: doc.filename,
        file: doc.file,
        language: doc.language || '',
        source: doc.source,
        status: doc.status,
        dateAdded: doc.date_added,
        owner: doc.owner,
        tagId: doc.tag,
        tagName: undefined,
        path: doc.path ?? undefined,
      }));
      setDocuments(mapped);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Chargement impossible',
        description: 'Impossible de recuperer les documents en attente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, documents.length]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((doc) => {
      return (
        doc.title.toLowerCase().includes(query) ||
        (doc.filename?.toLowerCase() ?? '').includes(query) ||
        (doc.language?.toLowerCase() ?? '').includes(query)
      );
    });
  }, [documents, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDocuments.slice(start, start + PAGE_SIZE);
  }, [filteredDocuments, currentPage]);

  const handleApprove = async (documentId: string) => {
    if (!token) return;
    try {
      await approveDocument(documentId, token);
      toast({
        title: 'Document valide',
        description: 'Le document est maintenant disponible pour les administrateurs.',
      });
      await loadDocuments();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Validation impossible',
        description: 'Une erreur est survenue lors de la validation.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (documentId: string) => {
    if (!token) return;
    try {
      await deleteDocument(documentId, token);
      toast({
        title: 'Document refuse',
        description: 'Le document a ete supprime.',
        variant: 'destructive',
      });
      await loadDocuments();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Suppression impossible',
        description: 'Une erreur est survenue lors de la suppression.',
        variant: 'destructive',
      });
    }
  };

  const openFile = (url: string | null | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Fichier indisponible',
        description: "Ce document n'a pas de fichier accesible.",
      });
    }
  };

  if (user?.role !== 'superadmin') {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Seul le super administrateur peut valider les documents.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Validation des documents</h1>
          <p className="text-muted-foreground">
            Examinez les documents uploades avant qu'ils ne soient disponibles dans la bibliotheque generale.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, nom de fichier ou langue..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={loadDocuments} disabled={isLoading}>
          Rafraichir
        </Button>
      </div>

  {filteredDocuments.length > 0 ? (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Langue</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date d'ajout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell>{doc.language || 'N/A'}</TableCell>
                <TableCell>{doc.source}</TableCell>
                <TableCell>
                  {doc.dateAdded ? new Date(doc.dateAdded).toLocaleString('fr-FR') : ''}
                </TableCell>
                <TableCell>{formatStatus(doc.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openFile(doc.file)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openFile(doc.file)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleApprove(doc.id)}
                    >
                      <Check className="w-4 h-4" />
                      Valider
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(doc.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} - {filteredDocuments.length} document(s)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Precedent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>
    ) : (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-muted-foreground">Aucun document en attente</p>
          <p className="text-sm text-muted-foreground mt-2">
            Les nouveaux uploads apparaitront ici pour validation.
          </p>
        </CardContent>
      </Card>
    )}
    </div>
  );
};

export default DocumentApproval;


