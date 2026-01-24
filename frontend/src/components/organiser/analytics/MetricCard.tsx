import { ReactNode } from 'react';
import { Card } from '@/components/common/Card';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    description?: string;
    trend?: string;
    highlight?: boolean;
    accentColor?: 'blue' | 'green' | 'purple' | 'orange';
}

export const MetricCard = ({ title, value, icon, description, trend, highlight, accentColor = 'green' }: MetricCardProps) => {
    // Color mappings for border colors only
    const borderColors = {
        blue: 'border-blue-500',
        green: 'border-green-500',
        purple: 'border-purple-500',
        orange: 'border-orange-500'
    };

    const borderColor = borderColors[accentColor];

    return (
        <Card className={`p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${highlight ? `border-l-4 ${borderColor}` : ''}`}>
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                    </div>
                    {(description || trend) && (
                        <div className="flex flex-col gap-1">
                            {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
                            {trend && <p className="text-sm font-medium text-green-600 dark:text-green-400">{trend}</p>}
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
};
