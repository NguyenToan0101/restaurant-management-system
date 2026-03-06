import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageIcon, X } from "lucide-react";
import type { MenuItemDTO, CategoryDTO, CustomizationDTO } from "@/types/dto";

interface MenuItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: MenuItemDTO | null;
  categories: CategoryDTO[];
  customizations: CustomizationDTO[];
  onSave: (data: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    isBestSeller: boolean;
    customizationIds: string[];
    imageFile?: File;
  }) => Promise<void>;
  isSaving?: boolean;
}

export function MenuItemFormDialog({
  open,
  onOpenChange,
  menuItem,
  categories,
  customizations,
  onSave,
  isSaving = false,
}: MenuItemFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fName, setFName] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fPrice, setFPrice] = useState("");
  const [fImageFile, setFImageFile] = useState<File | null>(null);
  const [fImagePreview, setFImagePreview] = useState("");
  const [fCatId, setFCatId] = useState("");
  const [fBestSeller, setFBestSeller] = useState(false);
  const [fActive, setFActive] = useState(true);

  // Get customizations from selected category
  const categoryCustomizations = useMemo(() => {
    if (!fCatId) return [];
    const selectedCategory = categories.find((c) => c.id === fCatId);
    if (!selectedCategory) return [];
    return customizations.filter((cust) =>
      selectedCategory.customizationIds.includes(cust.id)
    );
  }, [fCatId, categories, customizations]);

  useEffect(() => {
    if (menuItem) {
      setFName(menuItem.name);
      setFDesc(menuItem.description);
      setFPrice(menuItem.price.toString());
      setFImageFile(null);
      setFImagePreview(menuItem.media?.url || "");
      setFCatId(menuItem.categoryId);
      setFBestSeller(menuItem.isBestSeller);
      setFActive(menuItem.isActive);
    } else {
      setFName("");
      setFDesc("");
      setFPrice("");
      setFImageFile(null);
      setFImagePreview("");
      setFCatId("");
      setFBestSeller(false);
      setFActive(true);
    }
  }, [menuItem, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFImageFile(null);
    setFImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!fName.trim() || !fCatId) return;
    const price = parseFloat(fPrice) || 0;

    await onSave({
      name: fName,
      description: fDesc,
      price,
      categoryId: fCatId,
      isBestSeller: fBestSeller,
      customizationIds: categoryCustomizations.map((c) => c.id),
      imageFile: fImageFile || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menuItem ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
          <DialogDescription>
            {menuItem ? "Update item details" : "Add a new dish to your menu"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Image */}
          <div className="space-y-2">
            <Label>Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {fImageFile ? "Change Image" : "Upload Image"}
            </Button>
            {fImagePreview && (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted/50 shadow-sm">
                <img
                  src={fImagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Spring Rolls"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Price *</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="0.00"
                value={fPrice}
                onChange={(e) => setFPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the dish..."
              value={fDesc}
              onChange={(e) => setFDesc(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={fCatId} onValueChange={setFCatId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={fBestSeller}
                  onCheckedChange={(v) => setFBestSeller(!!v)}
                />
                <span className="text-sm">Best Seller</span>
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      <Switch checked={fActive} onCheckedChange={setFActive} />
                      <span className="text-sm">
                        {fActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-[220px] whitespace-normal break-words text-xs"
                  >
                    If enabled, this item will include all category customizations.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Customizations from Category */}
          {fCatId && categoryCustomizations.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Customizations</Label>
              <p className="text-xs text-muted-foreground">
                Inherited from category. These customizations will be available for this item.
              </p>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex flex-wrap gap-1.5">
                  {categoryCustomizations.map((c) => (
                    <Badge key={c.id} variant="secondary" className="text-xs">
                      {c.name} {c.price > 0 && `+$${c.price.toFixed(2)}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {fCatId && categoryCustomizations.length === 0 && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Customizations</Label>
              <p className="text-xs text-muted-foreground italic">
                No customizations available for this category.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!fName.trim() || !fCatId || isSaving}>
            {isSaving ? "Saving..." : menuItem ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
