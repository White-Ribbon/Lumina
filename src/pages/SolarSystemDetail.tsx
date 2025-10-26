import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import solarSystemsData from "@/data/solarSystems.json";
import projectsData from "@/data/projects.json";

const SolarSystemDetail = () => {
  const { id } = useParams();
  const solarSystem = solarSystemsData.find(ss => ss.id === id);
  const projects = projectsData.filter(p => p.solar_system_id === id);

  if (!solarSystem) {
    return <div className="min-h-screen flex items-center justify-center">Solar System not found</div>;
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
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Available Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                tags={project.tags}
                difficulty={project.difficulty}
                est_time={project.est_time}
                index={index}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SolarSystemDetail;
