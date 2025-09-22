import React from 'react';
import { Card } from '@/components/ui';
import { Transaction } from '@/types';
import { formatRupiah, formatDate } from '@/lib/financial';

interface TransactionListProps {
  transactions: Transaction[];
  maxItems?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  maxItems = 5 
}) => {
  const displayTransactions = transactions.slice(0, maxItems);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Makanan': 'bg-orange-100 text-orange-800',
      'Transport': 'bg-blue-100 text-blue-800',
      'Belanja': 'bg-purple-100 text-purple-800',
      'Hiburan': 'bg-pink-100 text-pink-800',
      'Gaji': 'bg-green-100 text-green-800',
      'Investasi': 'bg-indigo-100 text-indigo-800',
      'Lainnya': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['Lainnya'];
  };

  return (
    <Card title="Transaksi Terbaru">
      <div className="space-y-4">
        {displayTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
        ) : (
          displayTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                    {transaction.category}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatRupiah(Math.abs(transaction.amount))}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TransactionList;