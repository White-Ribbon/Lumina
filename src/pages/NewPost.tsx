import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarkdownViewer from "@/components/MarkdownViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

const NewPost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("showcasing");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Post Created! 🎉",
      description: "Your post has been added to the community forums.",
    });
    navigate("/forums");
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/forums")}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Forums
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 glow-text">
            Create New Post
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    placeholder="What's your post about?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <RadioGroup
                    value={category}
                    onValueChange={setCategory}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="showcasing" id="showcasing" />
                      <Label htmlFor="showcasing" className="font-normal cursor-pointer">
                        Project Showcasing
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="help" id="help" />
                      <Label htmlFor="help" className="font-normal cursor-pointer">
                        Help with Projects
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g. arduino, iot, sensors"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="body">Post Content (Markdown)</Label>
                  <Textarea
                    id="body"
                    placeholder="Write your post in Markdown...&#10;&#10;**Bold text**&#10;*Italic text*&#10;- List items&#10;```code blocks```"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    className="mt-2 min-h-[300px] font-mono text-sm"
                  />
                </div>
              </div>
            </Card>

            {body && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Preview</h3>
                <MarkdownViewer content={body} />
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/forums")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="cosmic-button flex-1">
                <Send className="mr-2 w-4 h-4" />
                Publish Post
              </Button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default NewPost;
