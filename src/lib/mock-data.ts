export type UserType = "WHOLESALER" | "RETAILER";
export type StockStatus = "MAAL_AVAILABLE" | "STOCK_KAM_HAI" | "STOCK_KHATAM";

export type MockUser = {
  id: string;
  userType: UserType;
  businessName: string;
  category?: string;
  location?: string;
  ratingAvg: number;
  ratingCount: number;
};

export type MockProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  minOrderQty: number;
  stockStatus: StockStatus;
  ownerId: string;
  ownerBusinessName: string;
};

export type MockDeal = {
  id: string;
  dealType: "REQUIREMENT" | "OFFER";
  title: string;
  description?: string;
  category?: string;
  quantity?: number;
  createdAt: string;
  author: { id: string; businessName: string; userType: UserType };
};

export type MockMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  createdAt: string;
};

export type OrderStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "FULFILLED";

export type MockOrder = {
  id: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
  retailer: { id: string; businessName: string };
  wholesaler: { id: string; businessName: string };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { id: string; name: string; category: string };
  }[];
};

export const mockUsers: MockUser[] = [
  {
    id: "u_wh_1",
    userType: "WHOLESALER",
    businessName: "Sharma Traders",
    category: "Kirana",
    location: "Delhi",
    ratingAvg: 4.6,
    ratingCount: 128,
  },
  {
    id: "u_wh_2",
    userType: "WHOLESALER",
    businessName: "Jain Wholesale",
    category: "FMCG",
    location: "Mumbai",
    ratingAvg: 4.2,
    ratingCount: 64,
  },
  {
    id: "u_rt_1",
    userType: "RETAILER",
    businessName: "Gupta Stores",
    category: "General Store",
    location: "Jaipur",
    ratingAvg: 4.1,
    ratingCount: 22,
  },
  {
    id: "u_rt_2",
    userType: "RETAILER",
    businessName: "Aman Mart",
    category: "Grocery",
    location: "Pune",
    ratingAvg: 4.0,
    ratingCount: 12,
  },
];

export const mockProducts: MockProduct[] = [
  {
    id: "p_1",
    name: "Basmati Rice 25kg",
    category: "Kirana",
    price: 2200,
    quantity: 42,
    minOrderQty: 1,
    stockStatus: "MAAL_AVAILABLE",
    ownerId: "u_wh_1",
    ownerBusinessName: "Sharma Traders",
  },
  {
    id: "p_2",
    name: "Sunflower Oil 15L",
    category: "FMCG",
    price: 1950,
    quantity: 8,
    minOrderQty: 2,
    stockStatus: "STOCK_KAM_HAI",
    ownerId: "u_wh_2",
    ownerBusinessName: "Jain Wholesale",
  },
  {
    id: "p_3",
    name: "Sugar 50kg",
    category: "Kirana",
    price: 2650,
    quantity: 0,
    minOrderQty: 1,
    stockStatus: "STOCK_KHATAM",
    ownerId: "u_wh_1",
    ownerBusinessName: "Sharma Traders",
  },
];

export const mockDeals: MockDeal[] = [
  {
    id: "d_1",
    dealType: "REQUIREMENT",
    title: "Need Detergent powder bulk",
    description: "Monthly requirement, best rate chahiye.",
    category: "FMCG",
    quantity: 200,
    createdAt: "2026-01-01T00:00:00.000Z",
    author: { id: "u_rt_1", businessName: "Gupta Stores", userType: "RETAILER" },
  },
  {
    id: "d_2",
    dealType: "OFFER",
    title: "Rice 25kg wholesale offer",
    description: "Limited stock, fast pickup.",
    category: "Kirana",
    quantity: 50,
    createdAt: "2026-01-02T00:00:00.000Z",
    author: { id: "u_wh_1", businessName: "Sharma Traders", userType: "WHOLESALER" },
  },
];

export const mockMessages: MockMessage[] = [
  {
    id: "m_1",
    senderId: "u_rt_1",
    receiverId: "u_wh_1",
    body: "Rice ka best rate kya hai?",
    createdAt: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "m_2",
    senderId: "u_wh_1",
    receiverId: "u_rt_1",
    body: "₹2200 / bag. MOQ 1.",
    createdAt: "2026-01-03T00:05:00.000Z",
  },
];

export const mockOrders: MockOrder[] = [
  {
    id: "o_1",
    status: "PENDING",
    note: "Cash on delivery possible?",
    createdAt: "2026-01-04T00:00:00.000Z",
    updatedAt: "2026-01-04T00:00:00.000Z",
    retailer: { id: "u_rt_1", businessName: "Gupta Stores" },
    wholesaler: { id: "u_wh_1", businessName: "Sharma Traders" },
    items: [
      {
        id: "oi_1",
        quantity: 2,
        unitPrice: 2200,
        product: { id: "p_1", name: "Basmati Rice 25kg", category: "Kirana" },
      },
    ],
  },
];
