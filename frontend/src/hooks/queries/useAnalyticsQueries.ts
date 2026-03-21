import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analyticsApi';

export const useRestaurantAnalytics = (
  restaurantId: string, 
  timeframe: 'DAY' | 'MONTH' | 'YEAR' = 'DAY',
  enabled = true
) => {
  return useQuery({
    queryKey: ['restaurant-analytics', restaurantId, timeframe],
    queryFn: async () => {
      const response = await analyticsApi.getRestaurantAnalytics(restaurantId, timeframe);
      return response.data?.result;
    },
    enabled: enabled && !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useTopSellingItems = (
  restaurantId: string,
  timeframe: 'DAY' | 'MONTH' | 'YEAR' = 'DAY',
  limit: number = 10,
  enabled = true
) => {
  return useQuery({
    queryKey: ['top-selling-items', restaurantId, timeframe, limit],
    queryFn: async () => {
      const response = await analyticsApi.getTopSellingItems(restaurantId, timeframe, limit);
      return response.data?.result;
    },
    enabled: enabled && !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useOrderDistribution = (
  restaurantId: string,
  date: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['order-distribution', restaurantId, date],
    queryFn: async () => {
      const response = await analyticsApi.getOrderDistribution(restaurantId, date);
      return response.data?.result;
    },
    enabled: enabled && !!restaurantId && !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};