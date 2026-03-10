import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useStaffLogin } from "@/hooks/queries/useAuthQueries";
import { useAuthStore } from "@/stores/authStore";

const StaffLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const staffLoginMutation = useStaffLogin();

  useEffect(() => {
    // Only redirect if already authenticated before attempting login
    if (isAuthenticated && !staffLoginMutation.isSuccess && !staffLoginMutation.isPending) {
      const staffInfo = useAuthStore.getState().staffInfo;
      if (staffInfo) {
        const role = staffInfo.role;
        if (role === 'WAITER') {
          navigate('/waiter/dashboard');
        } else if (role === 'BRANCH_MANAGER') {
          navigate('/manager/dashboard');
        } else if (role === 'RECEPTIONIST') {
          navigate('/receptionist/dashboard');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, staffLoginMutation.isSuccess, staffLoginMutation.isPending, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    staffLoginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> Back to restaurant login
          </Link>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-violet-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Staff Portal</span>
          </div>
          <p className="text-muted-foreground mb-8 text-sm">Sign in with your staff account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</Label>
              <Input id="username" type="text" placeholder="e.g. staff_user" value={username} onChange={(e) => setUsername(e.target.value)} required className="h-11 rounded-lg bg-background/50 border-border/50 focus-visible:ring-violet-500/20 focus-visible:border-violet-500/50" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-lg pr-10 bg-background/50 border-border/50 focus-visible:ring-violet-500/20 focus-visible:border-violet-500/50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 rounded-lg bg-[#4ade80] hover:bg-[#22c55e] text-[#022c22] font-semibold transition-all duration-200" disabled={staffLoginMutation.isPending}>
              {staffLoginMutation.isPending ? "Signing in..." : "Staff Sign In"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden bg-[#0F172A] border-l border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-teal-500/5" />
        <div className="glow-orb w-[400px] h-[400px] bg-violet-500/20 top-0 left-0 animate-pulse-soft mix-blend-screen blur-[100px]" />
        <div className="glow-orb w-[300px] h-[300px] bg-teal-500/20 bottom-0 right-0 animate-pulse-soft mix-blend-screen blur-[80px]" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 text-center max-w-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-8 shadow-2xl shadow-teal-500/20 border border-teal-500/20 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400/20 to-transparent" />
            <UtensilsCrossed className="w-8 h-8 text-teal-400 relative z-10" />
          </div>
          <h2 className="text-[32px] font-bold tracking-tight mb-3 text-white leading-[1.1]">
            Staff Operations<br />
            <span className="text-[#4ade80]">made seamless</span>
          </h2>
          <p className="text-slate-400 leading-relaxed text-[15px] font-medium max-w-[320px]">
            Access your branch dashboard to manage orders, reservations, and tables seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
