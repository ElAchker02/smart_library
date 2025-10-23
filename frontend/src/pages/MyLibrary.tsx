import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2, Download, Eye, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const MyLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      toast({
        title: 'Upload en cours',
        description: `${files.length} fichier(s) en cours de traitement...`,
      });
      
      // Simuler l'upload
      setTimeout(() => {
        const newDocs = Array.from(files).map((file, index) => ({
          id: `personal-${Date.now()}-${index}`,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          uploadDate: new Date().toLocaleDateString('fr-FR'),
          status: 'ready',
          language: 'Français'
        }));
        
        setDocuments([...documents, ...newDocs]);
        
        toast({
          title: 'Upload terminé',
          description: `${files.length} fichier(s) ajouté(s) avec succès`,
        });
      }, 2000);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast({
      title: 'Document supprimé',
      description: 'Le document a été retiré de votre bibliothèque',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ma Bibliothèque</h1>
          <p className="text-muted-foreground">Gérez vos documents personnels</p>
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="file-upload">
            <Button className="gap-2 cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4" />
                Uploader des PDF
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans mes documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {documents.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du document</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Langue</TableHead>
                <TableHead>Date d'ajout</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {doc.name}
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.language}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {doc.status === 'ready' ? 'Prêt' : 'En traitement'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="mb-2">Aucun document personnel</CardTitle>
            <CardDescription className="text-center max-w-sm mb-6">
              Commencez par uploader vos premiers documents PDF pour construire votre bibliothèque personnelle
            </CardDescription>
            <label htmlFor="file-upload">
              <Button className="gap-2 cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4" />
                  Uploader des fichiers
                </span>
              </Button>
            </label>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyLibrary;
