import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RotateCcw, Clock } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = (location.state as { reason?: string })?.reason || "unknown";

  const info = {
    cancelled: { title: "Payment Cancelled", desc: "You cancelled the payment. No charges were made.", icon: XCircle },
    timeout: { title: "Payment Expired", desc: "The payment window has expired. Please try again.", icon: Clock },
    unknown: { title: "Payment Failed", desc: "Something went wrong with your payment. Please try again.", icon: XCircle },
  }[reason] || { title: "Payment Failed", desc: "An error occurred.", icon: XCircle };

  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <Icon className="w-14 h-14 text-destructive" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{info.title}</h1>
          <p className="text-muted-foreground">{info.desc}</p>
        </div>

        <div className="space-y-3 pt-2">
          <Button size="lg" className="w-full gap-2" onClick={() => navigate("/payment/select")}>
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
