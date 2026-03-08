import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSubscriptionQueries } from "@/hooks/queries/useSubscriptionQueries";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import type { SubscriptionPaymentResponse } from "@/types/dto/subscription.dto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Store, Clock, Copy, CheckCircle2, QrCode, Building2, CreditCard, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeCanvas } from "qrcode.react";

interface LocationState {
  package: PackageFeatureDTO;
  restaurant: { name: string; address: string; phone: string; email: string; website: string; description: string };
  payment: SubscriptionPaymentResponse;
}

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { toast } = useToast();
  const { cancelPayment, usePaymentStatusByOrderCode } = useSubscriptionQueries();
  
  const [copied, setCopied] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Poll payment status
  const { data: paymentStatus } = usePaymentStatusByOrderCode(
    state?.payment?.payOsOrderCode
  );

  useEffect(() => {
    if (!state) {
      navigate("/payment/select");
      return;
    }

    // Calculate countdown from expiredAt
    const expiredAt = new Date(state.payment.expiredAt).getTime();
    const now = Date.now();
    const remainingSeconds = Math.floor((expiredAt - now) / 1000);
    
    if (remainingSeconds <= 0) {
      navigate("/payment/failed", { state: { reason: "timeout" } });
      return;
    }

    setCountdown(remainingSeconds);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/payment/failed", { state: { reason: "timeout" } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state, navigate]);

  // Check payment status and redirect if paid
  useEffect(() => {
    if (paymentStatus?.subscriptionPaymentStatus === "PAID") {
      navigate("/payment/success", { state });
    }
  }, [paymentStatus, navigate, state]);

  if (!state) return null;
  const { package: pkg, payment } = state;

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  const handleCancelPayment = async () => {
    try {
      await cancelPayment.mutateAsync(payment.payOsOrderCode);
      navigate("/payment/failed", { state: { reason: "cancelled" } });
    } catch (error) {
      console.error("Failed to cancel payment:", error);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(label);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center h-16 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">BentoX</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
            <p className="text-muted-foreground">Scan the QR code or transfer manually</p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className={`w-4 h-4 ${countdown < 120 ? "text-destructive" : "text-muted-foreground"}`} />
            <span className={countdown < 120 ? "text-destructive font-semibold" : "text-muted-foreground"}>
              Payment expires in {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>

          {/* Amount */}
          <Card className="border-primary/30 text-center">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
              <p className="text-4xl font-bold">${payment.amount}</p>
              <p className="text-sm text-muted-foreground mt-1">{pkg.name} Plan</p>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-base flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-primary" /> Scan to Pay
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              {payment.qrCodeUrl ? (
                <>
                  <div className="p-4 bg-white rounded-2xl border-2 border-border">
                    <QRCodeCanvas
                      value={payment.qrCodeUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground text-center">
                    Scan with your banking app to pay
                  </p>
                </>
              ) : (
                <div className="w-52 h-52 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <QrCode className="w-16 h-16 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">QR Code not available</p>
                    <p className="text-xs mt-1">Please use bank transfer details below</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Transfer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Bank Transfer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Account Number", value: payment.accountNumber || "N/A", copyable: true },
                { label: "Account Holder", value: payment.accountName || "N/A", copyable: true },
                { label: "Transfer Note", value: payment.description || payment.payOsOrderCode, copyable: true },
                { label: "Amount", value: `${payment.amount}`, copyable: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2 font-medium">
                    <span>{item.value}</span>
                    {item.copyable && (
                      <button onClick={() => copyToClipboard(item.value, item.label)} className="text-muted-foreground hover:text-primary transition-colors">
                        {copied === item.label ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Separator />

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 gap-2" 
              onClick={handleCancelPayment}
              disabled={cancelPayment.isPending}
            >
              <X className="w-4 h-4" /> {cancelPayment.isPending ? "Cancelling..." : "Cancel"}
            </Button>
            <Button className="flex-1 gap-2" onClick={() => navigate("/payment/success", { state })}>
              <CreditCard className="w-4 h-4" /> I've Paid
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            After transferring, click "I've Paid" and we'll verify your payment within a few minutes.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentCheckout;
