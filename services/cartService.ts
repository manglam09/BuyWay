import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../data/mockProducts';

const CART_KEY = 'user_cart';

export interface CartItem extends Product {
    selectedSize?: string;
    quantity: number;
}

type CartListener = (items: CartItem[]) => void;

class CartService {
    private items: CartItem[] = [];
    private listeners: CartListener[] = [];

    constructor() {
        this.loadCart();
    }

    private async loadCart() {
        try {
            const stored = await AsyncStorage.getItem(CART_KEY);
            if (stored) {
                this.items = JSON.parse(stored);
                this.notify();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    private async saveCart() {
        try {
            await AsyncStorage.setItem(CART_KEY, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    getItems(): CartItem[] {
        return this.items;
    }

    addToCart(product: Product, size?: string) {
        const existingItemIndex = this.items.findIndex(
            item => item.id === product.id && item.selectedSize === size
        );

        if (existingItemIndex > -1) {
            this.items[existingItemIndex].quantity += 1;
        } else {
            this.items.push({
                ...product,
                selectedSize: size,
                quantity: 1,
            });
        }

        this.saveCart();
        this.notify();
    }

    removeFromCart(productId: string, size?: string) {
        this.items = this.items.filter(
            item => !(item.id === productId && item.selectedSize === size)
        );
        this.saveCart();
        this.notify();
    }

    updateQuantity(productId: string, size: string | undefined, delta: number) {
        const index = this.items.findIndex(
            item => item.id === productId && item.selectedSize === size
        );

        if (index > -1) {
            const newQuantity = this.items[index].quantity + delta;
            if (newQuantity > 0) {
                this.items[index].quantity = newQuantity;
            } else {
                this.items.splice(index, 1);
            }
            this.saveCart();
            this.notify();
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.notify();
    }

    getTotalPrice(): number {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    subscribe(listener: CartListener) {
        this.listeners.push(listener);
        listener(this.items);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l([...this.items]));
    }
}

export const cartService = new CartService();
export default cartService;
