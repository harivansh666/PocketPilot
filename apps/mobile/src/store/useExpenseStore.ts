import axiosInstance from '@/lib/axios'
import Toast from 'react-native-toast-message'
import { create } from 'zustand'
import { getCategoryIconAndColor } from '@/utils/categoryHelpers'

type ExpenceState = {
    expenceData: any[]
    category: any[]
    budgetData: any[]
    dashboardData: { expence?: any[]; categories?: any[] } | null
    getExpence: () => Promise<void>
    addExpence: (data: any) => Promise<boolean>
    getCategory: () => Promise<void>
    addCategory: (data: { name: string; type?: 'Expense' | 'Budget' }) => Promise<boolean>
    addBudget: (data: any) => Promise<boolean>
    getDashboard: () => Promise<void>
}

export const useExpenseStore = create<ExpenceState>((set) => ({
    expenceData: [],
    category: [],
    budgetData: [],
    dashboardData: null,
    getExpence: async () => {
        try {
            const response = await axiosInstance.get('/expense/all');
            set({ expenceData: response.data?.data || response.data });
        } catch (error) {
            console.error('Error fetching expences:', error);
        }
    },
    addExpence: async (data: any) => {
        try {
            const response = await axiosInstance.post('/expense/add', data);
            console.log("response.data", response.data);
            console.log("data", data)
            const newExpense = response.data?.data || response.data;
            Toast.show({
                type: 'success',
                text1: 'Expense added successfully',
                visibilityTime: 500,
            });
            set((state) => ({ expenceData: [...state.expenceData, newExpense] }));
            return true;
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error adding expence',
            });
            console.error('Error adding expence:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
            }
            return false;
        }
    },
    getCategory: async () => {
        try {
            const response = await axiosInstance.get('/attributes/all');
            const rawCategories = response.data?.data || response.data || [];
            const mappedCategories = (Array.isArray(rawCategories) ? rawCategories : []).map((cat: any) => {
                const label = cat.name || cat.label || 'Unknown';
                const { icon, color } = getCategoryIconAndColor(label);
                return {
                    ...cat,
                    label,
                    icon: cat.icon || icon,
                    color: cat.color || color,
                };
            });
            set({ category: mappedCategories });
        } catch (error) {
            console.error('Error fetching categories:', error);
            Toast.show({
                type: 'error',
                text1: 'Error fetching categories',
            });
        }
    },

    addCategory: async (data: { name: string; type?: 'Expense' | 'Budget' }) => {
        try {
            const response = await axiosInstance.post('/attributes/create', {
                name: data.name,
                type: data.type || 'Expense',
            });
            const newCategory = response.data?.data || response.data;
            Toast.show({
                type: 'success',
                text1: 'Category added successfully',
                visibilityTime: 500,
            });
            const label = newCategory.name || newCategory.label || data.name;
            const { icon, color } = getCategoryIconAndColor(label);
            const mappedCat = {
                ...newCategory,
                label,
                icon: newCategory.icon || icon,
                color: newCategory.color || color,
            };
            set((state) => ({ category: [...state.category, mappedCat] }));
            return true;
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error adding category',
            });
            console.error('Error adding category:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
            }
            return false;
        }
    },

    addBudget: async (data: any) => {
        try {
            const response = await axiosInstance.post('/expense/add-budget', data);
            console.log("response.data", response.data);
            console.log("data", data)
            const newBudget = response.data?.data || response.data;
            Toast.show({
                type: 'success',
                text1: 'Budget added successfully',
                visibilityTime: 500,
            });
            set((state) => ({ budgetData: [...state.budgetData, newBudget] }));
            return true;
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error adding budget',
            });
            console.error('Error adding budget:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
            }
            return false;
        }
    },

    getDashboard: async () => {
        try {
            const response = await axiosInstance.get('/expense/get-dashboard');
            const data = response.data?.data || response.data;
            console.log('dashboardData::', data)
            set({ dashboardData: data });

        } catch (error) {
            console.error('Error fetching dashboard:', error);
        }
    }
}))

export default useExpenseStore;