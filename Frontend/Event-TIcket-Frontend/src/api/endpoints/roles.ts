import apiClient from '../client';

// Response Types
export interface PromoteToOrganiserResponse {
    success: boolean;
    message: string;
    userId: string;
    email: string;
    roles: string[];
    note: string;
}

export interface IsOrganiserResponse {
    isOrganiser: boolean;
    email: string;
    userId: string;
    currentRolesInToken: string[];
    note: string;
}

export interface AvailableRolesResponse {
    roles: string[];
    descriptions: Record<string, string>;
}

export interface UserProfileResponse {
    userId: string;
    name: string;
    email: string;
    roles: string[];
    rolesInCurrentToken: string[];
    tokenNeedsRefresh: boolean;
}

export const rolesApi = {
    /**
     * Promote current user to ORGANISER role
     * POST /api/v1/roles/promote-to-organiser
     */
    promoteToOrganiser: async (): Promise<PromoteToOrganiserResponse> => {
        const response = await apiClient.post<PromoteToOrganiserResponse>(
            '/roles/promote-to-organiser'
        );
        return response.data;
    },

    /**
     * Check if current user has ORGANISER role
     * GET /api/v1/roles/is-organiser
     */
    isOrganiser: async (): Promise<IsOrganiserResponse> => {
        const response = await apiClient.get<IsOrganiserResponse>(
            '/roles/is-organiser'
        );
        return response.data;
    },

    /**
     * Get all available roles in the system
     * GET /api/v1/roles/available
     */
    getAvailableRoles: async (): Promise<AvailableRolesResponse> => {
        const response = await apiClient.get<AvailableRolesResponse>(
            '/roles/available'
        );
        return response.data;
    },

    /**
     * Get current user profile with roles
     * GET /api/v1/roles/me
     */
    getCurrentUserProfile: async (): Promise<UserProfileResponse> => {
        const response = await apiClient.get<UserProfileResponse>(
            '/roles/me'
        );
        return response.data;
    },
};
