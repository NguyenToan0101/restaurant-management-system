import axiosClient from './axiosClient';
import type {
  ApiResponse,
  AreaTableDTO,
  OrderDTO,
  BillDTO,
  CreateOrderRequest,
  AddItemsToOrderRequest,
  UpdateOrderItemRequest,
  ConfirmPaymentRequest,
  WaiterMenuItemDTO,
  WaiterCategoryDTO,
  TableStatus,
} from '@/types/dto';

class WaiterOrderApi {
  async createOrder(request: CreateOrderRequest): Promise<OrderDTO> {
    const response = await axiosClient.post<ApiResponse<OrderDTO>>('/waiter/orders', request);
    return response.data.result;
  }

  async addItemsToOrder(orderId: string, request: AddItemsToOrderRequest): Promise<OrderDTO> {
    const response = await axiosClient.post<ApiResponse<OrderDTO>>(`/waiter/orders/${orderId}/items`, request);
    return response.data.result;
  }

  async getOrder(orderId: string): Promise<OrderDTO> {
    const response = await axiosClient.get<ApiResponse<OrderDTO>>(`/waiter/orders/${orderId}`);
    return response.data.result;
  }

  async getActiveOrderByTable(tableId: string): Promise<OrderDTO | null> {
    const response = await axiosClient.get<ApiResponse<OrderDTO | null>>(`/waiter/orders/table/${tableId}/active`);
    return response.data.result;
  }

  async getOrdersByBranch(branchId: string): Promise<OrderDTO[]> {
    const response = await axiosClient.get<ApiResponse<OrderDTO[]>>(`/waiter/orders/branch/${branchId}`);
    return response.data.result;
  }

  async getActiveOrdersByBranch(branchId: string): Promise<OrderDTO[]> {
    const response = await axiosClient.get<ApiResponse<OrderDTO[]>>(`/waiter/orders/branch/${branchId}/active`);
    return response.data.result;
  }

  async updateOrderItem(orderItemId: string, request: UpdateOrderItemRequest): Promise<OrderDTO> {
    const response = await axiosClient.put<ApiResponse<OrderDTO>>(`/waiter/orders/items/${orderItemId}`, request);
    return response.data.result;
  }

  async removeOrderItem(orderItemId: string): Promise<OrderDTO> {
    const response = await axiosClient.delete<ApiResponse<OrderDTO>>(`/waiter/orders/items/${orderItemId}`);
    return response.data.result;
  }

  async cancelOrder(orderId: string): Promise<OrderDTO> {
    const response = await axiosClient.put<ApiResponse<OrderDTO>>(`/waiter/orders/${orderId}/cancel`);
    return response.data.result;
  }

  async confirmPayment(request: ConfirmPaymentRequest): Promise<BillDTO> {
    const response = await axiosClient.post<ApiResponse<BillDTO>>('/waiter/bills/confirm', request);
    return response.data.result;
  }

  async getBillByOrder(orderId: string): Promise<BillDTO> {
    const response = await axiosClient.get<ApiResponse<BillDTO>>(`/waiter/bills/order/${orderId}`);
    return response.data.result;
  }

  async getBillsByBranch(branchId: string): Promise<BillDTO[]> {
    const response = await axiosClient.get<ApiResponse<BillDTO[]>>(`/waiter/bills/branch/${branchId}`);
    return response.data.result;
  }

  async getMenuForBranch(branchId: string): Promise<WaiterMenuItemDTO[]> {
    const response = await axiosClient.get<ApiResponse<WaiterMenuItemDTO[]>>(`/waiter/menu/branch/${branchId}`);
    return response.data.result;
  }

  async getCategoriesForBranch(branchId: string): Promise<WaiterCategoryDTO[]> {
    const response = await axiosClient.get<ApiResponse<WaiterCategoryDTO[]>>(`/waiter/menu/branch/${branchId}/categories`);
    return response.data.result;
  }

  async setTableStatus(tableId: string, status: TableStatus): Promise<AreaTableDTO> {
    const response = await axiosClient.put<ApiResponse<AreaTableDTO>>(`/waiter/tables/${tableId}/status?status=${status}`);
    return response.data.result;
  }
}

export const waiterOrderApi = new WaiterOrderApi();
