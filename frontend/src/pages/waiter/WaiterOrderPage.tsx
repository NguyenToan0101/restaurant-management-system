import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
    Search, ShoppingCart, Plus, Minus, Trash2, Loader2,
    UtensilsCrossed, Star, X, ChevronRight, StickyNote,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAreasByBranch } from "@/hooks/queries/useAreaQueries";
import { useTablesByBranch } from "@/hooks/queries/useTableQueries";
import { useWaiterMenu, useWaiterCategories, useCreateOrder, useAddItemsToOrder, useActiveOrderByTable } from "@/hooks/queries/useWaiterQueries";
import { useCartStore } from "@/stores/cartStore";
import type { WaiterMenuItemDTO, WaiterCustomizationDTO, AreaTableDTO } from "@/types/dto";
import { TableStatus, EntityStatus } from "@/types/dto";

// Format currency to Vietnamese Dong (consistent with customer menu)
const formatVND = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const WaiterOrderPage = () => {
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const branchId = staffInfo?.branchId || '';

    const { data: menuItems = [], isLoading: menuLoading } = useWaiterMenu(branchId);
    const { data: categories = [] } = useWaiterCategories(branchId);
    const { data: allAreas = [] } = useAreasByBranch(branchId);
    const { data: allTables = [] } = useTablesByBranch(branchId);
    const activeAreas = allAreas.filter(a => a.status === EntityStatus.ACTIVE);

    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [customizeItem, setCustomizeItem] = useState<WaiterMenuItemDTO | null>(null);
    const [customizeQty, setCustomizeQty] = useState(1);
    const [customizeNote, setCustomizeNote] = useState("");
    const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, number>>({});
    const [cartOpen, setCartOpen] = useState(false);

    const cart = useCartStore();
    const createOrder = useCreateOrder();
    const addItemsToOrder = useAddItemsToOrder();

    const filteredItems = useMemo(() => {
        let items = menuItems;
        if (selectedCategory !== "all") {
            items = items.filter(item => item.categoryId === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
            );
        }
        return items;
    }, [menuItems, selectedCategory, searchQuery]);

    const handleOpenCustomize = (item: WaiterMenuItemDTO) => {
        setCustomizeItem(item);
        setCustomizeQty(1);
        setCustomizeNote("");
        setSelectedCustomizations({});
    };

    const handleAddToCart = () => {
        if (!customizeItem) return;

        const custs = Object.entries(selectedCustomizations)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const c = customizeItem.customizations.find(c => c.customizationId === id)!;
                return { customizationId: id, name: c.name, price: c.price, quantity: qty };
            });

        const custTotal = custs.reduce((sum, c) => sum + c.price * c.quantity, 0);
        const totalPrice = (customizeItem.price + custTotal) * customizeQty;

        cart.addItem({
            cartItemId: `${customizeItem.menuItemId}-${Date.now()}`,
            menuItemId: customizeItem.menuItemId,
            name: customizeItem.name,
            price: customizeItem.price,
            imageUrl: customizeItem.imageUrl,
            quantity: customizeQty,
            note: customizeNote,
            customizations: custs,
            totalPrice,
        });

        setCustomizeItem(null);
        setCartOpen(true);
    };

    const handlePlaceOrder = async () => {
        if (!cart.selectedTableId || cart.items.length === 0) return;

        const items = cart.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            note: item.note,
            customizations: item.customizations.map(c => ({
                customizationId: c.customizationId,
                quantity: c.quantity,
            })),
        }));

        try {
            await createOrder.mutateAsync({
                areaTableId: cart.selectedTableId,
                items,
            });
            cart.clearCart();
            setCartOpen(false);
        } catch {}
    };

    const tableOptions = useMemo(() => {
        return activeAreas.flatMap(area =>
            allTables
                .filter(t => t.areaId === area.areaId)
                .map(t => ({ ...t, areaName: area.name }))
        );
    }, [activeAreas, allTables]);

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
        <div className="flex h-[calc(100vh-0px)]">
            <div className="flex-1 overflow-auto p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display">Take Order</h1>
                        <p className="text-sm text-muted-foreground">Select items from the menu</p>
                    </div>
                    <Button
                        variant="outline"
                        className="relative"
                        onClick={() => setCartOpen(true)}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span className="ml-2">Current order</span>
                        {cart.getItemCount() > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {cart.getItemCount()}
                            </Badge>
                        )}
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        className="pl-10"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <Button
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        size="sm"
                        className="shrink-0"
                        onClick={() => setSelectedCategory("all")}
                    >
                        All
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.categoryId}
                            variant={selectedCategory === cat.categoryId ? "default" : "outline"}
                            size="sm"
                            className="shrink-0"
                            onClick={() => setSelectedCategory(cat.categoryId)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {menuLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-1">No items found</p>
                        <p className="text-sm text-muted-foreground">Try changing the filter or search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <MenuCard
                                key={item.menuItemId}
                                item={item}
                                onClick={() => handleOpenCustomize(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetContent className="w-[420px] sm:max-w-[420px] p-0 flex flex-col">
                    <SheetHeader className="p-6 pb-4 border-b">
                        <SheetTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Current Order ({cart.getItemCount()} items)
                        </SheetTitle>
                    </SheetHeader>

                    <div className="p-4 border-b">
                        <label className="text-xs font-medium text-muted-foreground">Select Table</label>
                        <Select
                            value={cart.selectedTableId || ''}
                            onValueChange={(val) => {
                                const t = tableOptions.find(t => t.areaTableId === val);
                                cart.setSelectedTable(val, t?.tag || null);
                            }}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Choose a table" />
                            </SelectTrigger>
                            <SelectContent>
                                {tableOptions.map(t => (
                                    <SelectItem key={t.areaTableId} value={t.areaTableId!}>
                                        <div className="flex items-center gap-2">
                                            <span>{t.areaName} - {t.tag}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {t.status === TableStatus.FREE ? 'Free' :
                                                 t.status === TableStatus.OCCUPIED ? 'Occupied' : 'N/A'}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {cart.items.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No items in current order</p>
                                <p className="text-xs">Click on menu items to add them</p>
                            </div>
                        ) : (
                            cart.items.map(item => (
                                <Card key={item.cartItemId} className="border-border/60">
                                    <CardContent className="p-3">
                                        <div className="flex gap-3">
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive shrink-0"
                                                        onClick={() => cart.removeItem(item.cartItemId)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                                {item.customizations.length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.customizations.map(c => `${c.name} x${c.quantity}`).join(', ')}
                                                    </p>
                                                )}
                                                {item.note && (
                                                    <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                                        <StickyNote className="w-3 h-3" />
                                                        {item.note}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => cart.updateQuantity(item.cartItemId, item.quantity - 1)}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => cart.updateQuantity(item.cartItemId, item.quantity + 1)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    <span className="font-semibold text-sm">
                                                        {formatVND(item.totalPrice)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {cart.items.length > 0 && (
                        <div className="p-4 border-t space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatVND(cart.getTotal())}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span>{formatVND(cart.getTotal())}</span>
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handlePlaceOrder}
                                disabled={!cart.selectedTableId || createOrder.isPending || addItemsToOrder.isPending}
                            >
                                {(createOrder.isPending || addItemsToOrder.isPending) ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 mr-2" />
                                )}
                                Place Order
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {customizeItem && (
                <CustomizeDialog
                    item={customizeItem}
                    quantity={customizeQty}
                    setQuantity={setCustomizeQty}
                    note={customizeNote}
                    setNote={setCustomizeNote}
                    selectedCustomizations={selectedCustomizations}
                    setSelectedCustomizations={setSelectedCustomizations}
                    onAdd={handleAddToCart}
                    onClose={() => setCustomizeItem(null)}
                />
            )}
        </div>
    );
};

interface MenuCardProps {
    item: WaiterMenuItemDTO;
    onClick: () => void;
}

const MenuCard = ({ item, onClick }: MenuCardProps) => (
    <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden ${
            item.isBestSeller
                ? 'border-amber-400/60 ring-1 ring-amber-400/30 shadow-sm shadow-amber-500/10'
                : 'border-border/60'
        }`}
        onClick={onClick}
    >
        <div className="relative">
            {item.imageUrl ? (
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                />
            ) : (
                <div className="w-full h-40 bg-muted/50 flex items-center justify-center">
                    <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30" />
                </div>
            )}
            {item.isBestSeller && (
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/30 border-0 px-2.5 py-1">
                    <Star className="w-3.5 h-3.5 mr-1 fill-yellow-200 text-yellow-200 drop-shadow-sm" />
                    Best Seller
                </Badge>
            )}
            <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                {item.categoryName}
            </Badge>
        </div>
        <CardContent className="p-4">
            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
            {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
            )}
            <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-primary">{formatVND(item.price)}</span>
                <Button size="sm" variant="outline" className="h-8">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                </Button>
            </div>
        </CardContent>
    </Card>
);

interface CustomizeDialogProps {
    item: WaiterMenuItemDTO;
    quantity: number;
    setQuantity: (q: number) => void;
    note: string;
    setNote: (n: string) => void;
    selectedCustomizations: Record<string, number>;
    setSelectedCustomizations: (c: Record<string, number>) => void;
    onAdd: () => void;
    onClose: () => void;
}

const CustomizeDialog = ({
    item, quantity, setQuantity, note, setNote,
    selectedCustomizations, setSelectedCustomizations, onAdd, onClose,
}: CustomizeDialogProps) => {
    const custTotal = Object.entries(selectedCustomizations)
        .reduce((sum, [id, qty]) => {
            const c = item.customizations.find(c => c.customizationId === id);
            return sum + (c ? c.price * qty : 0);
        }, 0);

    const totalPrice = (item.price + custTotal) * quantity;

    const updateCustomizationQuantity = (custId: string, quantity: number) => {
        if (quantity <= 0) {
            const newCustomizations = { ...selectedCustomizations };
            delete newCustomizations[custId];
            setSelectedCustomizations(newCustomizations);
        } else {
            setSelectedCustomizations({
                ...selectedCustomizations,
                [custId]: quantity,
            });
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                    <DialogDescription>Customize your order</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {item.imageUrl && (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    )}

                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{formatVND(item.price)}</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center text-lg font-bold">{quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {item.customizations.length > 0 && (
                        <div>
                            <label className="text-sm font-medium">Options</label>
                            <div className="space-y-2 mt-2">
                                {item.customizations.map(c => {
                                    const currentQty = selectedCustomizations[c.customizationId] || 0;
                                    return (
                                        <div
                                            key={c.customizationId}
                                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <span className="text-sm font-medium">{c.name}</span>
                                                <span className="text-xs text-muted-foreground block">+${c.price.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateCustomizationQuantity(c.customizationId, currentQty - 1)}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm font-medium">{currentQty}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateCustomizationQuantity(c.customizationId, currentQty + 1)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                            className="mt-1"
                            placeholder='e.g. "less spicy", "no onion"'
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onAdd}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Order - {formatVND(totalPrice)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WaiterOrderPage;
