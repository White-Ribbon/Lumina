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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
}

interface SolarSystem {
  id: string;
  hashid: string;
  name: string;
  description: string;
  galaxy_id: string;
  icon: string;
  color: string;
  tags?: string[];
  badge_id?: string;
  created_at: string;
  updated_at: string;
}

interface SolarSystemCreate {
  name: string;
  description: string;
  galaxy_id: string;
  icon: string;
  color: string;
}

const AdminSolarSystems = () => {
  const { user } = useAuth();
  const [solarSystems, setSolarSystems] = useState<SolarSystem[]>([]);
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGalaxy, setSelectedGalaxy] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSolarSystem, setEditingSolarSystem] = useState<SolarSystem | null>(null);
  const [formData, setFormData] = useState<SolarSystemCreate>({
    name: '',
    description: '',
    galaxy_id: '',
    icon: '🪐',
    color: '#8b5cf6'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.is_admin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [solarSystemsData, galaxiesData] = await Promise.all([
        apiService.get<{ items: SolarSystem[] }>('/api/admin/solar-systems'),
        apiService.get<{ items: Galaxy[] }>('/api/admin/galaxies')
      ]);
      
      console.log('Solar Systems Data:', solarSystemsData);
      console.log('Galaxies Data:', galaxiesData);
      
      setSolarSystems(solarSystemsData.items || []);
      setGalaxies(galaxiesData.items || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load solar systems and galaxies",
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
        description: "Solar system name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.galaxy_id) {
      toast({
        title: "Validation Error",
        description: "Please select a galaxy",
        variant: "destructive",
      });
      return;
    }

    console.log('Sending solar system data:', formData);

    setSubmitting(true);
    try {
      await apiService.post('/api/admin/solar-systems', formData);
      toast({
        title: "Success",
        description: "Solar system created successfully",
      });
      setIsCreateOpen(false);
      setFormData({ name: '', description: '', galaxy_id: '', icon: '🪐', color: '#8b5cf6' });
      fetchData();
    } catch (error: any) {
      console.error('Error creating solar system:', error);
      toast({
        title: "Error Creating Solar System",
        description: error.message || "Failed to create solar system",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingSolarSystem || !formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Solar system name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.galaxy_id) {
      toast({
        title: "Validation Error",
        description: "Please select a galaxy",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.put(`/api/admin/solar-systems/${editingSolarSystem.hashid}`, formData);
      toast({
        title: "Success",
        description: "Solar system updated successfully",
      });
      setIsEditOpen(false);
      setEditingSolarSystem(null);
      setFormData({ name: '', description: '', galaxy_id: '', icon: '🪐', color: '#8b5cf6' });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Updating Solar System",
        description: error.message || "Failed to update solar system",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (solarSystem: SolarSystem) => {
    if (!confirm(`Are you sure you want to delete "${solarSystem.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.delete(`/api/admin/solar-systems/${solarSystem.hashid}`);
      toast({
        title: "Success",
        description: "Solar system deleted successfully",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Deleting Solar System",
        description: error.message || "Failed to delete solar system",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (solarSystem: SolarSystem) => {
    setEditingSolarSystem(solarSystem);
    setFormData({
      name: solarSystem.name,
      description: solarSystem.description,
      galaxy_id: solarSystem.galaxy_id,
      icon: solarSystem.icon,
      color: solarSystem.color
    });
    setIsEditOpen(true);
  };

  const getGalaxyName = (galaxyId: string) => {
    const galaxy = galaxies.find(g => g.hashid === galaxyId);
    return galaxy ? galaxy.name : 'Unknown Galaxy';
  };

  const filteredSolarSystems = solarSystems.filter(solarSystem => {
    const matchesSearch = solarSystem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         solarSystem.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGalaxy = selectedGalaxy === 'all' || solarSystem.galaxy_id === selectedGalaxy;
    return matchesSearch && matchesGalaxy;
  });

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
                    Solar System Management
                  </h1>
                  <p className="text-muted-foreground">
                    Create, edit, and manage solar systems
                  </p>
                </div>
              </div>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="cosmic-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Solar System
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Solar System</DialogTitle>
                    <DialogDescription>
                      Add a new solar system to a galaxy
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter solar system name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter solar system description"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="galaxy">Galaxy</Label>
                      <Select value={formData.galaxy_id} onValueChange={(value) => setFormData({ ...formData, galaxy_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a galaxy" />
                        </SelectTrigger>
                        <SelectContent>
                          {galaxies.map((galaxy) => (
                            <SelectItem key={galaxy.id} value={galaxy.hashid}>
                              <div className="flex items-center gap-2">
                                <span style={{ color: galaxy.color }}>{galaxy.icon}</span>
                                <span>{galaxy.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="🪐"
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
                      {submitting ? 'Creating...' : 'Create Solar System'}
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
                  placeholder="Search solar systems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedGalaxy} onValueChange={setSelectedGalaxy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by galaxy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Galaxies</SelectItem>
                  {galaxies.map((galaxy) => (
                    <SelectItem key={galaxy.id} value={galaxy.hashid}>
                      <div className="flex items-center gap-2">
                        <span style={{ color: galaxy.color }}>{galaxy.icon}</span>
                        <span>{galaxy.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="px-3 py-1">
                {filteredSolarSystems.length} solar systems
              </Badge>
            </div>

            {/* Solar Systems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSolarSystems.map((solarSystem) => (
                <Card key={solarSystem.id} className="cosmic-card group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="text-2xl"
                          style={{ color: solarSystem.color }}
                        >
                          {solarSystem.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{solarSystem.name}</CardTitle>
                          <CardDescription className="text-sm">
                            ID: {solarSystem.hashid}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(solarSystem)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(solarSystem)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {solarSystem.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Galaxy: {getGalaxyName(solarSystem.galaxy_id)}</span>
                      <span>Created: {new Date(solarSystem.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSolarSystems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🪐</div>
                <h3 className="text-xl font-semibold mb-2">No Solar Systems Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedGalaxy !== 'all' ? 'Try adjusting your search criteria' : 'Create your first solar system to get started'}
                </p>
                {!searchQuery && selectedGalaxy === 'all' && (
                  <Button onClick={() => setIsCreateOpen(true)} className="cosmic-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Solar System
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
              <DialogTitle>Edit Solar System</DialogTitle>
              <DialogDescription>
                Update solar system information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter solar system name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter solar system description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-galaxy">Galaxy</Label>
                <Select value={formData.galaxy_id} onValueChange={(value) => setFormData({ ...formData, galaxy_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a galaxy" />
                  </SelectTrigger>
                  <SelectContent>
                    {galaxies.map((galaxy) => (
                      <SelectItem key={galaxy.id} value={galaxy.hashid}>
                        <div className="flex items-center gap-2">
                          <span style={{ color: galaxy.color }}>{galaxy.icon}</span>
                          <span>{galaxy.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icon</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🪐"
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
                {submitting ? 'Updating...' : 'Update Solar System'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminSolarSystems;
