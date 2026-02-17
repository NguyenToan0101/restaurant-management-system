import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useLogin } from "@/hooks/queries/useAuthQueries";
import { useAuthStore } from "@/stores/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">RestoHub</span>
          </div>
          <p className="text-muted-foreground mb-8 text-sm">Sign in to manage your restaurant</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input id="email" type="email" placeholder="you@restaurant.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-lg pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <button className="text-primary font-semibold hover:underline">Sign up free</button>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 hero-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="glow-orb w-[350px] h-[350px] bg-violet/20 top-[10%] right-[10%] animate-pulse-soft" />
        <div className="glow-orb w-[250px] h-[250px] bg-teal/15 bottom-[15%] left-[15%] animate-pulse-soft" style={{ animationDelay: "2s" }} />
        <div className="glow-orb w-[200px] h-[200px] bg-primary/15 top-[50%] left-[50%] animate-pulse-soft" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 text-center text-secondary-foreground max-w-md">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/20">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-display mb-4">Restaurant management<br /><span className="text-gradient-hero">made effortless</span></h2>
          <p className="text-secondary-foreground/40 leading-relaxed text-sm">
            Over 2,500 restaurants use RestoHub daily to streamline operations and grow their revenue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
