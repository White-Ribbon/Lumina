import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink, FileText, Award, Calendar, Twitter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarkdownViewer from "@/components/MarkdownViewer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserProfile, useUserSubmissions, useUserBadges } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const { data: user, loading: userLoading, error: userError } = useUserProfile(id || '');
  const { data: submissionsData, loading: submissionsLoading } = useUserSubmissions(id);
  const { data: userBadges, loading: badgesLoading } = useUserBadges(id || '');

  if (userLoading) {
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

  if (userError || !user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {userError || "The user you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link to="/galaxies">Back to Explore</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const submissions = submissionsData?.items || [];
  const badges = userBadges || [];
  const isOwnProfile = currentUser?.hashid === user.hashid;

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
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold glow-text">{user.username}</h1>
                  {user.is_admin && (
                    <Badge variant="destructive" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{user.bio || "No bio available"}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {badges.length} badges earned
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {user.socials?.github && (
                    <Button asChild variant="outline" size="sm">
                      <a href={user.socials.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {user.socials?.linkedin && (
                    <Button asChild variant="outline" size="sm">
                      <a href={user.socials.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {user.socials?.twitter && (
                    <Button asChild variant="outline" size="sm">
                      <a href={user.socials.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {user.socials?.website && (
                    <Button asChild variant="outline" size="sm">
                      <a href={user.socials.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Badges Section */}
          {badges.length > 0 && (
            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6">
                Earned <span className="glow-text">Badges</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge: any) => (
                  <Card key={badge.id} className="cosmic-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-bold">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* My Submissions Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-6">
              {isOwnProfile ? 'My' : 'Project'} <span className="glow-text">Submissions</span>
            </h2>
            
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : submissions.length === 0 ? (
              <Card className="cosmic-card p-6 text-center text-muted-foreground">
                {isOwnProfile ? "No submissions yet. Start exploring projects!" : "No submissions yet."}
              </Card>
            ) : (
              <div className="grid gap-6">
                {submissions.map((submission: any) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="cosmic-card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            Project Submission
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                          <Badge 
                            variant={submission.status === 'approved' ? 'default' : 
                                    submission.status === 'pending' ? 'secondary' : 'destructive'}
                            className="mt-2"
                          >
                            {submission.status}
                          </Badge>
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
                ))}
              </div>
            )}
          </section>

          {/* Stats Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-6">
              <span className="glow-text">Statistics</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="cosmic-card p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{badges.length}</div>
                <div className="text-muted-foreground">Badges Earned</div>
              </Card>
              <Card className="cosmic-card p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{submissions.length}</div>
                <div className="text-muted-foreground">Projects Submitted</div>
              </Card>
              <Card className="cosmic-card p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{user.unlocked_galaxies?.length || 0}</div>
                <div className="text-muted-foreground">Galaxies Unlocked</div>
              </Card>
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
