import { useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { mockRestaurants, Branch } from "@/data/MockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign, ShoppingCart, TrendingUp, GitBranch,
  Plus, Pencil, Store, Trophy,
} from "lucide-react";
import  DashboardLayout  from "@/components/dashboard/DashboardLayout";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

const RestaurantDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const restaurant = mockRestaurants.find((r) => r.id === id);

  const [branches, setBranches] = useState<Branch[]>(restaurant?.branches ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");

  if (!restaurant) return <Navigate to="/dashboard" replace />;

  const openCreate = () => {
    setEditingBranch(null);
    setFormName("");
    setFormAddress("");
    setDialogOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditingBranch(b);
    setFormName(b.name);
    setFormAddress(b.address);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formAddress.trim()) return;
    if (editingBranch) {
      setBranches((prev) =>
        prev.map((b) => (b.id === editingBranch.id ? { ...b, name: formName, address: formAddress } : b))
      );
    } else {
      setBranches((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, name: formName, address: formAddress, isActive: true },
      ]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (branchId: string) => {
    setBranches((prev) => prev.map((b) => (b.id === branchId ? { ...b, isActive: !b.isActive } : b)));
  };

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(restaurant.totalRevenue), icon: DollarSign, iconStyle: "feature-icon-teal", iconColor: "text-teal" },
    { label: "Monthly Revenue", value: formatCurrency(restaurant.monthlyRevenue), icon: TrendingUp, iconStyle: "feature-icon-blue", iconColor: "text-primary" },
    { label: "Total Orders", value: formatNumber(restaurant.totalOrders), icon: ShoppingCart, iconStyle: "feature-icon-violet", iconColor: "text-violet" },
    { label: "Branches", value: `${branches.filter((b) => b.isActive).length}/${branches.length}`, icon: GitBranch, iconStyle: "feature-icon-blue", iconColor: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-display mb-1">Overview</h1>
          <p className="text-sm text-muted-foreground">Key metrics and branch management for {restaurant.name}</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <Card key={s.label} className="glass-card border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
                  <div className={`w-9 h-9 rounded-lg ${s.iconStyle} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                </div>
                <p className="text-xl font-display">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Top Sellers */}
          <Card className="lg:col-span-2 glass-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-4 h-4 text-amber" />
                Top Best Sellers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right pr-6">Sold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurant.topSellers.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-6 font-medium">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          i === 0 ? "bg-amber/15 text-amber" : i === 1 ? "bg-muted text-muted-foreground" : i === 2 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                        }`}>
                          {i + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.revenue)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 font-semibold text-sm">{formatNumber(item.sold)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Branch Management */}
          <Card className="lg:col-span-3 glass-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="w-4 h-4 text-primary" />
                  Branch Management
                </CardTitle>
                <Button size="sm" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Branch</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="pl-6 font-medium text-sm">{b.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{b.address}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch checked={b.isActive} onCheckedChange={() => toggleActive(b.id)} />
                          <span className={`text-xs font-medium ${b.isActive ? "text-teal" : "text-muted-foreground"}`}>
                            {b.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {branches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No branches yet. Click "Add" to create your first branch.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Branch Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
            <DialogDescription>
              {editingBranch ? "Update branch information" : "Enter new branch details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input id="branch-name" placeholder="e.g. Downtown Branch" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-address">Address</Label>
              <Input id="branch-address" placeholder="e.g. 123 Main St, District 1" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formName.trim() || !formAddress.trim()}>
              {editingBranch ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RestaurantDashboard;
