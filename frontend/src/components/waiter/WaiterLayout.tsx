import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import WaiterSidebar from "./WaiterSidebar";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuthStore } from "@/stores/authStore";
import { NotificationPopup } from "@/components/notifications/NotificationPopup";
import { ConnectionStatusIndicator } from "@/components/notifications/ConnectionStatusIndicator";
import { ConnectionWarning } from "@/components/notifications/ConnectionWarning";
import { NotificationErrorBoundary } from "@/components/notifications/NotificationErrorBoundary";
import { playNotificationSound } from "@/utils/audioAlert";
import { waiterOrderApi } from "@/api/waiterOrderApi";
import type { Notification, OrderNotificationData } from "@/types/dto/notification.dto";

function WaiterLayoutContent() {
    const navigate = useNavigate();
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const accessToken = useAuthStore((state) => state.accessToken);
    const { notifications, addNotification, dismissNotification, clearEventIdCache } = useNotification();
    const { connectionStatus, socket, retryCountdown } = useWebSocket(accessToken, "WAITER");
    const hasReconnectedRef = useRef(false);

    useEffect(() => {
        if (!socket) {
            return;
        }
        const handleOrderNotification = (data: any) => {
            try {
                const itemCount = data.itemCount || 0;
                const tableDisplay = data.tableNumber || data.tableName || 'Unknown';
                
                const notification: Notification = {
                    eventId: data.eventId,
                    type: 'order',
                    id: data.orderId,
                    title: `New Order - Table ${tableDisplay}`,
                    message: `${itemCount} item${itemCount !== 1 ? 's' : ''} ordered${data.customerName ? ` by ${data.customerName}` : ''}`,
                    timestamp: Date.now(),
                    data: {
                        orderId: data.orderId,
                        branchId: data.branchId,
                        tableNumber: data.tableNumber,
                        tableName: data.tableName,
                        customerName: data.customerName,
                        itemCount: data.itemCount,
                        totalAmount: data.totalAmount,
                    } as OrderNotificationData,
                };

                addNotification(notification);
                playNotificationSound();
                
                // Invalidate tables query to refresh table status
                window.queryClient?.invalidateQueries({ queryKey: ['tables'] });
                
                // Invalidate all order-related queries to refresh order details
                // This includes ['waiter', 'order', 'table', tableId] queries
                window.queryClient?.invalidateQueries({ 
                    predicate: (query) => {
                        const key = query.queryKey;
                        return Array.isArray(key) && 
                               key[0] === 'waiter' && 
                               (key[1] === 'order' || key[1] === 'orders');
                    }
                });
            } catch (error) {
                const fallbackNotification: Notification = {
                    eventId: data.eventId || `fallback-${Date.now()}`,
                    type: 'order',
                    id: 'unknown',
                    title: 'New Order',
                    message: 'A new order has been received',
                    timestamp: Date.now(),
                    data: {} as OrderNotificationData,
                };
                addNotification(fallbackNotification);
            }
        };

        const handleTableStatusChanged = (data: any) => {
            // Invalidate tables query to refresh table status
            window.queryClient?.invalidateQueries({ queryKey: ['tables'] });
            
            // Invalidate order queries for this specific table
            window.queryClient?.invalidateQueries({ 
                queryKey: ['waiter', 'order', 'table', data.tableId] 
            });
        };

        const handleAuthenticated = async () => {
            if (hasReconnectedRef.current && staffInfo?.branchId) {
                try {
                    await waiterOrderApi.getActiveOrdersByBranch(staffInfo.branchId);
                    clearEventIdCache();
                } catch (error) {
                }
            }
            hasReconnectedRef.current = true;
        };

        socket.on('order:new', handleOrderNotification);
        socket.on('table:status_changed', handleTableStatusChanged);
        socket.on('authenticated', handleAuthenticated);
        return () => {
            socket.off('order:new', handleOrderNotification);
            socket.off('table:status_changed', handleTableStatusChanged);
            socket.off('authenticated', handleAuthenticated);
        };
    }, [socket, staffInfo, addNotification, clearEventIdCache]);

    const navigateToOrder = (notification: Notification) => {
        dismissNotification(notification.eventId);
        
        // If notification has table info, navigate to table view (stays on same page if already there)
        // The table detail will be opened via URL state or we just stay on tables page
        navigate('/waiter/tables');
    };

    return (
        <SidebarProvider>
            <ConnectionWarning 
                isVisible={connectionStatus === 'disconnected' || connectionStatus === 'reconnecting'} 
                retryCountdown={retryCountdown ?? undefined}
            />
            <div className="flex min-h-screen w-full">
                <WaiterSidebar />
                <main className="flex-1 overflow-auto">
                    <div className="p-4 flex justify-end">
                        <ConnectionStatusIndicator status={connectionStatus} />
                    </div>
                    <Outlet />
                </main>
            </div>
            {notifications.map((notification) => (
                <NotificationErrorBoundary key={notification.eventId}>
                    <NotificationPopup
                        notification={notification}
                        onDismiss={() => dismissNotification(notification.eventId)}
                        onClick={() => navigateToOrder(notification)}
                    />
                </NotificationErrorBoundary>
            ))}
        </SidebarProvider>
    );
}

const WaiterLayout = () => {
    return (
        <NotificationProvider>
            <WaiterLayoutContent />
        </NotificationProvider>
    );
};

export default WaiterLayout;