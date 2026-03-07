import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  ArrowLeft,
  Plus,
  Pencil,
  UserCircle,
  Loader2,
  Users,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useBranchesByRestaurant } from "@/hooks/queries/useBranchQueries";
import {
  useStaffByBranch,
  useCreateStaffAccount,
  useUpdateStaffAccount,
  useToggleStaffStatus,
} from "@/hooks/queries/useStaffQueries";
import type {
  BranchDTO,
  StaffAccountDTO,
  StaffRoleName,
} from "@/types/dto";

const roleColors: Record<StaffRoleName, string> = {
  WAITER: "bg-teal/15 text-teal border-teal/30",
  RECEPTIONIST: "bg-amber/15 text-amber border-amber/30",
  ADMIN: "bg-primary/15 text-primary border-primary/30",
  RESTAURANT_OWNER: "bg-primary/15 text-primary border-primary/30",
  BRANCH_MANAGER: "bg-primary/15 text-primary border-primary/30",
};

const roleLabel: Record<StaffRoleName, string> = {
  WAITER: "Waiter",
  RECEPTIONIST: "Receptionist",
  ADMIN: "Admin",
  RESTAURANT_OWNER: "Owner",
  BRANCH_MANAGER: "Branch Manager",
};

const StaffManagement = () => {
  const { id: restaurantId } = useParams<{ id: string }>();

  const {
    data: branches = [],
    isLoading: isLoadingBranches,
  } = useBranchesByRestaurant(restaurantId || "");

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccountDTO | null>(
    null,
  );

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<StaffRoleName>("WAITER");

  const {
    data: staffPage,
    isLoading: isLoadingStaff,
  } = useStaffByBranch(selectedBranchId || undefined);

  const staff: StaffAccountDTO[] = staffPage?.items || [];

  const createStaff = useCreateStaffAccount();
  const updateStaff = useUpdateStaffAccount();
  const toggleStatus = useToggleStaffStatus();

  const selectedBranch: BranchDTO | undefined = branches.find(
    (b) => b.branchId === selectedBranchId,
  );

  const getStaffCount = (branch: BranchDTO) => branch.staffCount ?? 0;

  const openCreate = () => {
    setEditingStaff(null);
    setFormUsername("");
    setFormPassword("");
    setFormRole("WAITER");
    setDialogOpen(true);
  };

  const openEdit = (s: StaffAccountDTO) => {
    setEditingStaff(s);
    setFormUsername(s.username);
    setFormPassword("");
    setFormRole((s.role?.name as StaffRoleName) || "WAITER");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBranchId || !formUsername.trim()) return;

    if (editingStaff) {
      await updateStaff.mutateAsync({
        staffAccountId: editingStaff.id,
        username: formUsername.trim(),
        role: {
          name: formRole,
          description: editingStaff.role?.description || "",
        },
        status: editingStaff.status,
        branchId: selectedBranchId,
      });
    } else {
      if (!formPassword.trim()) return;

      await createStaff.mutateAsync({
        username: formUsername.trim(),
        password: formPassword.trim(),
        branchId: selectedBranchId,
        role: {
          name: formRole,
          description: "",
        },
      });
    }

    setDialogOpen(false);
  };

  const toggleActive = (staffId: string) => {
    toggleStatus.mutate(staffId);
  };

  const allBranchStaff = staff;
  const activeStaff = allBranchStaff.filter((s) => s.isActive);
  const inactiveStaff = allBranchStaff.filter((s) => !s.isActive);

  const handleDeactivateAll = () => {
    activeStaff.forEach((s) => toggleStatus.mutate(s.id));
  };

  const handleActivateAll = () => {
    inactiveStaff.forEach((s) => toggleStatus.mutate(s.id));
  };

  // Branch list view
  if (!selectedBranchId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-display mb-1">Staff Management</h2>
          <p className="text-sm text-muted-foreground">
            Select a branch to manage its staff accounts
          </p>
        </div>

        {isLoadingBranches ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3">
            {branches.map((branch) => (
              <Card
                key={branch.branchId}
                className="glass-card border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setSelectedBranchId(branch.branchId!)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm max-w-[220px] truncate">
                          {branch.address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {branch.mail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {getStaffCount(branch)} staff
                      </Badge>
                      {branch.isActive === false && (
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {branches.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No branches yet. Add branches in the Overview tab first.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Staff list view for selected branch
  return (
    <>
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedBranchId(null)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-display">
              {selectedBranch?.address || "Branch"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedBranch?.mail}
            </p>
          </div>
        </div>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCircle className="w-4 h-4 text-primary" />
                Staff Management
              </CardTitle>
              <Button size="sm" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-1" />
                Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingStaff ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="active" className="w-full">
                <div className="px-6 pt-2 flex items-center justify-between border-b">
                  <TabsList>
                    <TabsTrigger value="active" className="gap-2">
                      Active ({activeStaff.length})
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="gap-2">
                      Inactive ({inactiveStaff.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="active" className="m-0">
                  <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeactivateAll}
                      disabled={
                        activeStaff.length === 0 || toggleStatus.isPending
                      }
                    >
                      Deactivate All
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right pr-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeStaff.map((s) => {
                        const roleName = (s.role?.name ||
                          "WAITER") as StaffRoleName;
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="pl-6 font-medium text-sm">
                              {s.username}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={roleColors[roleName]}
                              >
                                {roleLabel[roleName]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked
                                  onCheckedChange={() => toggleActive(s.id)}
                                />
                                <span className="text-xs font-medium text-teal">
                                  Active
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEdit(s)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {activeStaff.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground py-8"
                          >
                            No active staff accounts.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="inactive" className="m-0">
                  <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleActivateAll}
                      disabled={
                        inactiveStaff.length === 0 || toggleStatus.isPending
                      }
                    >
                      Activate All
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right pr-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveStaff.map((s) => {
                        const roleName = (s.role?.name ||
                          "WAITER") as StaffRoleName;
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="pl-6 font-medium text-sm">
                              {s.username}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={roleColors[roleName]}
                              >
                                {roleLabel[roleName]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={false}
                                  onCheckedChange={() => toggleActive(s.id)}
                                />
                                <span className="text-xs font-medium text-muted-foreground">
                                  Inactive
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEdit(s)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {inactiveStaff.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground py-8"
                          >
                            No inactive staff accounts.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Staff Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit Staff Account" : "Add New Staff Account"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Update staff account information"
                : "Enter new staff account details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="staff-username">Username *</Label>
              <Input
                id="staff-username"
                placeholder="e.g. waiter01"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
              />
            </div>
            {!editingStaff && (
              <div className="space-y-2">
                <Label htmlFor="staff-password">Password *</Label>
                <Input
                  id="staff-password"
                  type="password"
                  placeholder="Enter a temporary password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formRole}
                onValueChange={(v) => setFormRole(v as StaffRoleName)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAITER">Waiter</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formUsername.trim() ||
                (!editingStaff && !formPassword.trim()) ||
                createStaff.isPending ||
                updateStaff.isPending
              }
            >
              {createStaff.isPending || updateStaff.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingStaff ? "Saving..." : "Creating..."}
                </>
              ) : editingStaff ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default StaffManagement;
