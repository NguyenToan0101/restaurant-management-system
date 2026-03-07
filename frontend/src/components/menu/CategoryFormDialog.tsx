import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import type { CategoryDTO, CustomizationDTO } from "@/types/dto";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryDTO | null;
  customizations: CustomizationDTO[];
  onSave: (data: { name: string; customizationIds: string[] }) => Promise<void>;
  isSaving?: boolean;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  customizations,
  onSave,
  isSaving = false,
}: CategoryFormDialogProps) {
  const [formName, setFormName] = useState("");
  const [formCustIds, setFormCustIds] = useState<string[]>([]);
  const [searchCust, setSearchCust] = useState("");

  useEffect(() => {
    if (open) {
      if (category) {
        setFormName(category.name);
        const custIds = category.customizationIds || [];
        setFormCustIds([...custIds]);
      } else {
        setFormName("");
        setFormCustIds([]);
      }
      setSearchCust("");
    }
  }, [category, open]);

  const filteredCusts = useMemo(() => {
    return customizations.filter(
      (c) => !searchCust || c.name.toLowerCase().includes(searchCust.toLowerCase())
    );
  }, [customizations, searchCust]);

  const handleSave = async () => {
    if (!formName.trim()) return;
    await onSave({ name: formName, customizationIds: formCustIds });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update category details" : "Create a new menu category"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              placeholder="e.g. Appetizers"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Customizations</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customizations..."
                value={searchCust}
                onChange={(e) => setSearchCust(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-[180px] overflow-y-auto border rounded-md p-2 space-y-2">
              {filteredCusts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 hover:bg-muted/50 rounded px-2 py-1 transition-colors"
                >
                  <Checkbox
                    id={`cust-${c.id}`}
                    checked={formCustIds.includes(c.id)}
                    className="rounded-none"
                    onCheckedChange={(checked) => {
                      setFormCustIds((prev) => {
                        if (checked === true) {
                          return [...prev, c.id];
                        } else {
                          return prev.filter((id) => id !== c.id);
                        }
                      });
                    }}
                  />
                  <Label
                    htmlFor={`cust-${c.id}`}
                    className="flex-1 flex items-center justify-between cursor-pointer text-sm font-normal"
                  >
                    <span>{c.name}</span>
                    {c.price > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ${c.price.toFixed(2)}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            {formCustIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {formCustIds.map((cid) => {
                  const c = customizations.find((x) => x.id === cid);
                  return c ? (
                    <Badge key={cid} variant="secondary" className="text-xs">
                      {c.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formName.trim() || isSaving}>
            {isSaving ? "Saving..." : category ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
