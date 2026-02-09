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
        <Card className={`p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${highlight ? `border-l-4 ${borderColor}` : ''}`}>
            <div className="flex justify-between items-start">
                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                    <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">{title}</h3>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
                    </div>
                    {(description || trend) && (
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                            {description && <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{description}</p>}
                            {trend && <p className="text-[10px] sm:text-xs md:text-sm font-medium text-green-600 dark:text-green-400">{trend}</p>}
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ml-2 flex-shrink-0">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 [&>svg]:w-full [&>svg]:h-full">
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
