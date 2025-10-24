import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Eye, Search, Trash2, Upload, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Document } from '@/types';
import {
  ApiDocument,
  ApiTag,
  deleteDocument,
  fetchDocuments,
  fetchTags,
  updateDocument,
  uploadDocument,
} from '@/lib/api';

const formatStatus = (status: Document['status']) => {
  switch (status) {
    case 'pending_meta':
      return 'En validation';
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
const NONE_TAG_VALUE = '__none__';

const MyLibrary: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tagMap, setTagMap] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editForm, setEditForm] = useState({ title: '', language: '', tag: '' });
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  const mapDocument = useCallback(
    (doc: ApiDocument): Document => ({
      id: doc.id,
      title: doc.title,
      filename: doc.filename,
      file: doc.file,
      language: doc.language || 'N/A',
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
      console.error('Erreur lors du chargement des tags', error);
    }
  }, [token]);

  const loadDocuments = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchDocuments(token);
      setDocuments(data.map(mapDocument));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Echec du chargement',
        description: "Impossible de recuperer vos documents.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, mapDocument]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        tagName: doc.tagId ? tagMap[doc.tagId] ?? doc.tagName : doc.tagName,
      })),
    );
  }, [tagMap]);

  const personalDocuments = useMemo(() => {
    if (!user) return [];
    return documents.filter((doc) => doc.source === 'personal' && doc.owner === user.id);
  }, [documents, user]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return personalDocuments;

    return personalDocuments.filter((doc) => {
      const tag = doc.tagName ?? (doc.tagId !== null ? `Tag ${doc.tagId}` : '');
      return (
        doc.title.toLowerCase().includes(query) ||
        (doc.filename?.toLowerCase() ?? '').includes(query) ||
        (doc.language?.toLowerCase() ?? '').includes(query) ||
        tag.toLowerCase().includes(query)
      );
    });
  }, [personalDocuments, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filteredDocuments.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [documents.length]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDocuments.slice(start, start + PAGE_SIZE);
  }, [filteredDocuments, currentPage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !event.target.files) return;

    const files = Array.from(event.target.files);
    if (!files.length) return;

    setIsLoading(true);
    toast({
      title: 'Upload en cours',
      description: `${files.length} document(s) en cours de traitement...`,
    });

    try {
      for (const file of files) {
        await uploadDocument(
          {
            file,
            title: file.name.replace(/\.[^.]+$/, ''),
            source: 'personal',
            language: 'fr',
          },
          token,
        );
      }

      toast({
        title: 'Upload termine',
        description: `${files.length} document(s) ajoutes avec succes.`,
      });
      await loadDocuments();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur lors de lupload',
        description: "Un probleme est survenu pendant l'envoi des fichiers.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!token) return;
    try {
      await deleteDocument(documentId, token);
      toast({
        title: 'Document supprime',
        description: 'Le document a ete retire de votre bibliotheque.',
      });
      await loadDocuments();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Suppression impossible',
        description: 'Veuillez reessayer ulterieurement.',
        variant: 'destructive',
      });
    }
  };

  const openInNewTab = (url: string | null | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Apercu indisponible',
        description: "Aucun fichier n'est associe a ce document.",
      });
    }
  };

  const openEditDialog = (doc: Document) => {
    setEditingDocument(doc);
    setEditForm({
      title: doc.title || '',
      language: doc.language || '',
      tag: doc.tagId ? String(doc.tagId) : '',
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingDocument(null);
    setEditForm({ title: '', language: '', tag: '' });
  };

  const handleTagChange = (value: string) => {
    setEditForm((prev) => ({ ...prev, tag: value === NONE_TAG_VALUE ? '' : value }));
  };

  const handleEditSubmit = async () => {
    if (!token || !editingDocument) return;

    const title = editForm.title.trim();
    const language = editForm.language.trim();
    const tag = editForm.tag ? Number(editForm.tag) : null;

    setIsSavingMeta(true);
    try {
      await updateDocument(
        editingDocument.id,
        {
          title,
          language,
          tag,
        },
        token,
      );
      toast({
        title: 'Metadonnees mises a jour',
        description: 'Les informations du document ont ete mises a jour.',
      });
      closeEditDialog();
      await loadDocuments();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Mise a jour impossible',
        description: 'Veuillez verifier les informations et reessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingMeta(false);
    }
  };

  if (!user || !token) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Connectez-vous pour consulter vos documents personnels.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ma Bibliotheque</h1>
          <p className="text-muted-foreground">Gerez vos documents personnels indexes.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            className="gap-2"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Uploader
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document, une langue ou un tag..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredDocuments.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Langue</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date d&apos;ajout</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>{doc.language || 'N/A'}</TableCell>
                  <TableCell>{doc.tagName ?? (doc.tagId !== null ? `Tag ${doc.tagId}` : '')}</TableCell>
                  <TableCell>
                    {doc.source === 'personal' ? 'Personnel' : 'General'}
                  </TableCell>
                  <TableCell>
                    {doc.dateAdded ? new Date(doc.dateAdded).toLocaleString('fr-FR') : ''}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {formatStatus(doc.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(doc)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openInNewTab(doc.file)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInNewTab(doc.file)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
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
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="mb-2">Aucun document personnel</CardTitle>
            <CardDescription className="text-center max-w-sm mb-6">
              Importez vos documents pour les indexer et les consulter facilement.
            </CardDescription>
            <Button
              type="button"
              className="gap-2"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Uploader un fichier
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => (!open ? closeEditDialog() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personal-edit-title">Titre</Label>
              <Input
                id="personal-edit-title"
                value={editForm.title}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Titre du document"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-edit-language">Langue</Label>
              <Input
                id="personal-edit-language"
                value={editForm.language}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, language: event.target.value }))
                }
                placeholder="fr, en..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-edit-tag">Tag</Label>
              <Select
                value={editForm.tag === '' ? NONE_TAG_VALUE : editForm.tag}
                onValueChange={handleTagChange}
              >
                <SelectTrigger id="personal-edit-tag">
                  <SelectValue placeholder="Aucun tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_TAG_VALUE}>Aucun</SelectItem>
                  {Object.entries(tagMap).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Annuler
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={
                isSavingMeta ||
                editForm.title.trim() === '' ||
                editForm.language.trim() === ''
              }
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyLibrary;

