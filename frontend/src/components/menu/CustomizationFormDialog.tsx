import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CustomizationDTO } from "@/types/dto";

interface CustomizationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customization: CustomizationDTO | null;
  onSave: (data: { name: string; price: number }) => Promise<void>;
  isSaving?: boolean;
}

export function CustomizationFormDialog({
  open,
  onOpenChange,
  customization,
  onSave,
  isSaving = false,
}: CustomizationFormDialogProps) {
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");

  useEffect(() => {
    if (customization) {
      setFormName(customization.name);
      setFormPrice(customization.price.toString());
    } else {
      setFormName("");
      setFormPrice("");
    }
  }, [customization, open]);

  const handleSave = async () => {
    if (!formName.trim()) return;
    const price = parseFloat(formPrice) || 0;
    await onSave({ name: formName, price });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {customization ? "Edit Customization" : "New Customization"}
          </DialogTitle>
          <DialogDescription>
            {customization
              ? "Update customization details"
              : "Add a new topping, size, or add-on"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Extra Cheese"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              min="0"
              step="0.5"
              placeholder="0.00"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formName.trim() || isSaving}>
            {isSaving ? "Saving..." : customization ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
