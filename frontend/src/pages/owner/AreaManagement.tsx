import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus, Pencil, Loader2, MapPin, CheckCircle, XCircle, Trash2, Table as TableIcon,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    useAreasByBranch,
    useCreateArea,
    useUpdateArea,
    useDeleteArea,
    useActivateArea,
    useDeactivateArea,
} from "@/hooks/queries/useAreaQueries";
import { useTablesByArea } from "@/hooks/queries/useTableQueries";
import type { AreaDTO } from "@/types/dto";
import { EntityStatus } from "@/types/dto";

const AreaManagement = () => {
    const { id: restaurantId, branchId } = useParams<{ id: string; branchId: string }>();
    const navigate = useNavigate();
    const { data: areas = [], isLoading } = useAreasByBranch(branchId || '');
    const createArea = useCreateArea();
    const updateArea = useUpdateArea();
    const deleteArea = useDeleteArea();
    const activateArea = useActivateArea();
    const deactivateArea = useDeactivateArea();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaDTO | null>(null);
    const [deletingArea, setDeletingArea] = useState<AreaDTO | null>(null);
    const [formData, setFormData] = useState({
        name: '',
    });

    const openCreate = () => {
        setEditingArea(null);
        setFormData({ name: '' });
        setDialogOpen(true);
    };

    const openEdit = (area: AreaDTO) => {
        setEditingArea(area);
        setFormData({ name: area.name });
        setDialogOpen(true);
    };

    const openDelete = (area: AreaDTO) => {
        setDeletingArea(area);
        setDeleteDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !branchId) return;

        if (editingArea) {
            await updateArea.mutateAsync({
                id: editingArea.areaId!,
                data: { name: formData.name },
            });
        } else {
            await createArea.mutateAsync({
                branchId,
                name: formData.name,
            });
        }
        setDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!deletingArea) return;
        await deleteArea.mutateAsync(deletingArea.areaId!);
        setDeleteDialogOpen(false);
        setDeletingArea(null);
    };

    const handleActivateAll = async () => {
        const inactiveAreas = areas.filter(a => a.status === EntityStatus.INACTIVE);
        for (const area of inactiveAreas) {
            await activateArea.mutateAsync(area.areaId!);
        }
    };

    const handleDeactivateAll = async () => {
        const activeAreas = areas.filter(a => a.status === EntityStatus.ACTIVE);
        for (const area of activeAreas) {
            await deactivateArea.mutateAsync(area.areaId!);
        }
    };

    const activeAreas = areas.filter(a => a.status === EntityStatus.ACTIVE);
    const inactiveAreas = areas.filter(a => a.status === EntityStatus.INACTIVE);

    if (!branchId) {
        return (
            <div className="p-6 lg:p-8">
                <Card className="glass-card border-border/60">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Please select a branch first
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                <Card className="glass-card border-border/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="w-4 h-4 text-primary" />
                                Area Management
                            </CardTitle>
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Area
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Tabs defaultValue="active" className="w-full">
                                <div className="px-6 pt-2 flex items-center justify-between border-b">
                                    <TabsList>
                                        <TabsTrigger value="active" className="gap-2">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Active ({activeAreas.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="inactive" className="gap-2">
                                            <XCircle className="w-3.5 h-3.5" />
                                            Inactive ({inactiveAreas.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="all" className="gap-2">
                                            All ({areas.length})
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="active" className="m-0">
                                    <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleDeactivateAll}
                                            disabled={activeAreas.length === 0 || deactivateArea.isPending}
                                        >
                                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                            Deactivate All
                                        </Button>
                                    </div>
                                    <AreaTable
                                        areas={activeAreas}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onToggleStatus={(area) =>
                                            area.status === EntityStatus.ACTIVE
                                                ? deactivateArea.mutateAsync(area.areaId!)
                                                : activateArea.mutateAsync(area.areaId!)
                                        }
                                        onViewTables={(areaId) => navigate(`/dashboard/${restaurantId}/areas/${areaId}/tables`)}
                                    />
                                </TabsContent>

                                <TabsContent value="inactive" className="m-0">
                                    <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleActivateAll}
                                            disabled={inactiveAreas.length === 0 || activateArea.isPending}
                                        >
                                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                            Activate All
                                        </Button>
                                    </div>
                                    <AreaTable
                                        areas={inactiveAreas}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onToggleStatus={(area) =>
                                            area.status === EntityStatus.ACTIVE
                                                ? deactivateArea.mutateAsync(area.areaId!)
                                                : activateArea.mutateAsync(area.areaId!)
                                        }
                                        onViewTables={(areaId) => navigate(`/dashboard/${restaurantId}/areas/${areaId}/tables`)}
                                    />
                                </TabsContent>

                                <TabsContent value="all" className="m-0">
                                    <AreaTable
                                        areas={areas}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onToggleStatus={(area) =>
                                            area.status === EntityStatus.ACTIVE
                                                ? deactivateArea.mutateAsync(area.areaId!)
                                                : activateArea.mutateAsync(area.areaId!)
                                        }
                                        onViewTables={(areaId) => navigate(`/dashboard/${restaurantId}/areas/${areaId}/tables`)}
                                    />
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Area Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingArea ? "Edit Area" : "Add New Area"}</DialogTitle>
                        <DialogDescription>
                            {editingArea ? "Update area information" : "Enter new area details"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="area-name">Area Name *</Label>
                            <Input
                                id="area-name"
                                placeholder="e.g. Floor 1, Outdoor, VIP"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={
                                !formData.name.trim() ||
                                createArea.isPending ||
                                updateArea.isPending
                            }
                        >
                            {(createArea.isPending || updateArea.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {editingArea ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                editingArea ? "Update" : "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Area Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the area "{deletingArea?.name}" and all its tables.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteArea.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Area'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout >
    );
};

interface AreaTableProps {
    areas: AreaDTO[];
    onEdit: (area: AreaDTO) => void;
    onDelete: (area: AreaDTO) => void;
    onToggleStatus: (area: AreaDTO) => void;
    onViewTables: (areaId: string) => void;
}

const AreaTable = ({ areas, onEdit, onDelete, onToggleStatus, onViewTables }: AreaTableProps) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="pl-6">Area Name</TableHead>
                    <TableHead>Tables</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {areas.map((area) => (
                    <AreaRow
                        key={area.areaId}
                        area={area}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                        onViewTables={onViewTables}
                    />
                ))}
                {areas.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No areas found. Click "Add Area" to create one.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

interface AreaRowProps {
    area: AreaDTO;
    onEdit: (area: AreaDTO) => void;
    onDelete: (area: AreaDTO) => void;
    onToggleStatus: (area: AreaDTO) => void;
    onViewTables: (areaId: string) => void;
}

const AreaRow = ({ area, onEdit, onDelete, onToggleStatus, onViewTables }: AreaRowProps) => {
    const { data: tables = [] } = useTablesByArea(area.areaId || '');

    return (
        <TableRow>
            <TableCell className="pl-6 font-medium text-sm">{area.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5"
                    onClick={() => onViewTables(area.areaId!)}
                >
                    <TableIcon className="w-3.5 h-3.5" />
                    {tables.length} tables
                </Button>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={() => onToggleStatus(area)}
                    >
                        {area.status === EntityStatus.ACTIVE ? (
                            <CheckCircle className="w-3.5 h-3.5 text-teal mr-1.5" />
                        ) : (
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
                        )}
                        <span className="text-xs font-medium">
                            {area.status === EntityStatus.ACTIVE ? 'Active' : 'Inactive'}
                        </span>
                    </Button>
                </div>
            </TableCell>
            <TableCell className="text-right pr-6">
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(area)}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(area)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default AreaManagement;
