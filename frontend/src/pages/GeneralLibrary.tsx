import React, { useState } from 'react';
import { mockDocuments } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, MessageSquare, FileText, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GeneralLibrary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    language: 'Français'
  });
  
  const isAdminOrSuperAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const publicDocuments = mockDocuments.filter(doc => doc.isPublic);

  const filteredDocuments = publicDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = () => {
    toast({
      title: 'Document ajouté',
      description: `${uploadForm.title} a été ajouté à la bibliothèque générale.`
    });
    setIsDialogOpen(false);
    setUploadForm({ title: '', description: '', category: '', language: 'Français' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Bibliothèque Générale</h1>
        <p className="text-muted-foreground">Documents publics partagés par la communauté</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, description ou catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {isAdminOrSuperAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Ajouter un document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un document à la bibliothèque générale</DialogTitle>
                <DialogDescription>
                  Enrichissez la base de données en ajoutant un nouveau document public
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Fichier PDF</Label>
                  <Input id="file" type="file" accept=".pdf" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du document</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="Guide de démarrage..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Une description détaillée du contenu..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                      id="category"
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      placeholder="Développement, IA, Architecture..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select value={uploadForm.language} onValueChange={(value) => setUploadForm({ ...uploadForm, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Français">Français</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Español">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter à la bibliothèque
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <FileText className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{doc.category}</Badge>
              </div>
              <CardTitle className="text-lg">{doc.title}</CardTitle>
              <CardDescription>{doc.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{doc.language}</span>
                <span>{doc.pageCount} pages</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Ajouté le {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="flex-1 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Aucun document trouvé</p>
            <p className="text-sm text-muted-foreground mt-2">
              Essayez de modifier vos critères de recherche
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeneralLibrary;
