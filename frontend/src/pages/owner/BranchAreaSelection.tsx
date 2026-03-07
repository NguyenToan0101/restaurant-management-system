import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useBranchesByRestaurant } from "@/hooks/queries/useBranchQueries";

const BranchAreaSelection = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: branches = [], isLoading } = useBranchesByRestaurant(id || '');

    const activeBranches = branches.filter(b => b.isActive);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-display mb-2">Select a Branch</h1>
                    <p className="text-muted-foreground">Choose a branch to manage its areas and tables</p>
                </div>

                {activeBranches.length === 0 ? (
                    <Card className="glass-card border-border/60">
                        <CardContent className="p-12 text-center">
                            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">No Active Branches</h3>
                            <p className="text-muted-foreground mb-4">
                                You need to create and activate at least one branch first.
                            </p>
                            <Button onClick={() => navigate(`/dashboard/${id}`)}>
                                Go to Overview
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeBranches.map((branch) => (
                            <Card
                                key={branch.branchId}
                                className="glass-card border-border/60 hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/dashboard/${id}/branches/${branch.branchId}/areas`)}
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span className="truncate">{branch.address}</span>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>{branch.branchPhone}</p>
                                        <p>{branch.mail}</p>
                                        <p className="text-xs">
                                            {branch.openingTime.substring(0, 5)} - {branch.closingTime.substring(0, 5)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BranchAreaSelection;
