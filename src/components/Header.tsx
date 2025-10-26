import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Search as SearchIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const currentUserId = "user-1"; // Simulated current user

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold group flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary group-hover:animate-float" />
            <span className="glow-text hidden sm:inline">Galaxy Explorer</span>
          </Link>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30"
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <Link to="/galaxies" className="hover:text-primary transition-colors hidden sm:inline">
              Explore
            </Link>
            <Link to="/forums" className="hover:text-primary transition-colors hidden sm:inline">
              Forums
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card z-50">
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${currentUserId}`}>My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/forums/new">New Post</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/galaxies">Explore</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/forums">Forums</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
