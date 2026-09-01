import axiosInstance from '@/lib/axios'
import Toast from 'react-native-toast-message'
import { create } from 'zustand'



type ExpenceState = {
    expenceData: any[]
    category: any[]
    getExpence: () => Promise<void>
    addExpence: (data: any) => Promise<void>
    getCategory: () => Promise<void>
}

export const useExpenseStore = create<ExpenceState>((set) => ({
    expenceData: [],
    category: [],
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
            const newExpense = response.data?.data || response.data;
            Toast.show({
                type: 'success',
                text1: 'Expense added successfully',
                visibilityTime: 500,


            });
            set((state) => ({ expenceData: [...state.expenceData, newExpense] }));
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error adding expence',
            });
            console.error('Error adding expence:', error);
        }
    },
    getCategory: async () => {
        try {
            const response = await axiosInstance.get('/attributes/all');
            set({ category: response.data?.data || response.data });

        } catch (error) {
            console.error('Error fetching categories:', error);
            Toast.show({
                type: 'error',
                text1: 'Error fetching categories',
            });
        }
    }
}))

export default useExpenseStore;