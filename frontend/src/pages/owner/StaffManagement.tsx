import { useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { mockRestaurants, mockStaff, StaffMember } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  MapPin, Users, ArrowLeft, Plus, Pencil, Trash2, UserCircle,
} from "lucide-react";

const roleColors: Record<StaffMember["role"], string> = {
  manager: "bg-primary/15 text-primary border-primary/30",
  waiter: "bg-teal/15 text-teal border-teal/30",
  receptionist: "bg-amber/15 text-amber border-amber/30",
};

const StaffManagement = () => {
  const { id } = useParams<{ id: string }>();
  const restaurant = mockRestaurants.find((r) => r.id === id);

  const [staff, setStaff] = useState<StaffMember[]>(
    () => mockStaff.filter((s) => restaurant?.branches.some((b) => b.id === s.branchId))
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<StaffMember["role"]>("waiter");

  if (!restaurant) return <Navigate to="/dashboard" replace />;

  const branches = restaurant.branches;
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const branchStaff = staff.filter((s) => s.branchId === selectedBranchId && s.isActive);

  const getStaffCount = (branchId: string) =>
    staff.filter((s) => s.branchId === branchId && s.isActive).length;

  const openCreate = () => {
    setEditingStaff(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("waiter");
    setDialogOpen(true);
  };

  const openEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setFormName(s.name);
    setFormEmail(s.email);
    setFormPhone(s.phone);
    setFormRole(s.role);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formEmail.trim() || !selectedBranchId) return;
    if (editingStaff) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? { ...s, name: formName, email: formEmail, phone: formPhone, role: formRole }
            : s
        )
      );
    } else {
      setStaff((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          branchId: selectedBranchId,
          isActive: true,
        },
      ]);
    }
    setDialogOpen(false);
  };

  const confirmDelete = (s: StaffMember) => {
    setDeletingStaff(s);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deletingStaff) return;
    setStaff((prev) => prev.filter((s) => s.id !== deletingStaff.id));
    setDeleteDialogOpen(false);
    setDeletingStaff(null);
  };

  const toggleActive = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  // Branch list view
  if (!selectedBranchId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-display mb-1">Staff Management</h2>
          <p className="text-sm text-muted-foreground">Select a branch to manage its staff</p>
        </div>

        <div className="grid gap-3">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className="glass-card border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setSelectedBranchId(branch.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">{branch.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Users className="w-3 h-3" />
                      {getStaffCount(branch.id)} staff
                    </Badge>
                    {!branch.isActive && (
                      <Badge variant="secondary" className="text-muted-foreground">Inactive</Badge>
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
      </div>
    );
  }

  // Staff list view for selected branch
  const allBranchStaff = staff.filter((s) => s.branchId === selectedBranchId);

  return (
    <>
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedBranchId(null)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-display">{selectedBranch?.name}</h2>
            <p className="text-xs text-muted-foreground">{selectedBranch?.address}</p>
          </div>
        </div>

        <Card className="glass-card border-border/60">
          <div className="flex items-center justify-between p-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Staff ({allBranchStaff.length})</span>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Add Staff
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allBranchStaff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-6 font-medium text-sm">{s.name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{s.email}</p>
                      <p className="text-xs text-muted-foreground">{s.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColors[s.role]}>
                      {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch checked={s.isActive} onCheckedChange={() => toggleActive(s.id)} />
                      <span className={`text-xs font-medium ${s.isActive ? "text-teal" : "text-muted-foreground"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => confirmDelete(s)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {allBranchStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No staff yet. Click "Add Staff" to create the first member.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Create/Edit Staff Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
            <DialogDescription>
              {editingStaff ? "Update staff information" : "Enter new staff details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input id="staff-name" placeholder="e.g. Nguyen Van A" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email</Label>
              <Input id="staff-email" type="email" placeholder="e.g. a@restaurant.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input id="staff-phone" placeholder="e.g. 0901234567" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as StaffMember["role"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formName.trim() || !formEmail.trim()}>
              {editingStaff ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deletingStaff?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StaffManagement;
