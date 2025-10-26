import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SolarSystemCard from "@/components/SolarSystemCard";
import { Button } from "@/components/ui/button";
import galaxiesData from "@/data/galaxies.json";
import solarSystemsData from "@/data/solarSystems.json";

const GalaxyDetail = () => {
  const { id } = useParams();
  const galaxy = galaxiesData.find(g => g.id === id);
  const solarSystems = solarSystemsData.filter(ss => ss.galaxy_id === id);

  if (!galaxy) {
    return <div className="min-h-screen flex items-center justify-center">Galaxy not found</div>;
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
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Solar Systems</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solarSystems.map((system, index) => (
              <SolarSystemCard
                key={system.id}
                id={system.id}
                name={system.name}
                description={system.description}
                tags={system.tags}
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

export default GalaxyDetail;
