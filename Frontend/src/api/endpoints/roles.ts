import apiClient from '../client';

export const rolesApi = {
    promoteToOrganiser: async (): Promise<void> => {
        await apiClient.post('/roles/promote-to-organiser');
    },
};
