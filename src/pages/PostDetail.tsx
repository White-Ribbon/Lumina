import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  MessageSquare, 
  Send,
  User,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarkdownViewer from '@/components/MarkdownViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Post {
  id: string;
  hashid: string;
  title: string;
  body_md: string;
  tags: string[];
  category: string;
  author_id: string;
  comments: string[];
  upvotes: number;
  downvotes: number;
  flags: number;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  hashid: string;
  body_md: string;
  tag?: string;
  author_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
}

const PostDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const postData = await apiService.get<Post>(`/api/forums/${id}`);
      setPost(postData);
      
      // Fetch comments
      const commentsData = await apiService.get<Comment[]>(`/api/forums/${id}/comments`);
      setComments(commentsData);
    } catch (error: any) {
      toast({
        title: "Error Loading Post",
        description: error.message || "Failed to load post details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote' | 'flag') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on posts",
        variant: "destructive",
      });
      return;
    }

    setVoting(true);
    try {
      const response = await apiService.post('/api/voting/vote', {
        post_id: id,
        vote_type: voteType,
      });

      if (post) {
        setPost({
          ...post,
          upvotes: response.upvotes,
          downvotes: response.downvotes,
          flags: response.flags,
        });
      }

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
      setVoting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await apiService.post('/api/forums/comments', {
        post_id: id,
        body_md: commentText,
      });

      setCommentText('');
      await fetchPost(); // Refresh comments
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Comment Failed",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

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

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/forums">Back to Forums</Link>
            </Button>
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
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/forums" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Forums
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Post Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="cosmic-card">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="" alt={post.author_id} />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-bold">{post.title}</h1>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>by {post.author_id}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="capitalize">
                    {post.category}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <MarkdownViewer content={post.body_md} />
                </div>

                {/* Voting Section */}
                <div className="flex items-center gap-4 border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote('upvote')}
                      disabled={voting}
                      className="flex items-center gap-1"
                    >
                      <ArrowUp className="w-4 h-4" />
                      {post.upvotes}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote('downvote')}
                      disabled={voting}
                      className="flex items-center gap-1"
                    >
                      <ArrowDown className="w-4 h-4" />
                      {post.downvotes}
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote('flag')}
                    disabled={voting}
                    className="flex items-center gap-1"
                  >
                    <Flag className="w-4 h-4" />
                    Flag ({post.flags})
                  </Button>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                    <MessageSquare className="w-4 h-4" />
                    {comments.length} comments
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Comments</h2>

            {/* Add Comment Form */}
            {isAuthenticated ? (
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle>Add a Comment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <Textarea
                      placeholder="Write your comment in Markdown..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                    <Button 
                      type="submit" 
                      disabled={submittingComment || !commentText.trim()}
                      className="cosmic-button"
                    >
                      <Send className="mr-2 w-4 h-4" />
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="cosmic-card">
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Sign in to post comments
                  </p>
                  <Button asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <Card className="cosmic-card">
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Comments Yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to comment on this post!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="cosmic-card">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="" alt={comment.author_id} />
                            <AvatarFallback>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm">{comment.author_id}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                              {comment.tag && (
                                <Badge variant="outline" className="text-xs">
                                  {comment.tag}
                                </Badge>
                              )}
                            </div>
                            <MarkdownViewer content={comment.body_md} className="text-sm" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostDetail;
