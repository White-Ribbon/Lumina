import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { useSolarSystem, useProjects } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";

const SolarSystemDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  const { data: solarSystem, loading: solarSystemLoading, error: solarSystemError } = useSolarSystem(id || '');
  const { data: projects, loading: projectsLoading, error: projectsError } = useProjects(id);

  if (solarSystemLoading) {
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

  if (solarSystemError || !solarSystem) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Solar System Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {solarSystemError || "The solar system you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link to="/galaxies">Back to Galaxies</Link>
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
          <Link to={`/galaxy/${solarSystem.galaxy_id}`} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Galaxy
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 glow-text">
            {solarSystem.name}
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            {solarSystem.description}
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              Sign in to submit projects and earn badges
            </p>
          )}
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Available Projects</h2>
          
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : projectsError ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">Error Loading Projects</h3>
              <p className="text-muted-foreground">{projectsError}</p>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any, index: number) => (
                <ProjectCard
                  key={project.id}
                  id={project.hashid}
                  title={project.title}
                  description={project.description}
                  tags={project.tags}
                  difficulty={project.difficulty}
                  est_time={project.est_time}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground">
                This solar system is still being explored. Check back later!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SolarSystemDetail;
