import { mockProducts as initialMockProducts, Product } from '../data/mockProducts';

class ProductService {
    private products: Product[] = [];
    private listeners: ((products: Product[]) => void)[] = [];

    constructor() {
        this.products = [...initialMockProducts];
    }

    getProducts(): Product[] {
        return [...this.products];
    }

    updateProduct(id: string, updates: Partial<Product>) {
        this.products = this.products.map(p =>
            p.id === id ? { ...p, ...updates } : p
        );
        this.notify();
    }

    addProduct(product: Product) {
        this.products = [product, ...this.products];
        this.notify();
    }

    getCategories(): string[] {
        const categories = this.products.map(p => p.category);
        return Array.from(new Set(categories));
    }

    subscribe(listener: (products: Product[]) => void) {
        this.listeners.push(listener);
        listener(this.products);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.products));
    }
}

const productService = new ProductService();
export default productService;
