import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Flag, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarkdownViewer from "@/components/MarkdownViewer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useForumPosts } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";

const Forums = () => {
  const [flaggedPosts, setFlaggedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("showcasing");
  
  const { data: showcasingPosts, loading: showcasingLoading, error: showcasingError } = useForumPosts("showcasing");
  const { data: helpPosts, loading: helpLoading, error: helpError } = useForumPosts("help");
  const { isAuthenticated } = useAuth();

  const handleFlag = (postId: string) => {
    setFlaggedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const renderPost = (post: any, category: string) => {
    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="cosmic-card mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          <div>
            <Link to={`/forums/post/${post.hashid}`} className="hover:text-primary transition-colors">
              <h3 className="font-bold text-lg">{post.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground">by {post.author_id}</p>
          </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFlag(post.id)}
            className={flaggedPosts.has(post.id) ? "text-destructive" : ""}
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag: string) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mb-4">
          <MarkdownViewer content={post.body_md} />
        </div>

        {post.comments && post.comments.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              Comments ({post.comments.length})
            </div>
            <div className="space-y-3 pl-4">
              {post.comments.map((comment: any) => (
                <Card key={comment.id} className="p-4 bg-muted/30">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.author_id}</span>
                        {comment.tag && (
                          <Badge variant="secondary" className="text-xs">
                            {comment.tag}
                          </Badge>
                        )}
                      </div>
                      <MarkdownViewer content={comment.body_md} className="text-sm" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );

  const renderErrorState = (error: string) => (
    <div className="text-center py-12">
      <h3 className="text-xl font-bold mb-2">Error Loading Posts</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <p className="text-sm text-muted-foreground">
        Make sure your backend is running at http://localhost:8000
      </p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">
              Community <span className="glow-text">Forums</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Share your projects and get help from the community
            </p>
          </div>
          {isAuthenticated ? (
            <Button asChild className="cosmic-button">
              <Link to="/forums/new">
                <Plus className="mr-2 w-4 h-4" />
                New Post
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/auth">
                <Plus className="mr-2 w-4 h-4" />
                Sign In to Post
              </Link>
            </Button>
          )}
        </div>

        <Tabs defaultValue="showcasing" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="showcasing">Project Showcasing</TabsTrigger>
            <TabsTrigger value="help">Help with Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="showcasing">
            <div className="max-w-4xl">
              {showcasingLoading ? (
                renderLoadingState()
              ) : showcasingError ? (
                renderErrorState(showcasingError)
              ) : showcasingPosts?.items?.length > 0 ? (
                showcasingPosts.items.map((post: any) => renderPost(post, "showcasing"))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-bold mb-2">No Posts Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to showcase your project!
                  </p>
                  {isAuthenticated && (
                    <Button asChild className="cosmic-button">
                      <Link to="/forums/new">Create First Post</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="help">
            <div className="max-w-4xl">
              {helpLoading ? (
                renderLoadingState()
              ) : helpError ? (
                renderErrorState(helpError)
              ) : helpPosts?.items?.length > 0 ? (
                helpPosts.items.map((post: any) => renderPost(post, "help"))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-bold mb-2">No Help Posts Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Need help with a project? Start a discussion!
                  </p>
                  {isAuthenticated && (
                    <Button asChild className="cosmic-button">
                      <Link to="/forums/new">Ask for Help</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Forums;
