import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ManagerPromotions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">Manage promotional campaigns for your branch</p>
        </div>
        <Button className="w-full sm:w-auto flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Promotion
        </Button>
      </div>

      <Card className="glass-card border-border/60 min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <p className="text-sm text-muted-foreground">View and manage promotional campaigns</p>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          No promotions yet. Create your first promotion to get started.
        </CardContent>
      </Card>
    </div>
  );
}
