
import { ConnectedApp } from '@/Types/Types';
import axios from 'axios';
import { create } from 'zustand';

interface DashboardStoreProps {
    connectedApps: ConnectedApp[];
    fetchConnectedApps: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStoreProps>((set) => ({
    connectedApps: [],
    fetchConnectedApps: async () => {
        try {
            const response = await axios.get('/api/get-apps');
            const data = response.data;
            set({ connectedApps: data });
            console.log("Connected Apps:", data);

        } catch (error: any) {
            console.error("Fetch Connected Apps Error:", error);
        }
    }
}));