import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface GalaxyCardProps {
  id: string;
  name: string;
  description: string;
  index: number;
}

const GalaxyCard = ({ id, name, description, index }: GalaxyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="cosmic-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <Sparkles className="w-10 h-10 text-primary group-hover:animate-float" />
      </div>
      
      <h3 className="text-2xl font-bold mb-3 group-hover:glow-text transition-all">
        {name}
      </h3>
      
      <p className="text-muted-foreground mb-6">
        {description}
      </p>
      
      <Button asChild variant="outline" className="w-full group-hover:border-primary/50 transition-all">
        <Link to={`/galaxy/${id}`} className="flex items-center justify-center gap-2">
          View Solar Systems
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </motion.div>
  );
};

export default GalaxyCard;
