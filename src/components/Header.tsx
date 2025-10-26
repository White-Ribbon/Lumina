import { Link } from "react-router-dom";
import { Sparkles, Telescope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-8 h-8 text-primary animate-float" />
            <span className="text-2xl font-bold glow-text">Galaxy Explorer</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/galaxies" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Telescope className="w-4 h-4" />
              Explore
            </Link>
            <Link to="/forums" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </Link>
          </nav>

          <Button asChild className="cosmic-button">
            <Link to="/galaxies">Start Exploring</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
