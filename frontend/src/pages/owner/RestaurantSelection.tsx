import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Store, GitBranch, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRestaurantsByOwner } from "@/hooks/queries/useRestaurantQueries";
import { useBranchesByOwner } from "@/hooks/queries/useBranchQueries";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRestaurant } from "@/hooks/queries/useRestaurantQueries";

const RestaurantSelection = () => {
  const user = useAuthStore((state) => state.user);
  const { data: restaurants, isLoading: isLoadingRestaurants } = useRestaurantsByOwner(user?.userId || '');
  const { data: branches } = useBranchesByOwner(user?.userId || '');
  const createRestaurant = useCreateRestaurant();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurantPhone: '',
    description: '',
  });

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.restaurantPhone.trim() || !user?.userId) return;

    await createRestaurant.mutateAsync({
      userId: user.userId,
      name: formData.name,
      email: formData.email,
      restaurantPhone: formData.restaurantPhone,
      description: formData.description || undefined,
    });

    setDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      restaurantPhone: '',
      description: '',
    });
  };

  const getBranchCount = (restaurantId: string) => {
    return branches?.filter(b => b.restaurantId === restaurantId).length || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">RestoHub</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display mb-2">Your Restaurants</h1>
              <p className="text-muted-foreground">Select a restaurant to manage its dashboard</p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Restaurant
            </Button>
          </div>

          <div className="grid gap-4">
            {isLoadingRestaurants ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : restaurants && restaurants.length > 0 ? (
              restaurants.map((r) => (
                <Link
                  key={r.restaurantId}
                  to={`/dashboard/${r.restaurantId}`}
                  className="glass-card rounded-2xl p-6 flex items-center gap-5 group hover:ring-1 hover:ring-primary/20 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
                    🍽️
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold truncate">{r.name}</h2>
                      <span className={`badge-gradient text-[11px] font-medium px-2 py-0.5 rounded-full ${r.status ? 'text-teal' : 'text-muted-foreground'}`}>
                        {r.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-primary" />
                        {r.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-violet" />
                        {getBranchCount(r.restaurantId)} branches
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No restaurants yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first restaurant to get started
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Restaurant
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Restaurant Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Restaurant</DialogTitle>
            <DialogDescription>
              Enter your restaurant details to get started
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">Restaurant Name *</Label>
              <Input
                id="restaurant-name"
                placeholder="e.g. Pho Hanoi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-email">Email *</Label>
              <Input
                id="restaurant-email"
                type="email"
                placeholder="e.g. contact@phohanoi.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-phone">Phone *</Label>
              <Input
                id="restaurant-phone"
                placeholder="e.g. +84 123 456 789"
                value={formData.restaurantPhone}
                onChange={(e) => setFormData({ ...formData, restaurantPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-description">Description</Label>
              <Textarea
                id="restaurant-description"
                placeholder="Tell us about your restaurant..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name.trim() || !formData.email.trim() || !formData.restaurantPhone.trim() || createRestaurant.isPending}
            >
              {createRestaurant.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Restaurant'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantSelection;
