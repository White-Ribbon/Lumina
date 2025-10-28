import { Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 mt-20 py-8 bg-gradient-to-tr from-card to-secondary bg-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 glow-text">Lumina</h3>
            <p className="text-muted text-sm">
              Discover and share amazing technology projects across the universe
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/30 text-center text-sm text-muted">
          © 2025 Lumina. Built by <a href="https://github.com/White-Ribbon" className="text-muted hover:text-primary transition-colors visited:text-muted border-b hover:border-b-primary ">White Ribbon</a> on GitHub.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
