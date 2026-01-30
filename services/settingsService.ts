export interface AppSettings {
    appName: string;
    appLogo: string | null; // null means use local default
    maintenanceMode: boolean;
    freeShippingThreshold: number;
    supportEmail: string;
    storeCurrency: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    appName: 'BuyWay',
    appLogo: null, // Default to local assets/images/logo.png
    maintenanceMode: false,
    freeShippingThreshold: 999,
    supportEmail: 'support@buyway.com',
    storeCurrency: '₹'
};

class SettingsService {
    private settings: AppSettings = DEFAULT_SETTINGS;
    private listeners: ((settings: AppSettings) => void)[] = [];

    getSettings(): AppSettings {
        return { ...this.settings };
    }

    updateSettings(newSettings: Partial<AppSettings>) {
        this.settings = { ...this.settings, ...newSettings };
        this.notify();
    }

    private notify() {
        this.listeners.forEach(listener => listener({ ...this.settings }));
    }

    subscribe(listener: (settings: AppSettings) => void) {
        this.listeners.push(listener);
        // Initial call
        listener({ ...this.settings });
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
}

const settingsService = new SettingsService();
export default settingsService;
