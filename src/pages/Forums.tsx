import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Flag, User } from "lucide-react";
import usersData from "@/data/users.json";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarkdownViewer from "@/components/MarkdownViewer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import forumsData from "@/data/forums.json";

const Forums = () => {
  const [flaggedPosts, setFlaggedPosts] = useState<Set<string>>(new Set());

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
    const author = usersData.find(u => u.id === post.author_id);
    
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
            <h3 className="font-bold text-lg">{post.title}</h3>
            <p className="text-sm text-muted-foreground">by {author?.name || "Unknown"}</p>
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
            Comments
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
                      <span className="font-semibold text-sm">{comment.author}</span>
                      <Badge variant="secondary" className="text-xs">
                        {comment.tag}
                      </Badge>
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
          <Button asChild className="cosmic-button">
            <Link to="/forums/new">
              <Plus className="mr-2 w-4 h-4" />
              New Post
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="showcasing" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="showcasing">Project Showcasing</TabsTrigger>
            <TabsTrigger value="help">Help with Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="showcasing">
            <div className="max-w-4xl">
              {forumsData.showcasing.map((post) => renderPost(post, "showcasing"))}
            </div>
          </TabsContent>

          <TabsContent value="help">
            <div className="max-w-4xl">
              {forumsData.help.map((post) => renderPost(post, "help"))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Forums;
