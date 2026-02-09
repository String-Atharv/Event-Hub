import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithCredentials, loginAsStaff, isAuthenticated } = useAuth();

    const [isStaffLogin, setIsStaffLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get success message from location state (e.g., from organiser promotion)
    const successMessage = (location.state as any)?.message;

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log('Login form submitted', { isStaffLogin, email }); // DEBUG
        setError(null);
        setIsLoading(true);

        try {
            console.log('Calling login service...'); // DEBUG
            const { redirectTo } = isStaffLogin
                ? await loginAsStaff(email, password)
                : await loginWithCredentials(email, password);

            console.log('Login successful, redirecting to:', redirectTo); // DEBUG
            navigate(redirectTo, { replace: true });
        } catch (err: any) {
            console.error('Login error details:', err);
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-netflix-black dark:to-netflix-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <Link to="/" className="flex justify-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        <span className="text-cyan-600 dark:text-cyan-500">Event</span>Hub
                    </div>
                </Link>
                <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {isStaffLogin ? 'Staff Portal Login' : 'Sign in to your account'}
                </h2>
                <div className="mt-1 text-center">
                    {isStaffLogin && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            For EventHub staff members only
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className={`bg-white dark:bg-netflix-dark py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border ${isStaffLogin ? 'border-purple-200 dark:border-purple-900 ring-2 ring-purple-100 dark:ring-purple-900/20' : 'border-gray-200 dark:border-gray-800'}`}>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Success Message */}
                        {successMessage && !isStaffLogin && (
                            <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email/Username Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isStaffLogin ? 'Username' : 'Email address'}
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type={isStaffLogin ? "text" : "email"}
                                    autoComplete={isStaffLogin ? "username" : "email"}
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-netflix-gray dark:text-white transition-colors duration-300"
                                    placeholder={isStaffLogin ? "staff_username" : "you@example.com"}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-netflix-gray dark:text-white transition-colors duration-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-xl font-bold text-white ${isStaffLogin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${isStaffLogin ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isStaffLogin ? 'Checking credentials...' : 'Signing in...'}
                                    </div>
                                ) : (
                                    isStaffLogin ? 'Login as Staff' : 'Sign in'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsStaffLogin(!isStaffLogin);
                                    setError(null);
                                    setEmail('');
                                    setPassword('');
                                }}
                                className="w-full text-center text-lg font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                {isStaffLogin ? '← Back to User Login' : 'Login as Staff Member →'}
                            </button>
                        </div>

                        {!isStaffLogin && (
                            <div className="mt-6">
                                <Link
                                    to="/register"
                                    className="w-full flex justify-center py-4 px-4 border-2 border-cyan-600 dark:border-cyan-400 rounded-lg shadow-sm text-xl font-bold text-cyan-600 dark:text-cyan-400 bg-transparent hover:bg-cyan-50 dark:hover:bg-cyan-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300"
                                >
                                    Create an account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Back to Home */}
                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <Link to="/" className="font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to browse events
                    </Link>
                </p>
            </div>
        </div>
    );
};
