import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRedirectForRole } from '@/utils/roles';

export const Unauthorized = () => {
    const { user, isAuthenticated } = useAuth();
    const redirectPath = getDefaultRedirectForRole(user);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>

                {/* Message */}
                <p className="text-gray-600 mb-6">
                    You are not authorised to access staff validation features.
                </p>

                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-500">
                    <p>
                        Staff validation is restricted to users with the <strong>STAFF</strong> role.
                    </p>
                    {isAuthenticated && user && (
                        <p className="mt-2">
                            Your current role: <span className="font-medium text-gray-700">{user.roles?.join(', ') || 'Unknown'}</span>
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        to={redirectPath}
                        className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Go to My Dashboard
                    </Link>
                    <Link
                        to="/"
                        className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Browse Events
                    </Link>
                </div>
            </div>
        </div>
    );
};
