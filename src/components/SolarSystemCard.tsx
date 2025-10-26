import { Link } from "react-router-dom";
import { ChevronRight, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SolarSystemCardProps {
  id: string;
  name: string;
  description: string;
  tags: string[];
  index: number;
}

const SolarSystemCard = ({ id, name, description, tags, index }: SolarSystemCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="cosmic-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <Sun className="w-8 h-8 text-secondary group-hover:rotate-180 transition-transform duration-700" />
      </div>
      
      <h3 className="text-xl font-bold mb-2">
        {name}
      </h3>
      
      <p className="text-muted-foreground mb-4 text-sm">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      
      <Button asChild variant="outline" className="w-full group-hover:border-secondary/50 transition-all">
        <Link to={`/solar-system/${id}`} className="flex items-center justify-center gap-2">
          View Projects
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </motion.div>
  );
};

export default SolarSystemCard;
