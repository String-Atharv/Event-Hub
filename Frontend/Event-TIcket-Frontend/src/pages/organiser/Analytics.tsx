import { Card } from '@/components/common/Card';

export const Analytics = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Analytics & Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sales Overview</h2>
          <p className="text-gray-500 dark:text-gray-400">Charts will be displayed here</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Event Performance</h2>
          <p className="text-gray-500 dark:text-gray-400">Event performance metrics will be displayed here</p>
        </Card>
      </div>
    </div>
  );
};
