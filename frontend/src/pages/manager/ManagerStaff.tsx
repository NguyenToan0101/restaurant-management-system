import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, ChevronDown } from "lucide-react";

export default function ManagerStaff() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff members in your branch</p>
        </div>
        <Button className="w-full sm:w-auto flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Staff Account
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiters</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receptionists</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 bg-background/50 border-border/60" placeholder="Search by username..." />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-between gap-2 border border-border/60 rounded-md px-3 py-2 text-sm bg-background/50 cursor-pointer w-full sm:w-[150px]">
            <span>All Roles</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between gap-2 border border-border/60 rounded-md px-3 py-2 text-sm bg-background/50 cursor-pointer w-full sm:w-[150px]">
            <span>All Status</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <Card className="glass-card border-border/60 min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Staff Accounts</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Branch ID is missing. Please navigate from a valid branch context.
        </CardContent>
      </Card>
    </div>
  );
}
