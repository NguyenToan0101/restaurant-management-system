import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CheckCircle, XCircle, Users, AlertTriangle, Armchair, Loader2, QrCode,
} from "lucide-react";
import { useAreasByBranch } from "@/hooks/queries/useAreaQueries";
import { useTablesByArea } from "@/hooks/queries/useTableQueries";
import { useAuthStore } from "@/stores/authStore";
import type { AreaTableDTO } from "@/types/dto";
import { TableStatus, EntityStatus } from "@/types/dto";

const WaiterTableView = () => {
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const branchId = staffInfo?.branchId;

    const { data: allAreas = [] } = useAreasByBranch(branchId || '');
    const activeAreas = allAreas.filter(a => a.status === EntityStatus.ACTIVE);

    const [selectedAreaId, setSelectedAreaId] = useState<string>(
        activeAreas.length > 0 ? activeAreas[0].areaId! : ''
    );
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [viewingQr, setViewingQr] = useState<AreaTableDTO | null>(null);

    const { data: tables = [], isLoading } = useTablesByArea(selectedAreaId);

    const availableTables = tables.filter(t => t.status === TableStatus.FREE);
    const occupiedTables = tables.filter(t => t.status === TableStatus.OCCUPIED);
    const outOfOrderTables = tables.filter(t => t.status === TableStatus.INACTIVE);

    const openQrCode = (table: AreaTableDTO) => {
        setViewingQr(table);
        setQrDialogOpen(true);
    };

    if (!branchId) {
        return (
            <div className="p-6 lg:p-8">
                <Card className="glass-card border-border/60">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No branch assigned to your account
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display">Table Status</h1>
                    <p className="text-sm text-muted-foreground">View table availability and QR codes</p>
                </div>
                <div className="flex items-center gap-3">
                    {activeAreas.length > 0 && (
                        <Select
                            value={selectedAreaId}
                            onValueChange={setSelectedAreaId}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                                {activeAreas.map((area) => (
                                    <SelectItem key={area.areaId} value={area.areaId!}>
                                        {area.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Tables</p>
                                <p className="text-2xl font-bold">{tables.length}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Armchair className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Available</p>
                                <p className="text-2xl font-bold text-teal">{availableTables.length}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-teal" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Occupied</p>
                                <p className="text-2xl font-bold text-orange-500">{occupiedTables.length}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Out of Order</p>
                                <p className="text-2xl font-bold text-destructive">{outOfOrderTables.length}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-destructive" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tables Grid */}
            <Card className="glass-card border-border/60">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Tabs defaultValue="all" className="w-full">
                            <div className="px-6 pt-4 flex items-center justify-between border-b">
                                <TabsList>
                                    <TabsTrigger value="all" className="gap-2">
                                        All ({tables.length})
                                    </TabsTrigger>
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
                                </TabsList>
                            </div>

                            <TabsContent value="all" className="m-0">
                                <TableGrid tables={tables} onViewQr={openQrCode} />
                            </TabsContent>

                            <TabsContent value="available" className="m-0">
                                <TableGrid tables={availableTables} onViewQr={openQrCode} />
                            </TabsContent>

                            <TabsContent value="occupied" className="m-0">
                                <TableGrid tables={occupiedTables} onViewQr={openQrCode} />
                            </TabsContent>

                            <TabsContent value="out-of-order" className="m-0">
                                <TableGrid tables={outOfOrderTables} onViewQr={openQrCode} />
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

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
                            <div className="p-4 bg-white rounded-lg border">
                                <img
                                    src={viewingQr.qr}
                                    alt={`QR Code for ${viewingQr.tag}`}
                                    className="w-64 h-64"
                                />
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No QR code available
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

interface TableGridProps {
    tables: AreaTableDTO[];
    onViewQr: (table: AreaTableDTO) => void;
}

const TableGrid = ({ tables, onViewQr }: TableGridProps) => {
    if (tables.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                <Armchair className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-1">No tables found</p>
                <p className="text-sm">No tables available in this category</p>
            </div>
        );
    }

    return (
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tables.map((table) => (
                <TableCard key={table.areaTableId} table={table} onViewQr={onViewQr} />
            ))}
        </div>
    );
};

interface TableCardProps {
    table: AreaTableDTO;
    onViewQr: (table: AreaTableDTO) => void;
}

const TableCard = ({ table, onViewQr }: TableCardProps) => {
    const getStatusStyles = () => {
        switch (table.status) {
            case TableStatus.FREE:
                return {
                    card: 'bg-gradient-to-br from-teal/5 to-teal/10 border-teal/20',
                    icon: 'bg-teal/10 text-teal',
                    badge: 'bg-teal/20 text-teal',
                };
            case TableStatus.OCCUPIED:
                return {
                    card: 'bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20',
                    icon: 'bg-orange-500/10 text-orange-500',
                    badge: 'bg-orange-500/20 text-orange-500',
                };
            case TableStatus.INACTIVE:
                return {
                    card: 'bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20',
                    icon: 'bg-destructive/10 text-destructive',
                    badge: 'bg-destructive/20 text-destructive',
                };
            default:
                return {
                    card: 'bg-muted/50 border-border/60',
                    icon: 'bg-muted text-muted-foreground',
                    badge: 'bg-muted text-muted-foreground',
                };
        }
    };

    const getStatusIcon = () => {
        switch (table.status) {
            case TableStatus.FREE:
                return <CheckCircle className="w-4 h-4" />;
            case TableStatus.OCCUPIED:
                return <Users className="w-4 h-4" />;
            case TableStatus.INACTIVE:
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <XCircle className="w-4 h-4" />;
        }
    };

    const getStatusText = () => {
        switch (table.status) {
            case TableStatus.FREE:
                return 'Available';
            case TableStatus.OCCUPIED:
                return 'Occupied';
            case TableStatus.INACTIVE:
                return 'Out of Order';
            default:
                return 'Unknown';
        }
    };

    const styles = getStatusStyles();

    return (
        <Card className={`${styles.card} transition-all duration-300 border-2 hover:shadow-lg`}>
            <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3">
                    {/* Table Visual */}
                    <div className={`w-20 h-20 rounded-2xl ${styles.icon} flex items-center justify-center`}>
                        <Armchair className="w-10 h-10" />
                    </div>

                    {/* Table Info */}
                    <div className="text-center w-full">
                        <h3 className="font-bold text-xl mb-1">{table.tag}</h3>
                        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-2">
                            <Users className="w-4 h-4" />
                            <span>{table.capacity} seats</span>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles.badge} mb-2`}>
                            {getStatusIcon()}
                            <span>{getStatusText()}</span>
                        </div>

                        {/* QR Code Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => onViewQr(table)}
                        >
                            <QrCode className="w-3.5 h-3.5 mr-1.5" />
                            View QR
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WaiterTableView;