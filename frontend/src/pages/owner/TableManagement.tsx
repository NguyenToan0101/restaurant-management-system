import { useParams } from "react-router-dom";
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
    Plus, Pencil, Loader2, Table as TableIcon, CheckCircle, XCircle, Trash2,
    Users, AlertTriangle, QrCode,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    useTablesByArea,
    useCreateTable,
    useUpdateTable,
    useDeleteTable,
    useSetTableStatus,
    useMarkTableAvailable,
    useMarkTableOutOfOrder,
} from "@/hooks/queries/useTableQueries";
import { useArea } from "@/hooks/queries/useAreaQueries";
import type { AreaTableDTO } from "@/types/dto";
import { TableStatus } from "@/types/dto";

const TableManagement = () => {
    const { areaId } = useParams<{ areaId: string }>();
    const { data: area } = useArea(areaId || '');
    const { data: tables = [], isLoading } = useTablesByArea(areaId || '');
    const createTable = useCreateTable();
    const updateTable = useUpdateTable();
    const deleteTable = useDeleteTable();
    const setTableStatus = useSetTableStatus();
    const markAvailable = useMarkTableAvailable();
    const markOutOfOrder = useMarkTableOutOfOrder();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<AreaTableDTO | null>(null);
    const [deletingTable, setDeletingTable] = useState<AreaTableDTO | null>(null);
    const [viewingQr, setViewingQr] = useState<AreaTableDTO | null>(null);
    const [formData, setFormData] = useState({
        tag: '',
        capacity: 4,
    });

    const openCreate = () => {
        setEditingTable(null);
        setFormData({ tag: '', capacity: 4 });
        setDialogOpen(true);
    };

    const openEdit = (table: AreaTableDTO) => {
        setEditingTable(table);
        setFormData({
            tag: table.tag,
            capacity: table.capacity,
        });
        setDialogOpen(true);
    };

    const openDelete = (table: AreaTableDTO) => {
        setDeletingTable(table);
        setDeleteDialogOpen(true);
    };

    const openQr = (table: AreaTableDTO) => {
        setViewingQr(table);
        setQrDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.tag.trim() || formData.capacity <= 0 || !areaId) return;

        if (editingTable) {
            await updateTable.mutateAsync({
                id: editingTable.areaTableId!,
                data: {
                    tag: formData.tag,
                    capacity: formData.capacity,
                },
            });
        } else {
            await createTable.mutateAsync({
                areaId,
                tag: formData.tag,
                capacity: formData.capacity,
            });
        }
        setDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!deletingTable) return;
        await deleteTable.mutateAsync(deletingTable.areaTableId!);
        setDeleteDialogOpen(false);
        setDeletingTable(null);
    };

    const handleMarkAvailableAll = async () => {
        const nonAvailableTables = tables.filter(t => t.status !== TableStatus.AVAILABLE);
        for (const table of nonAvailableTables) {
            await markAvailable.mutateAsync(table.areaTableId!);
        }
    };

    const handleMarkOutOfOrderAll = async () => {
        const availableTables = tables.filter(t => t.status === TableStatus.AVAILABLE);
        for (const table of availableTables) {
            await markOutOfOrder.mutateAsync(table.areaTableId!);
        }
    };

    const availableTables = tables.filter(t => t.status === TableStatus.AVAILABLE);
    const occupiedTables = tables.filter(t => t.status === TableStatus.OCCUPIED);
    const outOfOrderTables = tables.filter(t => t.status === TableStatus.OUT_OF_ORDER);

    if (!areaId) {
        return (
            <div className="p-6 lg:p-8">
                <Card className="glass-card border-border/60">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Please select an area first
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                {/* Area Info */}
                {area && (
                    <Card className="glass-card border-border/60 mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <TableIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display">{area.name}</h2>
                                    <p className="text-sm text-muted-foreground">{tables.length} tables total</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="glass-card border-border/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TableIcon className="w-4 h-4 text-primary" />
                                Table Management
                            </CardTitle>
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Table
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Tabs defaultValue="available" className="w-full">
                                <div className="px-6 pt-2 flex items-center justify-between border-b">
                                    <TabsList>
                                        <TabsTrigger value="available" className="gap-2">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Available ({availableTables.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="occupied" className="gap-2">
                                            <Users className="w-3.5 h-3.5" />
                                            Occupied ({occupiedTables.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="out-of-order" className="gap-2">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Out of Order ({outOfOrderTables.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="all" className="gap-2">
                                            All ({tables.length})
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="available" className="m-0">
                                    <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleMarkOutOfOrderAll}
                                            disabled={availableTables.length === 0 || markOutOfOrder.isPending}
                                        >
                                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                                            Mark All Out of Order
                                        </Button>
                                    </div>
                                    <TableList
                                        tables={availableTables}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onViewQr={openQr}
                                        onSetStatus={(table, status) => setTableStatus.mutateAsync({ id: table.areaTableId!, status })}
                                    />
                                </TabsContent>

                                <TabsContent value="occupied" className="m-0">
                                    <TableList
                                        tables={occupiedTables}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onViewQr={openQr}
                                        onSetStatus={(table, status) => setTableStatus.mutateAsync({ id: table.areaTableId!, status })}
                                    />
                                </TabsContent>

                                <TabsContent value="out-of-order" className="m-0">
                                    <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleMarkAvailableAll}
                                            disabled={outOfOrderTables.length === 0 || markAvailable.isPending}
                                        >
                                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                            Mark All Available
                                        </Button>
                                    </div>
                                    <TableList
                                        tables={outOfOrderTables}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onViewQr={openQr}
                                        onSetStatus={(table, status) => setTableStatus.mutateAsync({ id: table.areaTableId!, status })}
                                    />
                                </TabsContent>

                                <TabsContent value="all" className="m-0">
                                    <TableList
                                        tables={tables}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onViewQr={openQr}
                                        onSetStatus={(table, status) => setTableStatus.mutateAsync({ id: table.areaTableId!, status })}
                                    />
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Table Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTable ? "Edit Table" : "Add New Table"}</DialogTitle>
                        <DialogDescription>
                            {editingTable ? "Update table information" : "Enter new table details"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="table-tag">Table Tag *</Label>
                            <Input
                                id="table-tag"
                                placeholder="e.g. T01, A02, VIP-1"
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Must be unique within this area</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="table-capacity">Capacity *</Label>
                            <Input
                                id="table-capacity"
                                type="number"
                                min="1"
                                placeholder="e.g. 4"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Number of people this table can accommodate</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={
                                !formData.tag.trim() ||
                                formData.capacity <= 0 ||
                                createTable.isPending ||
                                updateTable.isPending
                            }
                        >
                            {(createTable.isPending || updateTable.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {editingTable ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                editingTable ? "Update" : "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Table Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete table "{deletingTable?.tag}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteTable.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Table'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* QR Code Dialog */}
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>QR Code - {viewingQr?.tag}</DialogTitle>
                        <DialogDescription>
                            Scan this QR code to access the menu for this table
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        {viewingQr?.qr ? (
                            <>
                                <div className="p-4 bg-white rounded-lg">
                                    <img
                                        src={viewingQr.qr}
                                        alt={`QR Code for ${viewingQr.tag}`}
                                        className="w-64 h-64"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">{viewingQr.tag}</p>
                                    <p className="text-xs text-muted-foreground">Capacity: {viewingQr.capacity} people</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No QR code available
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout >
    );
};

interface TableListProps {
    tables: AreaTableDTO[];
    onEdit: (table: AreaTableDTO) => void;
    onDelete: (table: AreaTableDTO) => void;
    onViewQr: (table: AreaTableDTO) => void;
    onSetStatus: (table: AreaTableDTO, status: TableStatus) => void;
}

const TableList = ({ tables, onEdit, onDelete, onViewQr, onSetStatus }: TableListProps) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="pl-6">Table Tag</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tables.map((table) => (
                    <TableRow key={table.areaTableId}>
                        <TableCell className="pl-6 font-medium text-sm">{table.tag}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {table.capacity}
                            </div>
                        </TableCell>
                        <TableCell>
                            <select
                                value={table.status}
                                onChange={(e) => onSetStatus(table, e.target.value as TableStatus)}
                                className="text-xs px-2 py-1 rounded border bg-background"
                            >
                                <option value={TableStatus.AVAILABLE}>Available</option>
                                <option value={TableStatus.OCCUPIED}>Occupied</option>
                                <option value={TableStatus.OUT_OF_ORDER}>Out of Order</option>
                            </select>
                        </TableCell>
                        <TableCell>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5"
                                onClick={() => onViewQr(table)}
                            >
                                <QrCode className="w-3.5 h-3.5" />
                                View
                            </Button>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(table)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(table)}>
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                {tables.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No tables found. Click "Add Table" to create one.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default TableManagement;
