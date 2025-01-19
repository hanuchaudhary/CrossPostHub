
import { ConnectedApp } from '@/Types/Types';
import axios from 'axios';
import { create } from 'zustand';

interface DashboardStoreProps {
    isFetchingApps: boolean;
    connectedApps: ConnectedApp[];
    fetchConnectedApps: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStoreProps>((set) => ({
    isFetchingApps: true,
    connectedApps: [],
    fetchConnectedApps: async () => {
        try {
            const response = await axios.get('/api/get-apps');
            const data = response.data;
            set({ connectedApps: data.connectedApps , isFetchingApps: false });
        } catch (error: any) {
            console.error("Fetch Connected Apps Error:", error);
        }
    }
}));