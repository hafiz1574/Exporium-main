export type UserRole = "customer" | "admin";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  stock: number;
};

export type OrderStatus =
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED_CHINA"
  | "IN_TRANSIT"
  | "ARRIVED_BD"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  size?: string;
  price: number;
  quantity: number;
};

export type Order = {
  _id: string;
  userId: string;
  items: OrderItem[];
  amountTotal: number;
  currency: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  status: OrderStatus;
  trackingId: string;
  createdAt: string;
};

export type TrackingEvent = {
  _id: string;
  orderId: string;
  trackingId: string;
  status: OrderStatus;
  message: string;
  location?: string;
  createdAt: string;
};
