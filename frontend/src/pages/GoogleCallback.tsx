import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthData } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const error = searchParams.get("error");

    // Handle error from backend
    if (error) {
      console.error("Google OAuth error:", error);
      return;
    }

    // Handle successful authentication
    if (accessToken && refreshToken) {
      // Store tokens in auth store
      setAuthData({
        accessToken,
        refreshToken,
        user: null, // User info will be fetched separately if needed
      });

      // Redirect to landing page (home)
      navigate("/");
    }
  }, [searchParams, setAuthData, navigate]);

  const error = searchParams.get("error");
  const hasTokens = searchParams.get("access_token") && searchParams.get("refresh_token");

  // Loading state
  if (!error && hasTokens) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Completing sign in...</h2>
          <p className="text-muted-foreground mb-6">Please wait while we authenticate your account</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Failed</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => navigate("/login")}
            variant="hero"
            size="lg"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Default state (shouldn't normally be visible)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
          <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Processing...</h2>
        <p className="text-muted-foreground">Redirecting you shortly</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
