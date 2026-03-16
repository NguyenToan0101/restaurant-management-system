import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    Search, Loader2, Receipt, Clock, DollarSign,
    CheckCircle, XCircle, Armchair, CreditCard, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useOrdersByBranch, useBillByOrder } from "@/hooks/queries/useWaiterQueries";
import { useTablesByBranch } from "@/hooks/queries/useTableQueries";
import type { OrderDTO } from "@/types/dto";
import { OrderStatus, EntityStatus } from "@/types/dto";
import { useAreasByBranch } from "@/hooks/queries/useAreaQueries";

const WaiterHistory = () => {
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const branchId = staffInfo?.branchId || '';

    const { data: orders = [], isLoading } = useOrdersByBranch(branchId);
    const { data: allTables = [] } = useTablesByBranch(branchId);
    const { data: allAreas = [] } = useAreasByBranch(branchId);
    const activeAreas = allAreas.filter(a => a.status === EntityStatus.ACTIVE);

    const [searchQ, setSearchQ] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTable, setFilterTable] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

    const completedOrders = useMemo(() => {
        let filtered = orders.filter(o => o.status !== OrderStatus.EATING);

        if (filterStatus !== "all") {
            filtered = filtered.filter(o => o.status === filterStatus);
        }
        if (filterTable !== "all") {
            filtered = filtered.filter(o => o.areaTableId === filterTable);
        }
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase();
            filtered = filtered.filter(o =>
                o.tableName.toLowerCase().includes(q) ||
                o.orderId.toLowerCase().includes(q)
            );
        }

        return filtered.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }, [orders, filterStatus, filterTable, searchQ]);

    const stats = useMemo(() => {
        const completed = orders.filter(o => o.status === OrderStatus.COMPLETED);
        const cancelled = orders.filter(o => o.status === OrderStatus.CANCELLED);
        const totalRevenue = completed.reduce((sum, o) => sum + o.totalPrice, 0);
        return { completed: completed.length, cancelled: cancelled.length, totalRevenue };
    }, [orders]);

    const tableStats = useMemo(() => {
        const map = new Map<string, { tableName: string; count: number; revenue: number }>();
        orders.filter(o => o.status === OrderStatus.COMPLETED).forEach(o => {
            const existing = map.get(o.areaTableId);
            if (existing) {
                existing.count++;
                existing.revenue += o.totalPrice;
            } else {
                map.set(o.areaTableId, { tableName: o.tableName, count: 1, revenue: o.totalPrice });
            }
        });
        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, [orders]);

    const tableOptions = useMemo(() => {
        return activeAreas.flatMap(area =>
            allTables
                .filter(t => t.areaId === area.areaId)
                .map(t => ({ ...t, fullName: `${area.name} - ${t.tag}` }))
        );
    }, [activeAreas, allTables]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
            <div>
                <h1 className="text-2xl font-display">Order History</h1>
                <p className="text-sm text-muted-foreground">View past orders and statistics</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Completed Orders</p>
                                <p className="text-2xl font-bold text-teal">{stats.completed}</p>
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
                                <p className="text-xs text-muted-foreground">Cancelled</p>
                                <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-destructive" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.totalRevenue)}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Stats */}
            {tableStats.length > 0 && (
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-3">Orders by Table</h3>
                        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                            {tableStats.slice(0, 10).map((ts) => (
                                <div
                                    key={ts.tableName}
                                    className="shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-muted/50 min-w-[80px] cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => {
                                        const t = allTables.find(t => t.tag === ts.tableName);
                                        if (t?.areaTableId) setFilterTable(t.areaTableId);
                                    }}
                                >
                                    <Armchair className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-xs font-semibold">{ts.tableName}</span>
                                    <span className="text-[11px] text-muted-foreground">{ts.count} orders</span>
                                    <span className="text-[11px] font-medium text-teal">{new Intl.NumberFormat("vi-VN").format(ts.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by table or order ID..."
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterTable} onValueChange={setFilterTable}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Tables" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tables</SelectItem>
                        {tableOptions.map(t => (
                            <SelectItem key={t.areaTableId} value={t.areaTableId!}>
                                {t.fullName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                {(filterTable !== "all" || filterStatus !== "all" || searchQ) && (
                    <Button variant="ghost" size="sm" onClick={() => { setFilterTable("all"); setFilterStatus("all"); setSearchQ(""); }}>
                        Clear filters
                    </Button>
                )}
            </div>

            {/* Order List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : completedOrders.length === 0 ? (
                <Card className="glass-card border-border/60">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Receipt className="w-12 h-12 text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground font-medium">No orders found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {completedOrders.map((order) => (
                        <OrderRow
                            key={order.orderId}
                            order={order}
                            onClick={() => setSelectedOrder(order)}
                            formatDate={formatDate}
                            formatTime={formatTime}
                        />
                    ))}
                </div>
            )}

            {/* Order Detail Dialog */}
            {selectedOrder && (
                <OrderDetailDialog
                    order={selectedOrder}
                    open={!!selectedOrder}
                    onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}
                    formatDate={formatDate}
                    formatTime={formatTime}
                />
            )}
        </div>
    );
};

const OrderRow = ({ order, onClick, formatDate, formatTime }: {
    order: OrderDTO;
    onClick: () => void;
    formatDate: (s: string) => string;
    formatTime: (s: string) => string;
}) => {
    const isCompleted = order.status === OrderStatus.COMPLETED;
    const itemCount = order.orderLines?.reduce(
        (sum, line) => sum + line.orderItems.length, 0
    ) || 0;

    return (
        <Card
            className="glass-card border-border/60 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-teal/10' : 'bg-destructive/10'}`}>
                        {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-teal" />
                        ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{order.tableName}</span>
                            <Badge variant="secondary" className={`text-[10px] ${isCompleted ? 'bg-teal/10 text-teal' : 'bg-destructive/10 text-destructive'}`}>
                                {order.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(order.updatedAt)} · {formatTime(order.updatedAt)}
                            </span>
                            <span>{itemCount} items</span>
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalPrice)}</p>
                        <p className="text-[10px] text-muted-foreground">#{order.orderId.slice(0, 8)}</p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
            </CardContent>
        </Card>
    );
};

const OrderDetailDialog = ({ order, open, onOpenChange, formatDate, formatTime }: {
    order: OrderDTO;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formatDate: (s: string) => string;
    formatTime: (s: string) => string;
}) => {
    const { data: bill } = useBillByOrder(
        order.status === OrderStatus.COMPLETED ? order.orderId : ''
    );

    const allItems = order.orderLines?.flatMap(line => line.orderItems) || [];
    const isCompleted = order.status === OrderStatus.COMPLETED;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Order #{order.orderId.slice(0, 8)}
                        <Badge variant="secondary" className={`text-xs ${isCompleted ? 'bg-teal/10 text-teal' : 'bg-destructive/10 text-destructive'}`}>
                            {order.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        {order.tableName} · {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
                    </DialogDescription>
                </DialogHeader>

                {/* Bill Info */}
                {bill && (
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span className="font-medium flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {bill.paymentMethod}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Paid At</span>
                            <span className="font-medium">{formatDate(bill.paidTime)} · {formatTime(bill.paidTime)}</span>
                        </div>
                        {bill.note && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Note</span>
                                <span className="font-medium text-right max-w-[200px] truncate">{bill.note}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Items */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Items ({allItems.length})</h4>
                    <div className="space-y-2">
                        {allItems.map((item) => {
                            const hasItemDiscount = item.discountedPrice && item.discountedPrice < item.menuItemPrice;
                            return (
                                <div key={item.orderItemId} className="flex gap-3 p-2 rounded-lg bg-muted/30">
                                    {item.menuItemImageUrl && (
                                        <img
                                            src={item.menuItemImageUrl}
                                            alt={item.menuItemName}
                                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h5 className="font-medium text-sm truncate">{item.menuItemName}</h5>
                                            <span className="font-semibold text-sm shrink-0">
                                                {new Intl.NumberFormat("vi-VN").format(item.totalPrice)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <span>Qty: {item.quantity}</span>
                                            <span>@ 
                                                {hasItemDiscount && (
                                                    <span className="line-through mx-1 text-[10px]">
                                                        {new Intl.NumberFormat("vi-VN").format(item.menuItemPrice)}
                                                    </span>
                                                )}
                                                <span className={hasItemDiscount ? "text-primary font-bold" : ""}>
                                                    {new Intl.NumberFormat("vi-VN").format(item.discountedPrice || item.menuItemPrice)}
                                                </span>
                                            </span>
                                        </div>
                                        {item.customizations?.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {item.customizations.map(c => c.customizationName).join(', ')}
                                            </p>
                                        )}
                                        {item.note && (
                                            <p className="text-xs text-muted-foreground italic mt-0.5">"{item.note}"</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Total */}
                <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Gross Total</span>
                        <span>{
                            new Intl.NumberFormat("vi-VN").format(allItems.reduce((sum, i) => {
                                const custTotal = i.customizations?.reduce((s, c) => s + c.totalPrice, 0) || 0;
                                return sum + (i.menuItemPrice * i.quantity) + custTotal;
                            }, 0))
                        }</span>
                    </div>

                    {/* Item Discounts */}
                    {allItems.some(i => i.discountedPrice && i.discountedPrice < i.menuItemPrice) && (
                        <div className="flex justify-between text-xs text-teal-600">
                            <span>Item Discounts</span>
                            <span>-{
                                new Intl.NumberFormat("vi-VN").format(allItems.reduce((sum, i) => {
                                    if (i.discountedPrice && i.discountedPrice < i.menuItemPrice) {
                                        return sum + (i.menuItemPrice - i.discountedPrice) * i.quantity;
                                    }
                                    return sum;
                                }, 0))
                            }</span>
                        </div>
                    )}

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{new Intl.NumberFormat("vi-VN").format((bill?.finalPrice || order.totalPrice) + (bill?.discountAmount || 0))}</span>
                    </div>

                    {bill && bill.discountAmount > 0 && (
                        <div className="flex justify-between text-xs text-blue-600">
                            <div className="flex flex-col">
                                <span>Order Discount</span>
                                <span className="text-[10px] opacity-70">({bill.promotionName || bill.promotionCode})</span>
                            </div>
                            <span>-{new Intl.NumberFormat("vi-VN").format(bill.discountAmount)}</span>
                        </div>
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2" />
                    <div className="flex justify-between text-base font-bold">
                        <span>{bill ? 'Total Paid' : 'Total'}</span>
                        <span className={bill ? "text-teal" : "text-primary"}>
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(bill ? bill.finalPrice : order.totalPrice)}
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WaiterHistory;
