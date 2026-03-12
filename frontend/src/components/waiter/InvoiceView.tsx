import { forwardRef } from "react";
import type { BillDTO, OrderDTO } from "@/types/dto";

interface InvoiceViewProps {
    bill: BillDTO;
    order: OrderDTO;
}

const InvoiceView = forwardRef<HTMLDivElement, InvoiceViewProps>(({ bill, order }, ref) => {
    const allItems = order.orderLines?.flatMap(line => line.orderItems) || [];
    const itemCount = allItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const formatPaymentMethod = (method: string) => {
        switch (method) {
            case 'CASH': return 'Cash';
            case 'CARD': return 'Credit / Debit Card';
            case 'ONLINE': return 'Online Payment';
            default: return method;
        }
    };

    return (
        <div ref={ref} className="font-mono text-sm bg-white text-black p-6 min-w-[320px]" id="invoice-content">
            {/* Header */}
            <div className="text-center space-y-0.5 pb-4">
                <h2 className="text-xl font-bold uppercase tracking-wide">
                    {bill.restaurantName || "RESTAURANT"}
                </h2>
                {bill.branchName && bill.branchName !== bill.branchAddress && (
                    <p className="text-xs font-semibold">{bill.branchName}</p>
                )}
                {bill.branchAddress && (
                    <p className="text-xs text-gray-600">{bill.branchAddress}</p>
                )}
                {bill.branchPhone && (
                    <p className="text-xs text-gray-600">Tel: {bill.branchPhone}</p>
                )}
            </div>

            <div className="border-t-2 border-dashed border-gray-400" />

            {/* Bill Info */}
            <div className="py-3 space-y-1">
                <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-widest">Invoice</p>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Bill #</span>
                    <span className="font-medium">{bill.billId?.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">
                        {new Date(bill.paidTime).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">
                        {new Date(bill.paidTime).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Table</span>
                    <span className="font-medium">{order.tableName}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Payment</span>
                    <span className="font-medium">{formatPaymentMethod(bill.paymentMethod)}</span>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-400" />

            {/* Items Header */}
            <div className="py-2">
                <div className="grid grid-cols-12 text-[11px] font-bold uppercase text-gray-500 pb-1">
                    <span className="col-span-5">Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-3 text-right">Amount</span>
                </div>
                <div className="border-b border-gray-300" />
            </div>

            {/* Items */}
            <div className="space-y-0">
                {allItems.map((item) => (
                    <div key={item.orderItemId} className="py-1.5 border-b border-gray-200">
                        <div className="grid grid-cols-12 text-xs">
                            <div className="col-span-5 truncate font-medium">{item.menuItemName}</div>
                            <div className="col-span-2 text-center">{item.quantity}</div>
                            <div className="col-span-2 text-right">${item.menuItemPrice.toFixed(2)}</div>
                            <div className="col-span-3 text-right font-medium">${item.totalPrice.toFixed(2)}</div>
                        </div>
                        {item.customizations?.length > 0 && (
                            <div className="pl-2 pt-0.5">
                                {item.customizations.map(c => (
                                    <p key={c.orderItemCustomizationId} className="text-[10px] text-gray-500">
                                        + {c.customizationName} {c.totalPrice > 0 ? `($${c.totalPrice.toFixed(2)})` : ''}
                                    </p>
                                ))}
                            </div>
                        )}
                        {item.note && (
                            <p className="text-[10px] text-gray-400 pl-2 italic">"{item.note}"</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="border-t-2 border-dashed border-gray-400 mt-2" />

            {/* Totals */}
            <div className="py-3 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Items</span>
                    <span>{itemCount}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 mt-1 pt-1" />
                <div className="flex justify-between text-base font-bold">
                    <span>TOTAL</span>
                    <span>${bill.finalPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* Note */}
            {bill.note && (
                <>
                    <div className="border-t border-dashed border-gray-400" />
                    <div className="py-2">
                        <p className="text-[11px] text-gray-500">Note: {bill.note}</p>
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="border-t-2 border-dashed border-gray-400 pt-3 text-center space-y-1">
                <p className="text-xs font-medium">Thank you for dining with us!</p>
                <p className="text-[10px] text-gray-400">Please come again</p>
            </div>
        </div>
    );
});

InvoiceView.displayName = "InvoiceView";

export default InvoiceView;
