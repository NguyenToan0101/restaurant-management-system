import { Users, Store, CreditCard, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminStats, userGrowthData, packageDistribution } from "@/data/adminMockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const statCards = [
  { title: "Total Users", value: adminStats.totalUsers.toLocaleString(), icon: Users, color: "text-primary" },
  { title: "Total Restaurants", value: adminStats.totalRestaurants.toLocaleString(), icon: Store, color: "text-accent" },
  { title: "Active Subscriptions", value: adminStats.activeSubscriptions.toLocaleString(), icon: CreditCard, color: "hsl(var(--violet))" },
  { title: "Monthly Revenue", value: `$${adminStats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-500" },
];

const Statistics = () => (
  <div className="p-6 space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
      <p className="text-muted-foreground text-sm">System overview and analytics</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((s) => (
        <Card key={s.title} className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{s.title}</p>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-border">
        <CardHeader><CardTitle className="text-base">User Growth (6 months)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-base">Package Distribution</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={packageDistribution} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label={({ name, value }) => `${name} ${value}%`}>
                {packageDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Statistics;
