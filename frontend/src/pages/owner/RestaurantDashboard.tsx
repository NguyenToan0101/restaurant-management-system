import { useParams, Navigate, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { mockRestaurants, Branch } from "@/data/mockData";
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
  Plus, Pencil, Store, Trophy, Users as UsersIcon,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CommingSoon from "@/pages/CommingSoon";
import StaffManagement from "@/pages/owner/StaffManagement";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

const RestaurantDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const restaurant = mockRestaurants.find((r) => r.id === id);

  if (!restaurant) return <Navigate to="/restaurants" replace />;

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<OverviewPage restaurant={restaurant} />} />
        <Route path="menu" element={<CommingSoon title="Menu Management" />} />
        <Route path="orders" element={<CommingSoon title="Orders" />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="settings" element={<CommingSoon title="Settings" />} />
      </Routes>
    </DashboardLayout>
  );
};

const OverviewPage = ({ restaurant }: { restaurant: typeof mockRestaurants[0] }) => {
  const [branches, setBranches] = useState<Branch[]>(restaurant.branches ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  
  // Restaurant info state
  const [restaurantInfoDialogOpen, setRestaurantInfoDialogOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState(restaurant.name);
  const [restaurantCuisine, setRestaurantCuisine] = useState(restaurant.cuisine);
  const [restaurantLogo, setRestaurantLogo] = useState(restaurant.logo);

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

  const handleRestaurantInfoSave = () => {
    if (!restaurantName.trim() || !restaurantCuisine.trim()) return;
    // In real app, this would update the restaurant via API
    setRestaurantInfoDialogOpen(false);
  };

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(restaurant.totalRevenue), icon: DollarSign, iconStyle: "feature-icon-teal", iconColor: "text-teal" },
    { label: "Monthly Revenue", value: formatCurrency(restaurant.monthlyRevenue), icon: TrendingUp, iconStyle: "feature-icon-blue", iconColor: "text-primary" },
    { label: "Total Orders", value: formatNumber(restaurant.totalOrders), icon: ShoppingCart, iconStyle: "feature-icon-violet", iconColor: "text-violet" },
    { label: "Branches", value: `${branches.filter((b) => b.isActive).length}/${branches.length}`, icon: GitBranch, iconStyle: "feature-icon-blue", iconColor: "text-primary" },
  ];

  return (
    <>
      <div className="p-6 lg:p-8">
        {/* Restaurant Info Section */}
        <Card className="glass-card border-border/60 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl">
                  {restaurantLogo}
                </div>
                <div>
                  <h1 className="text-2xl font-display mb-1">{restaurantName}</h1>
                  <p className="text-sm text-muted-foreground mb-2">{restaurantCuisine} Cuisine</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      {branches.filter(b => b.isActive).length} Active Branches
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {formatNumber(restaurant.totalOrders)} Total Orders
                    </span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setRestaurantInfoDialogOpen(true)}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit Info
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-lg font-display mb-1">Key Metrics</h2>
          <p className="text-sm text-muted-foreground">Performance overview for {restaurantName}</p>
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

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Daily Customers Chart */}
          <Card className="lg:col-span-3 glass-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UsersIcon className="w-4 h-4 text-primary" />
                Daily Customers (This Week)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={restaurant.dailyCustomers}>
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCustomers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? "bg-amber/15 text-amber" : i === 1 ? "bg-muted text-muted-foreground" : i === 2 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : "text-muted-foreground"
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

      {/* Edit Restaurant Info Dialog */}
      <Dialog open={restaurantInfoDialogOpen} onOpenChange={setRestaurantInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Restaurant Information</DialogTitle>
            <DialogDescription>
              Update your restaurant's basic information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input 
                id="restaurant-name" 
                placeholder="e.g. Pho Hanoi" 
                value={restaurantName} 
                onChange={(e) => setRestaurantName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-cuisine">Cuisine Type</Label>
              <Input 
                id="restaurant-cuisine" 
                placeholder="e.g. Vietnamese" 
                value={restaurantCuisine} 
                onChange={(e) => setRestaurantCuisine(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-logo">Logo Emoji</Label>
              <Input 
                id="restaurant-logo" 
                placeholder="e.g. 🍜" 
                value={restaurantLogo} 
                onChange={(e) => setRestaurantLogo(e.target.value)}
                maxLength={2}
              />
              <p className="text-xs text-muted-foreground">Choose an emoji to represent your restaurant</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestaurantInfoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRestaurantInfoSave} disabled={!restaurantName.trim() || !restaurantCuisine.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RestaurantDashboard;
