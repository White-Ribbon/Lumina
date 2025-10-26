import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Lightbulb, 
  FileText, 
  Clock, 
  CheckCircle,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AdminStats {
  total_users: number;
  total_posts: number;
  total_project_ideas: number;
  total_submissions: number;
  pending_submissions: number;
  pending_project_ideas: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.is_admin) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await apiService.get<AdminStats>('/api/admin/stats');
      setStats(data);
    } catch (error: any) {
      toast({
        title: "Error Loading Stats",
        description: error.message || "Failed to load admin statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 glow-text">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage galaxies, solar systems, projects, and community content
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="cosmic-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card className="cosmic-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Forum Posts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_posts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Community posts
                  </p>
                </CardContent>
              </Card>

              <Card className="cosmic-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project Ideas</CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_project_ideas || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Community suggestions
                  </p>
                </CardContent>
              </Card>

              <Card className="cosmic-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project Submissions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_submissions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total submissions
                  </p>
                </CardContent>
              </Card>

              <Card className="cosmic-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pending_submissions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>

              <Card className="cosmic-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Ideas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pending_project_ideas || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="cosmic-card">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Common administrative tasks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Galaxy
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Solar System
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link to="/admin/submissions">
                          <Eye className="mr-2 h-4 w-4" />
                          Review Submissions
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cosmic-card">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Latest community activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">New project submissions</span>
                          <Badge variant="secondary">{stats?.pending_submissions || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Project ideas pending</span>
                          <Badge variant="secondary">{stats?.pending_project_ideas || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total forum posts</span>
                          <Badge variant="outline">{stats?.total_posts || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-6">
                <Card className="cosmic-card">
                  <CardHeader>
                    <CardTitle>Content Management</CardTitle>
                    <CardDescription>
                      Manage galaxies, solar systems, and projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Button className="h-20 flex-col" variant="outline">
                        <Settings className="h-6 w-6 mb-2" />
                        Manage Galaxies
                      </Button>
                      <Button className="h-20 flex-col" variant="outline">
                        <Settings className="h-6 w-6 mb-2" />
                        Manage Solar Systems
                      </Button>
                      <Button className="h-20 flex-col" variant="outline">
                        <Settings className="h-6 w-6 mb-2" />
                        Manage Projects
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="cosmic-card">
                  <CardHeader>
                    <CardTitle>Review Queue</CardTitle>
                    <CardDescription>
                      Review and approve community submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button className="h-20 flex-col" variant="outline">
                        <FileText className="h-6 w-6 mb-2" />
                        Review Submissions
                        <Badge variant="secondary" className="mt-2">
                          {stats?.pending_submissions || 0}
                        </Badge>
                      </Button>
                      <Button className="h-20 flex-col" variant="outline">
                        <Lightbulb className="h-6 w-6 mb-2" />
                        Review Project Ideas
                        <Badge variant="secondary" className="mt-2">
                          {stats?.pending_project_ideas || 0}
                        </Badge>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="cosmic-card">
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                      Configure system-wide settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        General Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        User Management
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Forum Moderation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
