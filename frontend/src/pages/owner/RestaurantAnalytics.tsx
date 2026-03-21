import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRestaurantAnalytics, useTopSellingItems, useOrderDistribution } from "@/hooks/queries/useAnalyticsQueries";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp, ShoppingCart, CheckCircle, XCircle, Award, BarChart3 } from "lucide-react";

function RestaurantAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [timeframe, setTimeframe] = useState<'DAY' | 'MONTH' | 'YEAR'>('DAY');
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useRestaurantAnalytics(id || '', timeframe);
  const { data: topItems, isLoading: topItemsLoading } = useTopSellingItems(id || '', timeframe, 10);
  const { data: orderDistribution, isLoading: distributionLoading } = useOrderDistribution(id || '', selectedDate);

  const isLoading = analyticsLoading || topItemsLoading || distributionLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (analyticsError || !analytics) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Error loading analytics data
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Restaurant Analytics</h1>
        <Select value={timeframe} onValueChange={(value: 'DAY' | 'MONTH' | 'YEAR') => setTimeframe(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAY">Today</SelectItem>
            <SelectItem value="MONTH">This Month</SelectItem>
            <SelectItem value="YEAR">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.completedOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalOrders > 0 
                ? `${((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)}% completion rate`
                : 'No orders yet'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.cancelledOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalOrders > 0 
                ? `${((analytics.cancelledOrders / analytics.totalOrders) * 100).toFixed(1)}% cancellation rate`
                : 'No orders yet'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(analytics.avgOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems && topItems.length > 0 ? (
                topItems.map((item, index) => (
                  <div key={item.menuItemId} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.menuItemName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.quantitySold} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(item.totalRevenue)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Order Distribution (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orderDistribution && orderDistribution.length > 0 ? (
                orderDistribution
                  .filter(d => d.orderCount > 0)
                  .map((data) => (
                    <div key={data.hour} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">
                        {data.hour.toString().padStart(2, '0')}:00 - {(data.hour + 1).toString().padStart(2, '0')}:00
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((data.orderCount / Math.max(...orderDistribution.map(d => d.orderCount))) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{data.orderCount}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No order data for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { RestaurantAnalytics };