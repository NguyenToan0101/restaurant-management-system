import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Store, Save } from "lucide-react";

export default function BranchInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
        <p className="text-muted-foreground">Manage contact information for this branch</p>
      </div>

      <Card className="glass-card border-border/60 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Store className="w-5 h-5 text-primary" />
             Branch Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">Update contact details for your branch</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="phone" className="pl-10" placeholder="Enter phone number" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" className="pl-10" placeholder="Enter email address" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="address" 
                className="pl-10 bg-muted/50" 
                placeholder="Branch address" 
                readOnly
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Address cannot be changed by managers
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
