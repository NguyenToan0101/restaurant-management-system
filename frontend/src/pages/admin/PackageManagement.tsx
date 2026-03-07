import { useState, useMemo } from "react";
import { Plus, Eye, Pencil, ToggleLeft, ToggleRight, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePackages, useFeatures, useCreatePackage, useUpdatePackage, useActivatePackage, useDeactivatePackage } from "@/hooks/queries/usePackageQueries";
import type { PackageFeatureDTO, FeatureValueDTO, FeatureCode } from "@/types/dto/package.dto";

const featureCodeOptions: { value: FeatureCode; label: string }[] = [
  { value: "LIMIT_MENU_ITEMS", label: "Menu Items Limit" },
  { value: "LIMIT_BRANCH_CREATION", label: "Branch Creation Limit" },
  { value: "LIMIT_CUSTOMIZATION_PER_CATEGORY", label: "Customization Per Category Limit" },
  { value: "UNLIMITED_BRANCH_CREATION", label: "Unlimited Branch Creation" },
];

interface FormData {
  name: string;
  description: string;
  price: number;
  billingPeriod: number;
  available: boolean;
  features: FeatureValueDTO[];
}

const emptyForm: FormData = {
  name: "",
  description: "",
  price: 0,
  billingPeriod: 1,
  available: true,
  features: [],
};

const PackageManagement = () => {
  const { data: packages = [], isLoading } = usePackages();
  const { data: allFeatures = [] } = useFeatures();
  const createPackageMutation = useCreatePackage();
  const updatePackageMutation = useUpdatePackage();
  const activateMutation = useActivatePackage();
  const deactivateMutation = useDeactivatePackage();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<PackageFeatureDTO | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  // Feature add state
  const [limitCode, setLimitCode] = useState<FeatureCode>("LIMIT_MENU_ITEMS");
  const [limitValue, setLimitValue] = useState<number>(10);
  const [descName, setDescName] = useState("");
  const [descDesc, setDescDesc] = useState("");

  // Get limit features from backend
  const limitFeatures = useMemo(() => allFeatures.filter(f => f.code != null), [allFeatures]);

  const openCreate = () => {
    setEditPkg(null);
    setForm({ ...emptyForm, features: [] });
    setFormOpen(true);
  };

  const openEdit = (pkg: PackageFeatureDTO) => {
    setEditPkg(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price,
      billingPeriod: pkg.billingPeriod,
      available: pkg.available,
      features: [...pkg.features],
    });
    setFormOpen(true);
  };

  const addLimitFeature = () => {
    const selectedFeature = limitFeatures.find(f => f.code === limitCode);
    if (!selectedFeature) return;

    const newFeature: FeatureValueDTO = {
      featureId: selectedFeature.id,
      featureName: selectedFeature.name,
      description: selectedFeature.description,
      featureCode: limitCode,
      value: limitValue,
    };

    setForm(prev => ({ ...prev, features: [...prev.features, newFeature] }));
  };

  const addDescFeature = () => {
    if (!descName.trim()) return;

    const newFeature: FeatureValueDTO = {
      featureName: descName.trim(),
      description: descDesc.trim(),
      value: null,
    };

    setForm(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    setDescName("");
    setDescDesc("");
  };

  const removeFeature = (index: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      billingPeriod: form.billingPeriod,
      available: form.available,
      features: form.features,
    };

    try {
      if (editPkg) {
        await updatePackageMutation.mutateAsync({
          packageId: editPkg.packageId!,
          data: payload,
        });
      } else {
        await createPackageMutation.mutateAsync(payload);
      }
      setFormOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const toggleStatus = async (pkg: PackageFeatureDTO) => {
    if (!pkg.packageId) return;

    try {
      if (pkg.available) {
        await deactivateMutation.mutateAsync(pkg.packageId);
      } else {
        await activateMutation.mutateAsync(pkg.packageId);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Package Management</h1>
          <p className="text-muted-foreground text-sm">Manage subscription packages and features</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create Package</Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map(pkg => (
                <>
                  <TableRow key={pkg.packageId}>
                    <TableCell>
                      <button onClick={() => setExpandedId(expandedId === pkg.packageId ? null : pkg.packageId)} className="text-muted-foreground hover:text-foreground">
                        {expandedId === pkg.packageId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{pkg.name}</TableCell>
                    <TableCell className="text-foreground">{pkg.price.toLocaleString('vi-VN')} VND/tháng</TableCell>
                    <TableCell className="text-muted-foreground">{pkg.billingPeriod} tháng</TableCell>
                    <TableCell>
                      <Badge variant={pkg.available ? "default" : "secondary"}>{pkg.available ? "Available" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{pkg.features.length}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === pkg.packageId ? null : pkg.packageId)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}><Pencil className="w-4 h-4" /></Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleStatus(pkg)}
                        disabled={activateMutation.isPending || deactivateMutation.isPending}
                      >
                        {pkg.available ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === pkg.packageId && (
                    <TableRow key={`${pkg.packageId}-detail`}>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {pkg.features.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-background border border-border">
                              <Badge variant="outline" className="shrink-0 text-[10px]">
                                {f.featureCode ? "Limit" : "Feature"}
                              </Badge>
                              <div>
                                <p className="text-sm font-medium text-foreground">{f.featureName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {f.description}
                                  {f.value != null && ` — Value: ${f.value}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPkg ? "Edit Package" : "Create Package"}</DialogTitle>
            <DialogDescription>Fill in package details and add features.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Price (VND/tháng)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Billing Period (tháng)</Label>
              <Input type="number" value={form.billingPeriod} onChange={e => setForm(p => ({ ...p, billingPeriod: +e.target.value }))} min={1} />
            </div>

            {/* Add Limit Feature */}
            <Card className="border-border">
              <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Add Limit Feature</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4 flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Feature Code</Label>
                  <Select value={limitCode} onValueChange={(v) => setLimitCode(v as FeatureCode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {featureCodeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input type="number" value={limitValue} onChange={e => setLimitValue(+e.target.value)} />
                </div>
                <Button size="sm" variant="outline" onClick={addLimitFeature}>Add</Button>
              </CardContent>
            </Card>

            {/* Add Descriptive Feature */}
            <Card className="border-border">
              <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Add Descriptive Feature</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4 flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={descName} onChange={e => setDescName(e.target.value)} />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input value={descDesc} onChange={e => setDescDesc(e.target.value)} />
                </div>
                <Button size="sm" variant="outline" onClick={addDescFeature}>Add</Button>
              </CardContent>
            </Card>

            {/* Current Features */}
            {form.features.length > 0 && (
              <div className="space-y-2">
                <Label>Features ({form.features.length})</Label>
                {form.features.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {f.featureCode ? "Limit" : "Feature"}
                      </Badge>
                      <span className="text-sm text-foreground">{f.featureName}</span>
                      {f.value != null && <span className="text-xs text-muted-foreground">= {f.value}</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFeature(idx)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
            >
              {(createPackageMutation.isPending || updatePackageMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editPkg ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagement;
