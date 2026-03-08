export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
export type SubscriptionPaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
export type SubscriptionPaymentPurpose = 'NEW_SUBSCRIPTION' | 'RENEW' | 'UPGRADE';

export interface SubscriptionPaymentResponse {
  subscriptionPaymentId: string;
  amount: number;
  payOsOrderCode: string;
  payOsTransactionCode?: string;
  qrCodeUrl?: string;
  accountNumber?: string;
  accountName?: string;
  expiredAt: string;
  description?: string;
  subscriptionPaymentStatus: SubscriptionPaymentStatus;
  date: string;
  proratedAmount?: number;
  purpose: SubscriptionPaymentPurpose;
  restaurantId: string;
  restaurantName: string;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  restaurantId: string;
  packageId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  amount: number;
  checkoutUrl?: string;
  paymentStatus?: string;
  paymentInfo?: SubscriptionPaymentResponse;
}

export interface CreateRestaurantSubscriptionRequest {
  restaurantRequest: {
    userId: string;
    name: string;
    email: string;
    restaurantPhone: string;
    publicUrl?: string;
    description?: string;
  };
  packageId: string;
}
