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
}

interface Project {
  id: string;
  hashid: string;
  title: string;
  description: string;
  solar_system_id: string;
  difficulty: string;
  estimated_time: string;
  tags: string[];
  resources?: any[];
  requirements?: string[];
  learning_objectives?: string[];
  created_at: string;
  updated_at: string;
}

interface ProjectCreate {
  title: string;
  description: string;
  solar_system_id: string;
  difficulty: string;
  estimated_time: string;
  tags: string[];
}

const AdminProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [solarSystems, setSolarSystems] = useState<SolarSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGalaxy, setSelectedGalaxy] = useState<string>('all');
  const [selectedSolarSystem, setSelectedSolarSystem] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectCreate>({
    title: '',
    description: '',
    solar_system_id: '',
    difficulty: 'beginner',
    estimated_time: '1-2 hours',
    tags: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (user?.is_admin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [projectsData, galaxiesData, solarSystemsData] = await Promise.all([
        apiService.get<{ items: Project[] }>('/api/admin/projects'),
        apiService.get<{ items: Galaxy[] }>('/api/admin/galaxies'),
        apiService.get<{ items: SolarSystem[] }>('/api/admin/solar-systems')
      ]);
      
      console.log('Projects Data:', projectsData);
      console.log('Galaxies Data:', galaxiesData);
      console.log('Solar Systems Data:', solarSystemsData);
      
      setProjects(projectsData.items || []);
      setGalaxies(galaxiesData.items || []);
      setSolarSystems(solarSystemsData.items || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load projects, galaxies, and solar systems",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.solar_system_id) {
      toast({
        title: "Validation Error",
        description: "Please select a solar system",
        variant: "destructive",
      });
      return;
    }

    console.log('Sending project data:', formData);

    setSubmitting(true);
    try {
      await apiService.post('/api/admin/projects', formData);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setIsCreateOpen(false);
      setFormData({ title: '', description: '', solar_system_id: '', difficulty: 'beginner', estimated_time: '1-2 hours', tags: [] });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Creating Project",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingProject || !formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.solar_system_id) {
      toast({
        title: "Validation Error",
        description: "Please select a solar system",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.put(`/api/admin/projects/${editingProject.hashid}`, formData);
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      setIsEditOpen(false);
      setEditingProject(null);
      setFormData({ title: '', description: '', solar_system_id: '', difficulty: 'beginner', estimated_time: '1-2 hours', tags: [] });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Updating Project",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.delete(`/api/admin/projects/${project.hashid}`);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Deleting Project",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      solar_system_id: project.solar_system_id,
      difficulty: project.difficulty,
      estimated_time: project.estimated_time,
      tags: project.tags
    });
    setIsEditOpen(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const getSolarSystemName = (solarSystemId: string) => {
    const solarSystem = solarSystems.find(s => s.id === solarSystemId);
    return solarSystem ? solarSystem.name : 'Unknown Solar System';
  };

  const getGalaxyName = (solarSystemId: string) => {
    const solarSystem = solarSystems.find(s => s.hashid === solarSystemId);
    if (solarSystem) {
      const galaxy = galaxies.find(g => g.hashid === solarSystem.galaxy_id);
      return galaxy ? galaxy.name : 'Unknown Galaxy';
    }
    return 'Unknown Galaxy';
  };

  const filteredSolarSystems = selectedGalaxy === 'all' 
    ? solarSystems 
    : solarSystems.filter(s => s.galaxy_id === selectedGalaxy);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSolarSystem = selectedSolarSystem === 'all' || project.solar_system_id === selectedSolarSystem;
    const matchesGalaxy = selectedGalaxy === 'all' || solarSystems.find(s => s.hashid === project.solar_system_id)?.galaxy_id === selectedGalaxy;
    return matchesSearch && matchesSolarSystem && matchesGalaxy;
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
                    Project Management
                  </h1>
                  <p className="text-muted-foreground">
                    Create, edit, and manage projects
                  </p>
                </div>
              </div>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="cosmic-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Add a new project to a solar system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter project title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter project description"
                        rows={4}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="galaxy">Galaxy</Label>
                      <Select value={selectedGalaxy} onValueChange={(value) => {
                        setSelectedGalaxy(value);
                        setFormData({ ...formData, solar_system_id: '' });
                      }}>
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
                      <Label htmlFor="solar-system">Solar System</Label>
                      <Select 
                        value={formData.solar_system_id} 
                        onValueChange={(value) => setFormData({ ...formData, solar_system_id: value })}
                        disabled={!selectedGalaxy}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a solar system" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSolarSystems.map((solarSystem) => (
                            <SelectItem key={solarSystem.id} value={solarSystem.hashid}>
                              <div className="flex items-center gap-2">
                                <span style={{ color: solarSystem.color }}>{solarSystem.icon}</span>
                                <span>{solarSystem.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="estimated-time">Estimated Time</Label>
                        <Select value={formData.estimated_time} onValueChange={(value) => setFormData({ ...formData, estimated_time: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                            <SelectItem value="3-5 hours">3-5 hours</SelectItem>
                            <SelectItem value="1-2 days">1-2 days</SelectItem>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="2+ weeks">2+ weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Enter a tag"
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button type="button" onClick={addTag} variant="outline">
                          Add
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Project'}
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
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
                      <Select value={selectedGalaxy} onValueChange={(value) => {
                        setSelectedGalaxy(value);
                        setSelectedSolarSystem('all');
                      }}>
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
              <Select value={selectedSolarSystem} onValueChange={setSelectedSolarSystem}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by solar system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Solar Systems</SelectItem>
                  {filteredSolarSystems.map((solarSystem) => (
                    <SelectItem key={solarSystem.id} value={solarSystem.hashid}>
                      <div className="flex items-center gap-2">
                        <span style={{ color: solarSystem.color }}>{solarSystem.icon}</span>
                        <span>{solarSystem.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="px-3 py-1">
                {filteredProjects.length} projects
              </Badge>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="cosmic-card group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="text-sm">
                          ID: {project.hashid}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{project.difficulty}</Badge>
                      <Badge variant="secondary">{project.estimated_time}</Badge>
                    </div>
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getGalaxyName(project.solar_system_id)} → {getSolarSystemName(project.solar_system_id)}</span>
                      <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedGalaxy !== 'all' || selectedSolarSystem !== 'all' ? 'Try adjusting your search criteria' : 'Create your first project to get started'}
                </p>
                {!searchQuery && selectedGalaxy === 'all' && selectedSolarSystem === 'all' && (
                  <Button onClick={() => setIsCreateOpen(true)} className="cosmic-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Project
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </main>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-galaxy">Galaxy</Label>
                <Select value={selectedGalaxy} onValueChange={(value) => {
                  setSelectedGalaxy(value);
                  setFormData({ ...formData, solar_system_id: '' });
                }}>
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
                <Label htmlFor="edit-solar-system">Solar System</Label>
                <Select 
                  value={formData.solar_system_id} 
                  onValueChange={(value) => setFormData({ ...formData, solar_system_id: value })}
                  disabled={!selectedGalaxy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a solar system" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSolarSystems.map((solarSystem) => (
                      <SelectItem key={solarSystem.id} value={solarSystem.hashid}>
                        <div className="flex items-center gap-2">
                          <span style={{ color: solarSystem.color }}>{solarSystem.icon}</span>
                          <span>{solarSystem.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-estimated-time">Estimated Time</Label>
                  <Select value={formData.estimated_time} onValueChange={(value) => setFormData({ ...formData, estimated_time: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                      <SelectItem value="3-5 hours">3-5 hours</SelectItem>
                      <SelectItem value="1-2 days">1-2 days</SelectItem>
                      <SelectItem value="1 week">1 week</SelectItem>
                      <SelectItem value="2+ weeks">2+ weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminProjects;
