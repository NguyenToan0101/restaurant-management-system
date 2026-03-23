import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRestaurantAnalytics, useTopSellingItems, useOrderDistribution } from "@/hooks/queries/useAnalyticsQueries";
import { useAIAssistantAccess } from "@/hooks/useFeatureLimits";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp, ShoppingCart, CheckCircle, XCircle, Award, BarChart3, Sparkles, Activity } from "lucide-react";
import { AIConsultantChatbot } from "@/components/ai/AIConsultantChatbot";
import { PremiumFeatureBanner } from "@/components/ai/PremiumFeatureBanner";

export function RestaurantAnalytics() {
  const { id } = useParams<{ id: string }>();
  const[timeframe, setTimeframe] = useState<'DAY' | 'MONTH' | 'YEAR'>('DAY');
  const[selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const[showAIChat, setShowAIChat] = useState(false);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useRestaurantAnalytics(id || '', timeframe);
  const { data: topItems, isLoading: topItemsLoading } = useTopSellingItems(id || '', timeframe, 10);
  const { data: orderDistribution, isLoading: distributionLoading } = useOrderDistribution(id || '', selectedDate);
  const { data: hasAIAccess, isLoading: aiAccessLoading } = useAIAssistantAccess(id);

  const isLoading = analyticsLoading || topItemsLoading || distributionLoading;

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/4 bg-slate-200 rounded-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[400px] bg-slate-200 rounded-xl"></div>
            <div className="h-[400px] bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (analyticsError || !analytics) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Activity className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-medium text-slate-900">Unable to load analytics</h3>
          <p className="text-slate-500">There was a problem fetching the data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50/30 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics Overview</h1>
            <p className="text-slate-500 mt-1">Monitor your restaurant's performance and insights.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg shadow-sm border">
            <Select value={timeframe} onValueChange={(value: 'DAY' | 'MONTH' | 'YEAR') => setTimeframe(value)}>
              <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAY">Today</SelectItem>
                <SelectItem value="MONTH">This Month</SelectItem>
                <SelectItem value="YEAR">This Year</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            {!aiAccessLoading && hasAIAccess && (
              <Button
                onClick={() => setShowAIChat(!showAIChat)}
                className={`gap-2 transition-all ${
                  showAIChat 
                    ? "bg-slate-100 text-slate-900 hover:bg-slate-200" 
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                }`}
                variant={showAIChat ? "ghost" : "default"}
              >
                <Sparkles className={`h-4 w-4 ${showAIChat ? "text-violet-600" : "text-white"}`} />
                {showAIChat ? "Close Assistant" : "Ask AI"}
              </Button>
            )}
          </div>
        </div>

        {!aiAccessLoading && !hasAIAccess && <PremiumFeatureBanner />}

        {/* Main Layout: Split into Content and AI Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* Main Analytics Content */}
          <div className={`flex-1 space-y-8 transition-all duration-500 ease-in-out w-full`}>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.totalRevenue)}</div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{analytics.totalOrders}</div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{analytics.completedOrders}</div>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {analytics.totalOrders > 0 ? `${((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)}% rate` : '0%'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Cancelled</CardTitle>
                  <div className="p-2 bg-red-100 rounded-full">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{analytics.cancelledOrders}</div>
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {analytics.totalOrders > 0 ? `${((analytics.cancelledOrders / analytics.totalOrders) * 100).toFixed(1)}% rate` : '0%'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Avg. Order Value</CardTitle>
                  <div className="p-2 bg-violet-100 rounded-full">
                    <Activity className="h-4 w-4 text-violet-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.avgOrderValue)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className={`grid grid-cols-1 gap-6 ${showAIChat ? 'xl:grid-cols-1' : 'xl:grid-cols-2'}`}>
              
              {/* Top Selling Items */}
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-amber-500" />
                    Top Selling Items
                  </CardTitle>
                  <CardDescription>Highest revenue generating items {timeframe.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topItems && topItems.length > 0 ? (
                      topItems.map((item, index) => (
                        <div key={item.menuItemId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-sm
                            ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                              index === 1 ? 'bg-slate-100 text-slate-600' : 
                              index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{item.menuItemName}</h3>
                            <p className="text-sm text-slate-500">{item.quantitySold} units sold</p>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-bold text-slate-900">{formatCurrency(item.totalRevenue)}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
                        <p>No sales data available yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Distribution */}
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Hourly Orders
                  </CardTitle>
                  <CardDescription>Order volume distribution across the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDistribution && orderDistribution.length > 0 ? (
                      orderDistribution
                        .filter(d => d.orderCount > 0)
                        .map((data) => {
                          const maxCount = Math.max(...orderDistribution.map(d => d.orderCount));
                          const percentage = Math.min((data.orderCount / maxCount) * 100, 100);
                          
                          return (
                            <div key={data.hour} className="flex items-center gap-4 group">
                              <span className="text-sm font-medium text-slate-500 w-16 tabular-nums">
                                {data.hour.toString().padStart(2, '0')}:00
                              </span>
                              <div className="flex-1 flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-1000 ease-out group-hover:opacity-80" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold w-8 text-right text-slate-700">{data.orderCount}</span>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Activity className="h-10 w-10 mb-3 opacity-20" />
                        <p>No order data for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Chat Sidebar - Sticky Panel */}
          {showAIChat && hasAIAccess && (
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 sticky top-6 z-10 animate-in slide-in-from-right-8 duration-300 ease-out">
              <AIConsultantChatbot
                restaurantId={id}
                timeframe={timeframe}
                specificDate={selectedDate}
                onClose={() => setShowAIChat(false)}
              />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}