import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, ExternalLink, Github, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarkdownViewer from "@/components/MarkdownViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import projectsData from "@/data/projects.json";

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projectsData.find(p => p.id === id);
  const [githubUrl, setGithubUrl] = useState("");
  const [readme, setReadme] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">Project not found</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: "Project Submitted! 🎉",
      description: "Your submission has been recorded successfully.",
    });
  };

  const relatedProjects = projectsData
    .filter(p => p.solar_system_id === project.solar_system_id && p.id !== project.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <Button asChild variant="ghost" className="mb-6">
          <Link to={`/solar-system/${project.solar_system_id}`} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold mb-4 glow-text">
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="outline" className="text-sm">
                  {project.difficulty}
                </Badge>
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  {project.est_time}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Card className="p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Project Goal</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </Card>

              <Card className="p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Learning Resources</h2>
                <div className="space-y-3">
                  {project.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <ExternalLink className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{resource.title}</span>
                    </a>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Submit Your Implementation</h2>
                
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Submission Received!</h3>
                    <p className="text-muted-foreground">Your project has been submitted successfully.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        GitHub Repository URL
                      </label>
                      <Input
                        type="url"
                        placeholder="https://github.com/username/repo"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        README (Markdown)
                      </label>
                      <Textarea
                        placeholder="# My Project&#10;&#10;## Description&#10;This project..."
                        value={readme}
                        onChange={(e) => setReadme(e.target.value)}
                        required
                        className="w-full min-h-[200px] font-mono text-sm"
                      />
                    </div>

                    {readme && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Preview</label>
                        <div className="border border-border rounded-lg p-4 bg-muted/30">
                          <MarkdownViewer content={readme} />
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="cosmic-button w-full">
                      <Github className="mr-2 w-4 h-4" />
                      Submit Project
                    </Button>
                  </form>
                )}
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Related Projects</h3>
              <div className="space-y-4">
                {relatedProjects.map((relProject) => (
                  <Link
                    key={relProject.id}
                    to={`/project/${relProject.id}`}
                    className="block p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {relProject.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relProject.description}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
