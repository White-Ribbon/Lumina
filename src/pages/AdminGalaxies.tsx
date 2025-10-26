import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Galaxy {
  id: string;
  hashid: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface GalaxyCreate {
  name: string;
  description: string;
  icon: string;
  color: string;
}

const AdminGalaxies = () => {
  const { user } = useAuth();
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGalaxy, setEditingGalaxy] = useState<Galaxy | null>(null);
  const [formData, setFormData] = useState<GalaxyCreate>({
    name: '',
    description: '',
    icon: '🌟',
    color: '#3b82f6'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.is_admin) {
      fetchGalaxies();
    }
  }, [user]);

  const fetchGalaxies = async () => {
    try {
      const data = await apiService.get<{ items: Galaxy[] }>('/api/admin/galaxies');
      setGalaxies(data.items);
    } catch (error: any) {
      toast({
        title: "Error Loading Galaxies",
        description: error.message || "Failed to load galaxies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Galaxy name is required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.post('/api/admin/galaxies', formData);
      toast({
        title: "Success",
        description: "Galaxy created successfully",
      });
      setIsCreateOpen(false);
      setFormData({ name: '', description: '', icon: '🌟', color: '#3b82f6' });
      fetchGalaxies();
    } catch (error: any) {
      toast({
        title: "Error Creating Galaxy",
        description: error.message || "Failed to create galaxy",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingGalaxy || !formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Galaxy name is required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.put(`/api/admin/galaxies/${editingGalaxy.hashid}`, formData);
      toast({
        title: "Success",
        description: "Galaxy updated successfully",
      });
      setIsEditOpen(false);
      setEditingGalaxy(null);
      setFormData({ name: '', description: '', icon: '🌟', color: '#3b82f6' });
      fetchGalaxies();
    } catch (error: any) {
      toast({
        title: "Error Updating Galaxy",
        description: error.message || "Failed to update galaxy",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (galaxy: Galaxy) => {
    if (!confirm(`Are you sure you want to delete "${galaxy.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.delete(`/api/admin/galaxies/${galaxy.hashid}`);
      toast({
        title: "Success",
        description: "Galaxy deleted successfully",
      });
      fetchGalaxies();
    } catch (error: any) {
      toast({
        title: "Error Deleting Galaxy",
        description: error.message || "Failed to delete galaxy",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (galaxy: Galaxy) => {
    setEditingGalaxy(galaxy);
    setFormData({
      name: galaxy.name,
      description: galaxy.description,
      icon: galaxy.icon,
      color: galaxy.color
    });
    setIsEditOpen(true);
  };

  const filteredGalaxies = galaxies.filter(galaxy =>
    galaxy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    galaxy.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <div>
                  <h1 className="text-4xl font-bold mb-2 glow-text">
                    Galaxy Management
                  </h1>
                  <p className="text-muted-foreground">
                    Create, edit, and manage galaxies
                  </p>
                </div>
              </div>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="cosmic-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Galaxy
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Galaxy</DialogTitle>
                    <DialogDescription>
                      Add a new galaxy to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter galaxy name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter galaxy description"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="🌟"
                        maxLength={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Galaxy'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search galaxies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {filteredGalaxies.length} galaxies
              </Badge>
            </div>

            {/* Galaxies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalaxies.map((galaxy) => (
                <Card key={galaxy.id} className="cosmic-card group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="text-2xl"
                          style={{ color: galaxy.color }}
                        >
                          {galaxy.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{galaxy.name}</CardTitle>
                          <CardDescription className="text-sm">
                            ID: {galaxy.hashid}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(galaxy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(galaxy)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {galaxy.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created: {new Date(galaxy.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(galaxy.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredGalaxies.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold mb-2">No Galaxies Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Create your first galaxy to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateOpen(true)} className="cosmic-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Galaxy
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </main>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Galaxy</DialogTitle>
              <DialogDescription>
                Update galaxy information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter galaxy name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter galaxy description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icon</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🌟"
                  maxLength={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Galaxy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminGalaxies;
