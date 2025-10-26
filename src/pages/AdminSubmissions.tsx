import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Github, 
  User, 
  Calendar,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarkdownViewer from '@/components/MarkdownViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Submission {
  id: string;
  hashid: string;
  project_id: string;
  user_id: string;
  repo_url: string;
  readme_md: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  review_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

interface ProjectIdea {
  id: string;
  hashid: string;
  title: string;
  description: string;
  submitted_by: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  is_taken: boolean;
  created_at: string;
}

const AdminSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submissions');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (user?.is_admin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [submissionsData, ideasData] = await Promise.all([
        apiService.get<{ items: Submission[] }>('/api/admin/submissions'),
        apiService.get<{ items: ProjectIdea[] }>('/api/admin/project-ideas')
      ]);
      
      setSubmissions(submissionsData.items);
      setProjectIdeas(ideasData.items);
    } catch (error: any) {
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load submissions and ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    setReviewing(true);
    try {
      await apiService.put(`/api/admin/submissions/${submissionId}`, {
        status,
        review_notes: reviewNotes || undefined
      });
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.hashid === submissionId 
          ? { ...sub, status, review_notes: reviewNotes, reviewed_at: new Date().toISOString() }
          : sub
      ));
      
      setSelectedSubmission(null);
      setReviewNotes('');
      
      toast({
        title: "Review Complete",
        description: `Submission ${status} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to review submission",
        variant: "destructive",
      });
    } finally {
      setReviewing(false);
    }
  };

  const handleIdeaReview = async (ideaId: string, status: 'approved' | 'rejected', isTaken?: boolean) => {
    setReviewing(true);
    try {
      await apiService.put(`/api/admin/project-ideas/${ideaId}`, {
        status,
        is_taken: isTaken
      });
      
      // Update local state
      setProjectIdeas(prev => prev.map(idea => 
        idea.hashid === ideaId 
          ? { ...idea, status, is_taken: isTaken || idea.is_taken }
          : idea
      ));
      
      setSelectedIdea(null);
      
      toast({
        title: "Review Complete",
        description: `Project idea ${status} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to review project idea",
        variant: "destructive",
      });
    } finally {
      setReviewing(false);
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2 glow-text">
                  Review Submissions
                </h1>
                <p className="text-muted-foreground">
                  Review and approve community submissions and project ideas
                </p>
              </div>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="mr-2 w-4 h-4" />
                Refresh
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="submissions">
                  Project Submissions ({submissions.length})
                </TabsTrigger>
                <TabsTrigger value="ideas">
                  Project Ideas ({projectIdeas.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="submissions" className="mt-6">
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <Card className="cosmic-card">
                      <CardContent className="text-center py-12">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Submissions</h3>
                        <p className="text-muted-foreground">
                          No project submissions to review at the moment.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    submissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="cosmic-card">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  Project Submission
                                  <Badge 
                                    variant={submission.status === 'approved' ? 'default' : 
                                            submission.status === 'pending' ? 'secondary' : 'destructive'}
                                  >
                                    {submission.status}
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {submission.user_id}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(submission.submitted_at).toLocaleDateString()}
                                  </span>
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                                {submission.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSubmissionReview(submission.hashid, 'approved')}
                                      disabled={reviewing}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSubmissionReview(submission.hashid, 'rejected')}
                                      disabled={reviewing}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Repository URL</Label>
                                <a
                                  href={submission.repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-primary hover:underline mt-1"
                                >
                                  <Github className="w-4 h-4" />
                                  {submission.repo_url}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              
                              {submission.review_notes && (
                                <div>
                                  <Label className="text-sm font-medium">Review Notes</Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {submission.review_notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ideas" className="mt-6">
                <div className="space-y-4">
                  {projectIdeas.length === 0 ? (
                    <Card className="cosmic-card">
                      <CardContent className="text-center py-12">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Project Ideas</h3>
                        <p className="text-muted-foreground">
                          No project ideas to review at the moment.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    projectIdeas.map((idea, index) => (
                      <motion.div
                        key={idea.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="cosmic-card">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {idea.title}
                                  <Badge 
                                    variant={idea.status === 'approved' ? 'default' : 
                                            idea.status === 'pending_approval' ? 'secondary' : 'destructive'}
                                  >
                                    {idea.status}
                                  </Badge>
                                  {idea.is_taken && (
                                    <Badge variant="destructive">Taken</Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {idea.submitted_by}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(idea.created_at).toLocaleDateString()}
                                  </span>
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedIdea(idea)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                                {idea.status === 'pending_approval' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleIdeaReview(idea.hashid, 'approved')}
                                      disabled={reviewing}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleIdeaReview(idea.hashid, 'rejected')}
                                      disabled={reviewing}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleIdeaReview(idea.hashid, 'approved', true)}
                                      disabled={reviewing}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      Mark Taken
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{idea.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Review Modal for Submissions */}
            {selectedSubmission && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="cosmic-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>Review Submission</CardTitle>
                    <CardDescription>
                      Review the project submission details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Repository URL</Label>
                      <a
                        href={selectedSubmission.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline mt-1"
                      >
                        <Github className="w-4 h-4" />
                        {selectedSubmission.repo_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">README</Label>
                      <div className="border border-border rounded-lg p-4 bg-muted/30 mt-1 max-h-60 overflow-y-auto">
                        <MarkdownViewer content={selectedSubmission.readme_md} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="review-notes">Review Notes (Optional)</Label>
                      <Textarea
                        id="review-notes"
                        placeholder="Add review notes..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleSubmissionReview(selectedSubmission.hashid, 'approved')}
                        disabled={reviewing}
                        className="flex-1 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleSubmissionReview(selectedSubmission.hashid, 'rejected')}
                        disabled={reviewing}
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => setSelectedSubmission(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Review Modal for Project Ideas */}
            {selectedIdea && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="cosmic-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>Review Project Idea</CardTitle>
                    <CardDescription>
                      Review the project idea details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg">{selectedIdea.title}</h3>
                      <p className="text-muted-foreground mt-2">{selectedIdea.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedIdea.submitted_by}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedIdea.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleIdeaReview(selectedIdea.hashid, 'approved')}
                        disabled={reviewing}
                        className="flex-1 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleIdeaReview(selectedIdea.hashid, 'rejected')}
                        disabled={reviewing}
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleIdeaReview(selectedIdea.hashid, 'approved', true)}
                        disabled={reviewing}
                        variant="outline"
                        className="flex-1 text-blue-600 hover:text-blue-700"
                      >
                        Mark Taken
                      </Button>
                      <Button
                        onClick={() => setSelectedIdea(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminSubmissions;
