export const ORDER_STATUSES = ["Processing", "Delivered", "Cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
    orderId: string;
    customer: string;
    status: OrderStatus;
    expectedDelivery: string;
}
