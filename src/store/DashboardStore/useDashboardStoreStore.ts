import { ConnectedApp } from '@/Types/Types';
import axios from 'axios';
import { create } from 'zustand';

interface DashboardStoreProps {
    isFetchingApps: boolean;
    connectedApps: ConnectedApp[];
    fetchConnectedApps: () => Promise<void>;

    isDisconnecting: boolean;
    disconnectApp: ({ provider, providerAccountId }: { provider: string, providerAccountId: string }) => Promise<void>;
}

export const useDashboardStore = create<DashboardStoreProps>((set,get) => ({
    isFetchingApps: true,
    connectedApps: [],
    fetchConnectedApps: async () => {
        try {
            const response = await axios.get('/api/get-apps');
            const data = response.data;
            set({ connectedApps: data.connectedApps, isFetchingApps: false });
        } catch (error: any) {
            console.error("Fetch Connected Apps Error:", error);
        }
    },

    isDisconnecting: false,
    disconnectApp: async ({ provider, providerAccountId }) => {
        set({ isDisconnecting: true });
        try {
            await axios.put('/api/disconnect', { provider, providerAccountId });
            set({ isFetchingApps: true });
            get().fetchConnectedApps();
            set({ isFetchingApps: false });
        } catch (error: any) {
            console.error("Disconnect Error:", error);
        }finally{
            set({ isDisconnecting: false });
        }
    }
}));