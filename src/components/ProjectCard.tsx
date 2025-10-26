import { Link } from "react-router-dom";
import { Star, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  est_time: string;
  index: number;
}

const ProjectCard = ({ id, title, description, tags, difficulty, est_time, index }: ProjectCardProps) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-red-400";
      default: return "text-primary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="cosmic-card group"
    >
      <div className="flex items-start justify-between mb-3">
        <Star className="w-6 h-6 text-accent group-hover:fill-accent transition-all" />
        <Badge variant="outline" className={getDifficultyColor(difficulty)}>
          {difficulty}
        </Badge>
      </div>
      
      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {est_time}
        </span>
      </div>
      
      <Button asChild variant="outline" className="w-full">
        <Link to={`/project/${id}`}>
          View Details
        </Link>
      </Button>
    </motion.div>
  );
};

export default ProjectCard;
