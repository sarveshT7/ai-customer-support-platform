import type { Order } from "../models/order.js";

export const orders: Order[] = [
    {
      orderId: "ORD-1001",
      customer: "Sarvesh",
      status: "Processing",
      expectedDelivery: "Tomorrow",
    },
    {
      orderId: "ORD-1002",
      customer: "John",
      status: "Delivered",
      expectedDelivery: "Yesterday",
    },
    {
      orderId: "ORD-1003",
      customer: "Jane",
      status: "Processing",
      expectedDelivery: "Day after tomorrow",
    }
  ];