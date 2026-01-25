import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <p className="text-gray-900 dark:text-white">{user?.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <p className="text-gray-900 dark:text-white">{user?.name || '-'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

