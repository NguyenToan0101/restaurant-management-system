import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { packageApi } from "@/api/packageApi";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, ArrowRight, Store, MapPin, Phone, Mail, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const PackageSelection = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"package" | "restaurant">("package");
  const [selectedPkg, setSelectedPkg] = useState<PackageFeatureDTO | null>(null);
  
  // Fetch active packages from backend
  const { data: activePackages = [], isLoading } = useQuery({
    queryKey: ['packages', 'active'],
    queryFn: packageApi.getActivePackages,
  });
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
  });

  const handleContinue = () => {
    if (step === "package" && selectedPkg) {
      setStep("restaurant");
    } else if (step === "restaurant" && form.name && form.address && form.phone && form.email) {
      navigate("/payment/confirm", { 
        state: { 
          package: selectedPkg, 
          restaurant: form 
        } 
      });
    }
  };

  const formatValue = (v?: number) => (v && v >= 9999 ? "Unlimited" : v);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center h-16 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => (step === "restaurant" ? setStep("package") : navigate(-1))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">RestoHub</span>
          </div>
        </div>
      </header>

      {/* Steps indicator */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-center gap-3 text-sm">
          {["Choose Package", "Restaurant Info", "Confirm", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full font-medium transition-colors",
                i === (step === "package" ? 0 : 1) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 pb-16">
        {step === "package" && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
              <p className="text-muted-foreground">Select the package that fits your restaurant's needs</p>
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading packages...</p>
              </div>
            ) : activePackages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No packages available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {activePackages.map((pkg) => {
                  const isSelected = selectedPkg?.packageId === pkg.packageId;
                  const isPopular = pkg.name === "Pro";
                  return (
                    <Card
                      key={pkg.packageId}
                      className={cn(
                        "relative cursor-pointer transition-all hover:shadow-lg",
                        isSelected && "ring-2 ring-primary shadow-lg",
                        isPopular && "border-primary/40"
                      )}
                      onClick={() => setSelectedPkg(pkg)}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="brand-gradient text-primary-foreground border-0">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pt-8">
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                        <div className="pt-4">
                          <span className="text-4xl font-bold">{pkg.price}VND</span>
                          <span className="text-muted-foreground">/{pkg.billingPeriod === 1 ? "mo" : `${pkg.billingPeriod}mo`}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {pkg.features.map((f) => (
                          <div key={f.featureId} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <span>
                              {f.featureName}
                              {f.value != null && (
                                <span className="text-muted-foreground ml-1">({formatValue(f.value)})</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                      <CardFooter>
                        <Button variant={isSelected ? "default" : "outline"} className="w-full">
                          {isSelected ? "Selected" : "Select Plan"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center mt-10">
              <Button size="lg" disabled={!selectedPkg} onClick={handleContinue} className="gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "restaurant" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-2">Restaurant Information</h1>
              <p className="text-muted-foreground">Tell us about your restaurant</p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" placeholder="e.g. Pho Hanoi" className="pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="address" placeholder="123 Main St, City" className="pl-10" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="phone" placeholder="+84 123 456 789" className="pl-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="contact@restaurant.com" className="pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="website" placeholder="https://yourrestaurant.com" className="pl-10" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (optional)</Label>
                  <Textarea id="desc" placeholder="A brief description of your restaurant..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("package")}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button disabled={!form.name || !form.address || !form.phone || !form.email} onClick={handleContinue} className="gap-2">
                  Review Order <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default PackageSelection;
