import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const CACHE_KEYS = {
    TRANSACTIONS: '@cache:transactions',
    CATEGORIES: '@cache:categories',
    BUDGETS: '@cache:budgets',
    STATS_SUMMARY: '@cache:stats_summary',
    STATS_DAILY: '@cache:stats_daily',
    STATS_MONTHLY: '@cache:stats_monthly',
    STATS_CATS: '@cache:stats_cats',
};

class CacheService {
    isWeb = Platform.OS === 'web';

    async save(key: string, data: any): Promise<void> {
        if (!data) return;
        try {
            const jsonValue = JSON.stringify(data);
            if (this.isWeb) {
                localStorage.setItem(key, jsonValue);
            } else {
                await AsyncStorage.setItem(key, jsonValue);
            }
        } catch (e) {
            console.error(`Failed to save cache for ${key}`, e);
        }
    }

    async load<T>(key: string): Promise<T | null> {
        try {
            let jsonValue: string | null = null;
            if (this.isWeb) {
                jsonValue = localStorage.getItem(key);
            } else {
                jsonValue = await AsyncStorage.getItem(key);
            }
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error(`Failed to load cache for ${key}`, e);
            return null;
        }
    }

    async clear(key: string): Promise<void> {
        try {
            if (this.isWeb) {
                localStorage.removeItem(key);
            } else {
                await AsyncStorage.removeItem(key);
            }
        } catch (e) {
            console.error(`Failed to clear cache for ${key}`, e);
        }
    }

    // Helper: Merge new item into list (Optimistic Update)
    async addItemToList<T>(key: string, item: T, unshift: boolean = true): Promise<T[]> {
        const list = (await this.load<T[]>(key)) || [];
        if (unshift) {
            list.unshift(item);
        } else {
            list.push(item);
        }
        await this.save(key, list);
        return list;
    }
}

export const cache = new CacheService();
