export interface Branch {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  logo: string;
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  branches: Branch[];
  topSellers: MenuItem[];
}

export const mockRestaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Pho Hanoi",
    cuisine: "Vietnamese",
    logo: "🍜",
    totalRevenue: 525000,
    monthlyRevenue: 78000,
    totalOrders: 42500,
    branches: [
      { id: "b1", name: "District 1 Branch", address: "123 Nguyen Hue, District 1, HCMC", isActive: true },
      { id: "b2", name: "District 3 Branch", address: "456 Vo Van Tan, District 3, HCMC", isActive: true },
      { id: "b3", name: "District 7 Branch", address: "789 Nguyen Thi Thap, District 7, HCMC", isActive: false },
    ],
    topSellers: [
      { id: "m1", name: "Rare Beef Pho", sold: 8500, revenue: 178500 },
      { id: "m2", name: "Chicken Pho", sold: 6200, revenue: 117800 },
      { id: "m3", name: "Spicy Beef Noodle Soup", sold: 4800, revenue: 100800 },
      { id: "m4", name: "Steamed Rice Rolls", sold: 3500, revenue: 52500 },
      { id: "m5", name: "Fresh Spring Rolls", sold: 3100, revenue: 40300 },
    ],
  },
  {
    id: "r2",
    name: "Sushi Sakura",
    cuisine: "Japanese",
    logo: "🍣",
    totalRevenue: 890000,
    monthlyRevenue: 135000,
    totalOrders: 28000,
    branches: [
      { id: "b4", name: "Thao Dien Branch", address: "12 Xuan Thuy, District 2, HCMC", isActive: true },
      { id: "b5", name: "Phu My Hung Branch", address: "88 Nguyen Duc Canh, District 7, HCMC", isActive: true },
    ],
    topSellers: [
      { id: "m6", name: "Sashimi Combo", sold: 5200, revenue: 328000 },
      { id: "m7", name: "Dragon Roll", sold: 4100, revenue: 155800 },
      { id: "m8", name: "Tonkotsu Ramen", sold: 3800, revenue: 114000 },
      { id: "m9", name: "Gyoza", sold: 3200, revenue: 54400 },
      { id: "m10", name: "Tempura Set", sold: 2900, revenue: 87000 },
    ],
  },
  {
    id: "r3",
    name: "Pizza Roma",
    cuisine: "Italian",
    logo: "🍕",
    totalRevenue: 375000,
    monthlyRevenue: 62000,
    totalOrders: 18500,
    branches: [
      { id: "b6", name: "Binh Thanh Branch", address: "321 Dien Bien Phu, Binh Thanh, HCMC", isActive: true },
    ],
    topSellers: [
      { id: "m11", name: "Margherita", sold: 4200, revenue: 105000 },
      { id: "m12", name: "Pepperoni", sold: 3600, revenue: 108000 },
      { id: "m13", name: "Pasta Carbonara", sold: 2800, revenue: 72800 },
      { id: "m14", name: "Tiramisu", sold: 2100, revenue: 35700 },
      { id: "m15", name: "Bruschetta", sold: 1800, revenue: 23400 },
    ],
  },
];
