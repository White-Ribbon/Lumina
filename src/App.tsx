import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Galaxies from "./pages/Galaxies";
import GalaxyDetail from "./pages/GalaxyDetail";
import SolarSystemDetail from "./pages/SolarSystemDetail";
import ProjectDetail from "./pages/ProjectDetail";
import Forums from "./pages/Forums";
import NewPost from "./pages/NewPost";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import CommunityProjects from "./pages/CommunityProjects";
import BackendTest from "./pages/BackendTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/test" element={<BackendTest />} />
            <Route path="/galaxies" element={<Galaxies />} />
            <Route path="/galaxy/:id" element={<GalaxyDetail />} />
            <Route path="/solar-system/:id" element={<SolarSystemDetail />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/forums/new" element={<NewPost />} />
            <Route path="/forums/post/:id" element={<PostDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/community-projects" element={<CommunityProjects />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
