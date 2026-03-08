import { useLocation, useNavigate } from "react-router-dom";
import { useSubscriptionQueries } from "@/hooks/queries/useSubscriptionQueries";
import { useAuthStore } from "@/stores/authStore";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Store, MapPin, Phone, Mail, Globe, Check, Package } from "lucide-react";

interface LocationState {
  package: PackageFeatureDTO;
  restaurant: {
    name: string;
    address: string;
    phone: string;
    email: string;
    publicUrl: string;
    description: string;
  };
}

const PaymentConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { user } = useAuthStore();
  const { createRestaurantWithSubscription } = useSubscriptionQueries();

  if (!state) {
    navigate("/payment/select");
    return null;
  }

  const { package: pkg, restaurant } = state;
  const formatValue = (v?: number | null) => (v && v >= 9999 ? "Unlimited" : v);

  const handleProceedToPayment = async () => {
    if (!user?.userId) {
      navigate("/login");
      return;
    }

    try {
      const paymentResponse = await createRestaurantWithSubscription.mutateAsync({
        restaurantRequest: {
          userId: user.userId,
          name: restaurant.name,
          email: restaurant.email,
          restaurantPhone: restaurant.phone,
          publicUrl: restaurant.publicUrl,
          description: restaurant.description,
        },
        packageId: pkg.packageId!,
      });

      // Navigate to checkout with payment info
      navigate("/payment/checkout", {
        state: {
          package: pkg,
          restaurant,
          payment: paymentResponse,
        },
      });
    } catch (error) {
      console.error("Failed to create subscription:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center h-16 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">BentoX</span>
          </div>
        </div>
      </header>

      {/* Steps */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-center gap-3 text-sm">
          {["Choose Package", "Restaurant Info", "Confirm", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium transition-colors ${i === 2 ? "bg-primary text-primary-foreground" : i < 2 ? "text-accent" : "text-muted-foreground"}`}>
                {i < 2 ? <Check className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Review Your Order</h1>
            <p className="text-muted-foreground">Please confirm your details before proceeding to payment</p>
          </div>

          <div className="grid gap-6">
            {/* Restaurant Info */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Store className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Restaurant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Store className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{restaurant.name}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{restaurant.address}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{restaurant.phone}</span></div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{restaurant.email}</span></div>
                  {restaurant.publicUrl && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /><span>BentoX.com/{restaurant.publicUrl}</span></div>}
                </div>
                {restaurant.description && (
                  <p className="text-muted-foreground pt-2">{restaurant.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Package Info */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Selected Package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    ${pkg.price}/{pkg.billingPeriod === 1 ? "mo" : `${pkg.billingPeriod}mo`}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="grid sm:grid-cols-2 gap-2">
                  {pkg.features.map((f) => (
                    <div key={f.featureId} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>{f.featureName}{f.value != null && <span className="text-muted-foreground ml-1">({formatValue(f.value)})</span>}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Due Today</span>
                  <span className="text-2xl">${pkg.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Billed every {pkg.billingPeriod === 1 ? "month" : `${pkg.billingPeriod} months`}. Cancel anytime.</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button 
              size="lg" 
              onClick={handleProceedToPayment} 
              className="gap-2"
              disabled={createRestaurantWithSubscription.isPending}
            >
              {createRestaurantWithSubscription.isPending ? "Processing..." : "Proceed to Payment"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentConfirm;
