import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterRequest } from '@/types/auth';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register form state
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    bio: '',
    socials: {
      github: '',
      linkedin: '',
      twitter: '',
      website: '',
    },
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(loginData.username, loginData.password);
      toast({
        title: "Welcome back! 🎉",
        description: "You've successfully logged in.",
      });
      navigate('/galaxies');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await register(registerData);
      toast({
        title: "Welcome to Cosmic Project Forge! 🚀",
        description: "Your account has been created successfully.",
      });
      navigate('/galaxies');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold group">
            <Sparkles className="w-6 h-6 text-primary group-hover:animate-float" />
            <span className="glow-text">Cosmic Project Forge</span>
          </Link>
          <p className="text-muted-foreground mt-2">
            Join the cosmic journey of learning and building
          </p>
        </div>

        <Card className="cosmic-card">
          <CardHeader>
            <CardTitle className="text-center">Welcome to the Universe</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one to start exploring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username or Email</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username or email"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full cosmic-button" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <span className="text-primary cursor-pointer" onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]') as HTMLElement;
                    const registerTab = tabsList?.querySelector('[value="register"]') as HTMLElement;
                    registerTab?.click();
                  }}>
                    Sign up
                  </span>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username *</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Create a password (min 8 characters)"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Input
                      id="bio"
                      type="text"
                      placeholder="Tell us about yourself"
                      value={registerData.bio}
                      onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Social Links (Optional)</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="GitHub profile URL"
                          value={registerData.socials?.github || ''}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            socials: { ...registerData.socials, github: e.target.value }
                          })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="LinkedIn profile URL"
                          value={registerData.socials?.linkedin || ''}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            socials: { ...registerData.socials, linkedin: e.target.value }
                          })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="Twitter profile URL"
                          value={registerData.socials?.twitter || ''}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            socials: { ...registerData.socials, twitter: e.target.value }
                          })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="Personal website URL"
                          value={registerData.socials?.website || ''}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            socials: { ...registerData.socials, website: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full cosmic-button" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <span className="text-primary cursor-pointer" onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]') as HTMLElement;
                    const loginTab = tabsList?.querySelector('[value="login"]') as HTMLElement;
                    loginTab?.click();
                  }}>
                    Sign in
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
