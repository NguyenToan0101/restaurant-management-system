import { Link } from "react-router-dom";
import { mockRestaurants } from "@/data/MockData";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Store, TrendingUp, GitBranch } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const RestaurantSelection = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">RestoHub</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Restaurant
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-display mb-2">Your Restaurants</h1>
            <p className="text-muted-foreground">Select a restaurant to manage its dashboard</p>
          </div>

          <div className="grid gap-4">
            {mockRestaurants.map((r) => (
              <Link
                key={r.id}
                to={`/dashboard/${r.id}`}
                className="glass-card rounded-2xl p-6 flex items-center gap-5 group hover:ring-1 hover:ring-primary/20 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
                  {r.logo}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold truncate">{r.name}</h2>
                    <span className="badge-gradient text-primary text-[11px] font-medium px-2 py-0.5 rounded-full">{r.cuisine}</span>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-teal" />
                      {formatCurrency(r.monthlyRevenue)}/mo
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-violet" />
                      {r.branches.length} branches
                    </span>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RestaurantSelection;
