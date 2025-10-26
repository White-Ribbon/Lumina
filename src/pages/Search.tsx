import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalaxyCard from "@/components/GalaxyCard";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import galaxiesData from "@/data/galaxies.json";
import projectsData from "@/data/projects.json";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setSearchParams({ q: value });
  };

  const filteredGalaxies = galaxiesData.filter(galaxy =>
    galaxy.name.toLowerCase().includes(query.toLowerCase()) ||
    galaxy.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = projectsData.filter(project =>
    project.title.toLowerCase().includes(query.toLowerCase()) ||
    project.description.toLowerCase().includes(query.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold mb-8">
            Search <span className="glow-text">Projects</span>
          </h1>

          <div className="relative mb-8 max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search galaxies, projects, tags..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {query && (
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                <TabsTrigger value="projects">
                  Projects ({filteredProjects.length})
                </TabsTrigger>
                <TabsTrigger value="galaxies">
                  Galaxies ({filteredGalaxies.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="projects">
                {filteredProjects.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    No projects found for "{query}"
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project, index) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        tags={project.tags}
                        difficulty={project.difficulty}
                        est_time={project.est_time}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="galaxies">
                {filteredGalaxies.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    No galaxies found for "{query}"
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGalaxies.map((galaxy, index) => (
                      <GalaxyCard
                        key={galaxy.id}
                        id={galaxy.id}
                        name={galaxy.name}
                        description={galaxy.description}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {!query && (
            <div className="text-center text-muted-foreground py-12">
              Enter a search term to find galaxies and projects
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
