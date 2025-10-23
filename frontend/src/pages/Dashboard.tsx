import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, Search, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Documents Généraux',
      value: '24',
      description: 'Documents publics disponibles',
      icon: BookOpen,
      trend: '+3 ce mois'
    },
    {
      title: 'Mes Documents',
      value: '8',
      description: 'Documents personnels',
      icon: FileText,
      trend: '+2 cette semaine'
    },
    {
      title: 'Recherches',
      value: '156',
      description: 'Requêtes effectuées',
      icon: Search,
      trend: '+12 aujourd\'hui'
    },
    {
      title: 'Activité',
      value: '89%',
      description: 'Taux d\'engagement',
      icon: TrendingUp,
      trend: '+5% vs mois dernier'
    }
  ];

  const recentActivity = [
    { action: 'Consultation', document: 'Guide de démarrage React', time: 'Il y a 2 heures' },
    { action: 'Recherche', document: 'Intelligence Artificielle', time: 'Il y a 4 heures' },
    { action: 'Upload', document: 'Mon rapport Q1', time: 'Hier' },
    { action: 'Chat', document: 'Architecture Microservices', time: 'Hier' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité documentaire</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Bibliothèque Générale</TabsTrigger>
          <TabsTrigger value="personal">Ma Bibliothèque</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                    <p className="text-xs text-primary mt-2 font-medium">
                      {stat.trend}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Vos dernières actions dans la bibliothèque</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.document}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents populaires</CardTitle>
                <CardDescription>Les plus consultés cette semaine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Guide de démarrage React', views: 234 },
                    { title: 'Introduction à l\'IA', views: 189 },
                    { title: 'Architecture Microservices', views: 156 },
                    { title: 'Bases de données NoSQL', views: 142 }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-medium">{doc.title}</p>
                      <span className="text-xs text-muted-foreground">{doc.views} vues</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.slice(0, 2).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Mes documents récents</CardTitle>
              <CardDescription>Derniers fichiers uploadés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Aucun document personnel pour le moment</p>
                <p className="text-sm mt-2">Rendez-vous dans "Ma Bibliothèque" pour uploader vos fichiers</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
