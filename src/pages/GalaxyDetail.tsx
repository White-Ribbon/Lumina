import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SolarSystemCard from "@/components/SolarSystemCard";
import { Button } from "@/components/ui/button";
import { useGalaxy, useSolarSystems } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";

const GalaxyDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  const { data: galaxy, loading: galaxyLoading, error: galaxyError } = useGalaxy(id || '');
  const { data: solarSystems, loading: solarSystemsLoading, error: solarSystemsError } = useSolarSystems(id);

  if (galaxyLoading) {
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

  if (galaxyError || !galaxy) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Galaxy Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {galaxyError || "The galaxy you're looking for doesn't exist."}
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
          <Link to="/galaxies" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Galaxies
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 glow-text">
            {galaxy.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            {galaxy.description}
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-4">
              Sign in to unlock more galaxies and track your progress
            </p>
          )}
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Solar Systems</h2>
          
          {solarSystemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : solarSystemsError ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">Error Loading Solar Systems</h3>
              <p className="text-muted-foreground">{solarSystemsError}</p>
            </div>
          ) : solarSystems && solarSystems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solarSystems.map((system: any, index: number) => (
                <SolarSystemCard
                  key={system.id}
                  id={system.hashid}
                  name={system.name}
                  description={system.description}
                  tags={system.tags}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">No Solar Systems Yet</h3>
              <p className="text-muted-foreground">
                This galaxy is still being explored. Check back later!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GalaxyDetail;
