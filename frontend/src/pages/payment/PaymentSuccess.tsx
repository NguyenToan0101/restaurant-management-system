import { useNavigate, useLocation } from "react-router-dom";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import type { SubscriptionPaymentResponse } from "@/types/dto/subscription.dto";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Store, PartyPopper } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    package: PackageFeatureDTO; 
    restaurant: { name: string }; 
    payment: SubscriptionPaymentResponse 
  } | null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-14 h-14 text-accent" />
          </div>
          <PartyPopper className="w-8 h-8 text-amber absolute -top-1 -right-1" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">Your subscription has been activated</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3 text-sm">
            {state?.restaurant && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Restaurant</span>
                <span className="font-medium flex items-center gap-1.5"><Store className="w-4 h-4" />{state.restaurant.name}</span>
              </div>
            )}
            {state?.package && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{state.package.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">${state.package.price}/mo</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-accent font-semibold">Active</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 pt-2">
          <Button size="lg" className="w-full gap-2" onClick={() => navigate("/dashboard")}>
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
