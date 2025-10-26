import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalaxyCard from "@/components/GalaxyCard";
import { useGalaxies } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";

const Galaxies = () => {
  const { data: galaxies, loading, error } = useGalaxies();
  const { isAuthenticated } = useAuth();

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Error Loading Galaxies</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Make sure your backend is running at http://localhost:8000
            </p>
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
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-4">
              Sign in to unlock more galaxies and track your progress
            </p>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {galaxies?.map((galaxy, index) => (
            <GalaxyCard
              key={galaxy.id}
              id={galaxy.hashid}
              name={galaxy.name}
              description={galaxy.description}
              index={index}
            />
          )) || []}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Galaxies;
