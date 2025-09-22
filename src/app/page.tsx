export default function HomePage() {'use client''use client''use client';

  return (

    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">

      <div className="text-center">

        <h1 className="text-4xl font-bold text-gray-900 mb-4">import { useEffect } from 'react'

          Cuanify

        </h1>import { useSession } from 'next-auth/react'

        <p className="text-xl text-gray-600 mb-8">

          Aplikasi Pengelola Keuangan Pribadiimport { useRouter } from 'next/navigation'import { useEffect } from 'react'import React from 'react';

        </p>

        <div className="space-x-4">import Link from 'next/link'

          <a 

            href="/auth/signin"import Button from '@/components/ui/Button'import { useSession } from 'next-auth/react'import { DashboardLayout } from '@/components/layout';

            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"

          >

            Masuk

          </a>export default function HomePage() {import { useRouter } from 'next/navigation'import { MetricCard, TransactionList } from '@/components/financial';

          <a 

            href="/auth/signup"  const { data: session, status } = useSession()

            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"

          >  const router = useRouter()import Link from 'next/link'import { 

            Daftar

          </a>

        </div>

      </div>  useEffect(() => {import Button from '@/components/ui/Button'  CurrencyDollarIcon, 

    </div>

  )    if (status === 'loading') return

}
  ArrowTrendingUpIcon, 

    if (session) {

      router.push('/dashboard')export default function HomePage() {  ArrowTrendingDownIcon,

    }

  }, [session, status, router])  const { data: session, status } = useSession()  WalletIcon 



  if (status === 'loading') {  const router = useRouter()} from '@heroicons/react/24/outline';

    return (

      <div className="min-h-screen flex items-center justify-center">import { Transaction } from '@/types';

        <div className="text-lg">Memuat...</div>

      </div>  useEffect(() => {

    )

  }    if (status === 'loading') return// Sample data - nantinya akan diganti dengan data dari API



  if (session) {const sampleTransactions: Transaction[] = [

    return null

  }    if (session) {  {



  return (      router.push('/dashboard')    id: '1',

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="container mx-auto px-4 py-16">    }    date: '2024-09-22',

        <div className="text-center">

          <h1 className="text-5xl font-bold text-gray-900 mb-6">  }, [session, status, router])    description: 'Gaji Bulanan',

            Cuanify

          </h1>    amount: 8000000,

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">

            Aplikasi pengelola keuangan pribadi yang memberikan kontrol penuh   if (status === 'loading') {    category: 'Gaji',

            kepada Anda atas data finansial. Kelola keuangan dengan mudah, 

            aman, dan privat.    return (    type: 'income',

          </p>

                <div className="min-h-screen flex items-center justify-center">  },

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">

            <Link href="/auth/signup">        <div className="text-lg">Memuat...</div>  {

              <Button className="w-full sm:w-auto">

                Mulai Sekarang      </div>    id: '2',

              </Button>

            </Link>    )    date: '2024-09-21',

            <Link href="/auth/signin">

              <Button variant="outline" className="w-full sm:w-auto">  }    description: 'Belanja Groceries',

                Masuk

              </Button>    amount: -450000,

            </Link>

          </div>  if (session) {    category: 'Makanan',

        </div>

    return null // Will redirect to dashboard    type: 'expense',

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="text-center p-6">  }  },

            <div className="text-4xl mb-4">🔐</div>

            <h3 className="text-xl font-semibold mb-2">Aman & Privat</h3>  {

            <p className="text-gray-600">

              Data Anda disimpan dengan enkripsi dan hanya Anda yang bisa mengaksesnya  return (    id: '3',

            </p>

          </div>    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">    date: '2024-09-20',

          

          <div className="text-center p-6">      <div className="container mx-auto px-4 py-16">    description: 'Bensin Motor',

            <div className="text-4xl mb-4">📊</div>

            <h3 className="text-xl font-semibold mb-2">Visualisasi Cerdas</h3>        <div className="text-center">    amount: -50000,

            <p className="text-gray-600">

              Lihat pengeluaran Anda dalam bentuk diagram dan laporan yang mudah dipahami          <h1 className="text-5xl font-bold text-gray-900 mb-6">    category: 'Transport',

            </p>

          </div>            Cuanify    type: 'expense',

          

          <div className="text-center p-6">          </h1>  },

            <div className="text-4xl mb-4">🎯</div>

            <h3 className="text-xl font-semibold mb-2">Budgeting & Goals</h3>          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">  {

            <p className="text-gray-600">

              Atur anggaran bulanan dan capai tujuan keuangan dengan fitur pelacakan            Aplikasi pengelola keuangan pribadi yang memberikan kontrol penuh     id: '4',

            </p>

          </div>            kepada Anda atas data finansial. Kelola keuangan dengan mudah,     date: '2024-09-19',

        </div>

      </div>            aman, dan privat.    description: 'Investasi Reksadana',

    </div>

  )          </p>    amount: -1000000,

}
              category: 'Investasi',

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">    type: 'expense',

            <Link href="/auth/signup">  },

              <Button className="w-full sm:w-auto">  {

                Mulai Sekarang    id: '5',

              </Button>    date: '2024-09-18',

            </Link>    description: 'Freelance Project',

            <Link href="/auth/signin">    amount: 2500000,

              <Button variant="outline" className="w-full sm:w-auto">    category: 'Gaji',

                Masuk    type: 'income',

              </Button>  },

            </Link>];

          </div>

        </div>export default function HomePage() {

  return (

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">    <DashboardLayout>

          <div className="text-center p-6">      <div className="space-y-6">

            <div className="text-4xl mb-4">🔐</div>        {/* Header */}

            <h3 className="text-xl font-semibold mb-2">Aman & Privat</h3>        <div>

            <p className="text-gray-600">          <h1 className="text-2xl font-bold text-gray-900">Dashboard Keuangan</h1>

              Data Anda disimpan dengan enkripsi dan hanya Anda yang bisa mengaksesnya          <p className="text-gray-600">Ringkasan finansial Anda bulan ini</p>

            </p>        </div>

          </div>

                  {/* Metrics Cards */}

          <div className="text-center p-6">        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="text-4xl mb-4">📊</div>          <MetricCard

            <h3 className="text-xl font-semibold mb-2">Visualisasi Cerdas</h3>            title="Total Saldo"

            <p className="text-gray-600">            value={15750000}

              Lihat pengeluaran Anda dalam bentuk diagram dan laporan yang mudah dipahami            previousValue={14200000}

            </p>            formatAsCurrency={true}

          </div>            icon={<WalletIcon className="h-6 w-6" />}

                      color="blue"

          <div className="text-center p-6">          />

            <div className="text-4xl mb-4">🎯</div>          <MetricCard

            <h3 className="text-xl font-semibold mb-2">Budgeting & Goals</h3>            title="Pendapatan Bulan Ini"

            <p className="text-gray-600">            value={10500000}

              Atur anggaran bulanan dan capai tujuan keuangan dengan fitur pelacakan            previousValue={8000000}

            </p>            formatAsCurrency={true}

          </div>            icon={<ArrowTrendingUpIcon className="h-6 w-6" />}

        </div>            color="green"

      </div>          />

    </div>          <MetricCard

  )            title="Pengeluaran Bulan Ini"

}            value={3250000}
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
