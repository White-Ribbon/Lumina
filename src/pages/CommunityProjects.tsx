import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Plus, 
  ThumbsUp, 
  Clock, 
  User, 
  Calendar,
  ArrowUp,
  Tag,
  Star
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ProjectIdea {
  id: string;
  hashid: string;
  title: string;
  description: string;
  solar_system_id: string;
  tags: string[];
  difficulty: string;
  est_time: string;
  submitted_by: string;
  status: string;
  is_taken: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface SolarSystem {
  id: string;
  hashid: string;
  name: string;
  galaxy_id: string;
}

const CommunityProjects = () => {
  const { user, isAuthenticated } = useAuth();
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [solarSystems, setSolarSystems] = useState<SolarSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();
    fetchSolarSystems();
  }, []);

  const fetchIdeas = async () => {
    try {
      const data = await apiService.get<{ items: ProjectIdea[] }>('/api/project-ideas');
      setIdeas(data.items);
    } catch (error: any) {
      toast({
        title: "Error Loading Ideas",
        description: error.message || "Failed to load project ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSolarSystems = async () => {
    try {
      const data = await apiService.get<SolarSystem[]>('/api/solar-systems');
      setSolarSystems(data);
    } catch (error) {
      console.error('Failed to load solar systems:', error);
    }
  };

  const handleUpvote = async (ideaId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upvote project ideas",
        variant: "destructive",
      });
      return;
    }

    setVoting(ideaId);
    try {
      const response = await apiService.post('/api/voting/vote', {
        project_idea_id: ideaId,
        vote_type: 'upvote',
      });

      // Vote recorded successfully, no need to update UI counts

      toast({
        title: "Vote Recorded",
        description: response.message,
      });
    } catch (error: any) {
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to record vote",
        variant: "destructive",
      });
    } finally {
      setVoting(null);
    }
  };

  const getSolarSystemName = (solarSystemId: string) => {
    const system = solarSystems.find(s => s.id === solarSystemId);
    return system?.name || 'Unknown System';
  };

  const filteredIdeas = ideas.filter(idea => {
    const isExpired = new Date(idea.expires_at) < new Date();
    const isExpiringSoon = new Date(idea.expires_at) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'recent' && new Date(idea.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (filter === 'expiring' && isExpiringSoon && !isExpired);
    
    const matchesSearch = !searchQuery || 
                         idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Don't show expired ideas unless explicitly requested
    return matchesFilter && matchesSearch && !isExpired;
  });

  const sortedIdeas = filteredIdeas.sort((a, b) => {
    if (filter === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (filter === 'expiring') {
      return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
    }
    // Default: sort by creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

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
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                Community <span className="glow-text">Project Ideas</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover and vote on project ideas from the community
              </p>
            </div>
            {isAuthenticated && (
              <Button asChild className="cosmic-button">
                <Link to="/project-ideas/new">
                  <Plus className="mr-2 w-4 h-4" />
                  Submit Idea
                </Link>
              </Button>
            )}
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Search project ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ideas</SelectItem>
                <SelectItem value="recent">Recent (7 days)</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project Ideas Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedIdeas.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Project Ideas Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Be the first to submit a project idea!"}
                </p>
                {isAuthenticated && (
                  <Button asChild className="cosmic-button">
                    <Link to="/project-ideas/new">Submit First Idea</Link>
                  </Button>
                )}
              </div>
            ) : (
              sortedIdeas.map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="cosmic-card h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold line-clamp-2">{idea.title}</h3>
                        <Badge 
                          variant={idea.status === 'approved' ? 'default' : 
                                  idea.status === 'pending_approval' ? 'secondary' : 'destructive'}
                          className="ml-2 flex-shrink-0"
                        >
                          {idea.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <User className="w-3 h-3" />
                        <span>{idea.submitted_by}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(idea.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Star className="w-3 h-3" />
                        <span>{getSolarSystemName(idea.solar_system_id)}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {idea.difficulty}
                        </Badge>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {idea.est_time}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                        {idea.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {idea.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {idea.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{idea.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpvote(idea.hashid)}
                          disabled={voting === idea.hashid}
                          className="flex items-center gap-1"
                        >
                          <ArrowUp className="w-4 h-4" />
                          Upvote
                        </Button>

                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Expires: {new Date(idea.expires_at).toLocaleDateString()}</span>
                          </div>
                          {new Date(idea.expires_at) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Expires Soon!
                            </Badge>
                          )}
                        </div>
                      </div>

                      {idea.is_taken && (
                        <Badge variant="destructive" className="mt-2 w-full justify-center">
                          This idea has been implemented
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityProjects;
