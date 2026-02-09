import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { rolesApi } from '@/api/endpoints/roles';
import { useAuth } from '@/hooks/useAuth';
import { isOrganiser } from '@/utils/roles';

export const PromoteToOrganiserButton = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // If user is already organiser, don't show button
    if (isOrganiser(user)) {
        return null;
    }

    const handlePromote = async () => {
        try {
            setIsLoading(true);
            await rolesApi.promoteToOrganiser();

            // Promotion successful, logout and redirect to login
            logout();
            navigate('/login', {
                state: {
                    message: 'Promotion successful! Please log in again to access Organiser features.'
                }
            });
        } catch (error) {
            console.error('Failed to promote:', error);
            alert('Failed to process request. Please try again.');
        } finally {
            setIsLoading(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Become an Organiser?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        This will enable you to list events.
                        <strong>You will be logged out immediately</strong> to update your permissions.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handlePromote}
                            isLoading={isLoading}
                        >
                            Confirm & Logout
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="primary"
            onClick={() => setShowConfirm(true)}
            className="w-full justify-center" // Ensure it looks good in dropdown
        >
            Become an Organiser
        </Button>
    );
};
