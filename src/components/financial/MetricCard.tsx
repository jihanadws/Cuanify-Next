import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { Card } from '@/components/ui';
import { formatRupiah, calculatePercentageChange, formatPercentage } from '@/lib/financial';

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  formatAsCurrency?: boolean;
  icon?: React.ReactNode;
  color?: 'green' | 'red' | 'blue' | 'gray';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  formatAsCurrency = false,
  icon,
  color = 'blue',
}) => {
  const percentageChange = previousValue ? calculatePercentageChange(value, previousValue) : null;
  const isPositive = percentageChange ? percentageChange > 0 : null;
  
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    blue: 'text-blue-600 bg-blue-100',
    gray: 'text-gray-600 bg-gray-100',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatAsCurrency ? formatRupiah(value) : value.toLocaleString()}
          </p>
          
          {percentageChange !== null && (
            <div className="flex items-center mt-2">
              {isPositive ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(Math.abs(percentageChange))}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs bulan lalu</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;