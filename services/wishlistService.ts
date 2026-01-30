import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../data/mockProducts';

const WISHLIST_KEY = 'user_wishlist';

type WishlistListener = (items: Product[]) => void;

class WishlistService {
    private items: Product[] = [];
    private listeners: WishlistListener[] = [];

    constructor() {
        this.loadWishlist();
    }

    private async loadWishlist() {
        try {
            const stored = await AsyncStorage.getItem(WISHLIST_KEY);
            if (stored) {
                this.items = JSON.parse(stored);
                this.notify();
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    }

    private async saveWishlist() {
        try {
            await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving wishlist:', error);
        }
    }

    getItems(): Product[] {
        return this.items;
    }

    toggleWishlist(product: Product): boolean {
        const index = this.items.findIndex(item => item.id === product.id);
        let isAdded = false;

        if (index > -1) {
            this.items.splice(index, 1);
            isAdded = false;
        } else {
            this.items.push(product);
            isAdded = true;
        }

        this.saveWishlist();
        this.notify();
        return isAdded;
    }

    isInWishlist(productId: string): boolean {
        return this.items.some(item => item.id === productId);
    }

    subscribe(listener: WishlistListener) {
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

export const wishlistService = new WishlistService();
export default wishlistService;
