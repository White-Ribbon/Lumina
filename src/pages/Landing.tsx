import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Telescope, Users, Rocket, Sparkles, Globe, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <Sparkles className="w-16 h-16 text-primary" />
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Explore the <span className="glow-text">Universe</span> of Projects
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover technology projects across galaxies of innovation. From IoT to Blockchain, 
                AI to Game Dev—your next coding adventure awaits.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="cosmic-button text-lg px-8">
                  <Link to="/galaxies">
                    <Telescope className="mr-2 w-5 h-5" />
                    Explore Galaxies
                  </Link>
                </Button>
                
                <Button asChild size="lg" variant="outline" className="text-lg px-8">
                  <Link to="/forums">
                    <Users className="mr-2 w-5 h-5" />
                    Join Community
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">
                Navigate the <span className="glow-text">Cosmos</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Your journey through technology, organized beautifully
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: "Galaxies",
                  description: "Major technology domains like Blockchain, IoT, AI/ML, Web Dev, and Game Development"
                },
                {
                  icon: Rocket,
                  title: "Solar Systems",
                  description: "Specific technologies within each galaxy—Arduino, React, Unity, and more"
                },
                {
                  icon: Sparkles,
                  title: "Projects (Stars)",
                  description: "Individual projects with guides, resources, and community submissions"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="cosmic-card text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-4">
                  Learn. Build. <span className="glow-text">Share.</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Each project comes with detailed guides, learning resources, and a community 
                  ready to help you succeed. Submit your own implementations and showcase your work.
                </p>
                <ul className="space-y-3">
                  {[
                    "Detailed project descriptions and goals",
                    "Curated learning resources and tutorials",
                    "Difficulty levels and time estimates",
                    "Community forums for help and showcasing",
                    "Submit your GitHub repos and READMEs"
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="cosmic-card animate-glow-pulse"
              >
                <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Telescope className="w-24 h-24 text-primary/50" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Thousands of projects waiting to be discovered
              </p>
              <Button asChild size="lg" className="cosmic-button text-lg px-10">
                <Link to="/galaxies">
                  Begin Exploring
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
