import  axiosClient  from './axiosClient';
import { BranchAnalyticsDTO, TopSellingItemDTO, OrderDistributionDTO } from '@/types/dto/analytics.dto';
import { ApiResponse } from '@/types/dto/api-response.dto';

export const analyticsApi = {
  getRestaurantAnalytics: (
    restaurantId: string, 
    timeframe: 'DAY' | 'MONTH' | 'YEAR' = 'DAY'
  ): Promise<ApiResponse<BranchAnalyticsDTO>> =>
    axiosClient.get(`/restaurants/${restaurantId}/analytics?timeframe=${timeframe}`),

  getTopSellingItems: (
    restaurantId: string,
    timeframe: 'DAY' | 'MONTH' | 'YEAR' = 'DAY',
    limit: number = 10
  ): Promise<ApiResponse<TopSellingItemDTO[]>> =>
    axiosClient.get(`/restaurants/${restaurantId}/analytics/top-selling-items?timeframe=${timeframe}&limit=${limit}`),

  getOrderDistribution: (
    restaurantId: string,
    date: string
  ): Promise<ApiResponse<OrderDistributionDTO[]>> =>
    axiosClient.get(`/restaurants/${restaurantId}/analytics/order-distribution?date=${date}`),
};