import { Product } from '../data/mockProducts';

export interface OrderItem extends Product {
    quantity: number;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
    id: string;
    items: OrderItem[];
    totalAmount: number;
    address: string;
    paymentMethod: string;
    status: OrderStatus;
    date: string;
    estimatedDelivery: string;
}

class OrderService {
    private orders: Order[] = [];
    private listeners: ((orders: Order[]) => void)[] = [];

    constructor() {
        // Sample order for demo
        this.orders = [];
    }

    placeOrder(items: OrderItem[], totalAmount: number, address: string, paymentMethod: string): Order {
        const newOrder: Order = {
            id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            items: [...items],
            totalAmount,
            address,
            paymentMethod,
            status: 'Processing',
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 3600 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        };

        this.orders = [newOrder, ...this.orders];
        this.notify();
        return newOrder;
    }

    getOrders(): Order[] {
        return [...this.orders];
    }

    subscribe(listener: (orders: Order[]) => void) {
        this.listeners.push(listener);
        listener(this.orders);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.orders));
    }
}

const orderService = new OrderService();
export default orderService;
