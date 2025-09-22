'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import { MetricCard, TransactionList } from '@/components/financial';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  WalletIcon 
} from '@heroicons/react/24/outline';
import { Transaction } from '@/types';

// Sample data - nantinya akan diganti dengan data dari API
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-09-22',
    description: 'Gaji Bulanan',
    amount: 8000000,
    category: 'Gaji',
    type: 'income',
  },
  {
    id: '2',
    date: '2024-09-21',
    description: 'Belanja Groceries',
    amount: -450000,
    category: 'Makanan',
    type: 'expense',
  },
  {
    id: '3',
    date: '2024-09-20',
    description: 'Bensin Motor',
    amount: -50000,
    category: 'Transport',
    type: 'expense',
  },
  {
    id: '4',
    date: '2024-09-19',
    description: 'Investasi Reksadana',
    amount: -1000000,
    category: 'Investasi',
    type: 'expense',
  },
  {
    id: '5',
    date: '2024-09-18',
    description: 'Freelance Project',
    amount: 2500000,
    category: 'Gaji',
    type: 'income',
  },
];

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Keuangan</h1>
          <p className="text-gray-600">Ringkasan finansial Anda bulan ini</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Saldo"
            value={15750000}
            previousValue={14200000}
            formatAsCurrency={true}
            icon={<WalletIcon className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Pendapatan Bulan Ini"
            value={10500000}
            previousValue={8000000}
            formatAsCurrency={true}
            icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Pengeluaran Bulan Ini"
            value={3250000}
            previousValue={4100000}
            formatAsCurrency={true}
            icon={<ArrowTrendingDownIcon className="h-6 w-6" />}
            color="red"
          />
          <MetricCard
            title="Net Worth"
            value={7250000}
            previousValue={3900000}
            formatAsCurrency={true}
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            color="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <TransactionList transactions={sampleTransactions} maxItems={8} />
          </div>

          {/* Quick Actions or Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Tambah Transaksi
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  Lihat Laporan
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  Atur Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
