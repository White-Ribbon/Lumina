import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalaxyCard from "@/components/GalaxyCard";
import galaxiesData from "@/data/galaxies.json";

const Galaxies = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            Explore <span className="glow-text">Galaxies</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each galaxy represents a major technology domain filled with exciting projects
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {galaxiesData.map((galaxy, index) => (
            <GalaxyCard
              key={galaxy.id}
              id={galaxy.id}
              name={galaxy.name}
              description={galaxy.description}
              index={index}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Galaxies;
