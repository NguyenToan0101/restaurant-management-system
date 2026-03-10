import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ReceiptText } from "lucide-react";

export default function ManagerBills() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bill Management</h1>
        <p className="text-muted-foreground">View bill history and details</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <ReceiptText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">From paid bills today</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">All paid bills</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/60 min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Bill History</CardTitle>
          <p className="text-sm text-muted-foreground">View all bills and their details</p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-muted/20 border border-border/30">
              <ReceiptText className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm">No bills found</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
