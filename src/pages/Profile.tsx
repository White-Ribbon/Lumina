import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarkdownViewer from "@/components/MarkdownViewer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import usersData from "@/data/users.json";
import submissionsData from "@/data/submissions.json";
import projectsData from "@/data/projects.json";
import forumsData from "@/data/forums.json";

const Profile = () => {
  const { id } = useParams();
  const user = usersData.find(u => u.id === id);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center">User Not Found</h1>
        </main>
        <Footer />
      </div>
    );
  }

  const userSubmissions = submissionsData.filter(s => s.user_id === user.id);
  const userPosts = [...forumsData.showcasing, ...forumsData.help].filter(
    p => p.author_id === user.id
  );
  const savedProjects = projectsData.filter(p => user.saved_projects.includes(p.id));

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* User Profile Card */}
          <Card className="cosmic-card p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 glow-text">{user.name}</h1>
                <p className="text-muted-foreground mb-4">{user.bio}</p>
                
                <div className="flex gap-3">
                  {user.github_link && (
                    <Button asChild variant="outline" size="sm">
                      <a href={user.github_link} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {user.linkedin_link && (
                    <Button asChild variant="outline" size="sm">
                      <a href={user.linkedin_link} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* My Submissions Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-6">
              My <span className="glow-text">Submissions</span>
            </h2>
            
            {userSubmissions.length === 0 ? (
              <Card className="cosmic-card p-6 text-center text-muted-foreground">
                No submissions yet
              </Card>
            ) : (
              <div className="grid gap-6">
                {userSubmissions.map((submission) => {
                  const project = projectsData.find(p => p.id === submission.project_id);
                  return (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="cosmic-card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {project?.title || "Project"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={submission.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Repo
                            </a>
                          </Button>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            README
                          </div>
                          <MarkdownViewer content={submission.readme_md} className="text-sm" />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* My Posts Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-6">
              My <span className="glow-text">Posts</span>
            </h2>
            
            {userPosts.length === 0 ? (
              <Card className="cosmic-card p-6 text-center text-muted-foreground">
                No posts yet
              </Card>
            ) : (
              <div className="grid gap-4">
                {userPosts.map((post) => (
                  <Card key={post.id} className="cosmic-card p-6 hover:border-primary/50 transition-all">
                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/forums">View in Forums</Link>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Saved Projects Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6">
              Saved <span className="glow-text">Projects</span>
            </h2>
            
            {savedProjects.length === 0 ? (
              <Card className="cosmic-card p-6 text-center text-muted-foreground">
                No saved projects yet
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProjects.map((project) => (
                  <Card key={project.id} className="cosmic-card p-6 hover:border-primary/50 transition-all">
                    <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to={`/project/${project.id}`}>View Project</Link>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
