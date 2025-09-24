'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ResponsiveLayout from '@/components/ResponsiveLayout'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'
import type { User } from '@supabase/supabase-js'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  account: string
  date: string
  created_at: string
  updated_at: string
}

interface Account {
  id: string
  name: string
  type: string
  balance: number
  user_id: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Fetch transactions
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)

        setTransactions(transactionsData || [])

        // Fetch accounts to calculate real total balance
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)

        setAccounts(accountsData || [])
      }
      
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const calculateStats = () => {
    // Calculate transaction-based income/expense
    const totalIncome = transactions
      .filter(t => t.type?.toLowerCase() === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = Math.abs(transactions
      .filter(t => t.type?.toLowerCase() === 'expense')
      .reduce((sum, t) => sum + t.amount, 0))

    // Calculate real total balance from account balances
    const totalAccountBalance = accounts
      .reduce((sum, account) => sum + (account.balance || 0), 0)

    const totalTransactions = transactions.length

    return {
      totalBalance: totalAccountBalance, // Use actual account balances
      transactionBalance: totalIncome - totalExpense, // Keep transaction-based calculation for comparison
      totalIncome,
      totalExpense,
      totalTransactions,
      totalAccounts: accounts.length
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const currentStats = calculateStats()
  
  const statsCards = [
    {
      title: 'Total Saldo Akun',
      value: formatCurrency(currentStats.totalBalance),
      icon: '💰',
      color: currentStats.totalBalance >= 0 ? '#059669' : '#dc2626',
      bgColor: currentStats.totalBalance >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderColor: currentStats.totalBalance >= 0 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)',
      gradient: currentStats.totalBalance >= 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
      indicator: currentStats.totalBalance >= 0 ? '+💹' : '-📉',
      subtitle: `${currentStats.totalAccounts} Akun`
    },
    {
      title: 'Pemasukan',
      value: formatCurrency(currentStats.totalIncome),
      icon: '📈',
      color: '#059669',
      bgColor: 'rgba(52, 211, 153, 0.1)',
      borderColor: 'rgba(52, 211, 153, 0.3)',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      indicator: '+💰'
    },
    {
      title: 'Pengeluaran', 
      value: formatCurrency(currentStats.totalExpense),
      icon: '📉',
      color: '#dc2626',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      indicator: '-💸'
    },
    {
      title: 'Net Transaksi',
      value: formatCurrency(currentStats.transactionBalance),
      icon: '⚖️',
      color: currentStats.transactionBalance >= 0 ? '#3b82f6' : '#f59e0b',
      bgColor: currentStats.transactionBalance >= 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
      borderColor: currentStats.transactionBalance >= 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)',
      gradient: currentStats.transactionBalance >= 0 ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
      indicator: currentStats.transactionBalance >= 0 ? '+📊' : '-📊',
      subtitle: `${currentStats.totalTransactions} Transaksi`
    }
  ]

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % statsCards.length)
  }

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + statsCards.length) % statsCards.length)
  }

  const goToCard = (index: number) => {
    setCurrentCardIndex(index)
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '2px solid #d1d5db',
              borderTop: '2px solid #059669',
              borderRadius: '50%',
              margin: '0 auto 1rem auto',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '500',
              color: '#374151'
            }}>Loading...</div>
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout>
      <>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .card-carousel {
            display: flex;
            transition: transform 0.3s ease-in-out;
          }
          .card-carousel .card {
            min-width: 100%;
            flex-shrink: 0;
          }
        `}</style>
        
        <div style={{
          padding: '1rem'
        }}>
          {/* Email Verification Banner */}
          <EmailVerificationBanner user={user} />
          
          {/* Welcome Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #047857, #1d4ed8)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              Selamat Datang! 👋
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              margin: 0
            }}>
              {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}, kelola keuangan Anda dengan mudah
            </p>
          </div>

          {/* Stats Cards - Mobile Carousel, Desktop Grid */}
          {isMobile ? (
            <div style={{
              position: 'relative',
              marginBottom: '2rem'
            }}>
              <div style={{
                overflow: 'hidden',
                borderRadius: '1rem'
              }}>
                <div 
                  className="card-carousel"
                  style={{
                    transform: `translateX(-${currentCardIndex * 100}%)`
                  }}
                >
                  {statsCards.map((card, index) => (
                    <div key={index} className="card" style={{
                      background: card.gradient,
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                      border: `1px solid ${card.borderColor}`,
                      color: 'white'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            opacity: 0.9,
                            margin: 0,
                            marginBottom: '0.5rem'
                          }}>
                            {card.title}
                          </h3>
                          <div style={{
                            fontSize: '1.75rem',
                            fontWeight: 'bold',
                            lineHeight: 1,
                            margin: 0
                          }}>
                            {card.value}
                          </div>
                          {card.subtitle && (
                            <div style={{
                              fontSize: '0.75rem',
                              opacity: 0.8,
                              marginTop: '0.25rem'
                            }}>
                              {card.subtitle}
                            </div>
                          )}
                        </div>
                        <div style={{
                          fontSize: '2rem',
                          opacity: 0.8
                        }}>
                          {card.icon}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        opacity: 0.9
                      }}>
                        <span style={{ marginRight: '0.5rem' }}>
                          {card.indicator}
                        </span>
                        Status Aktif
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Navigation Dots */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem'
              }}>
                {statsCards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCard(index)}
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: index === currentCardIndex ? '#059669' : '#d1d5db',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    aria-label={`Go to card ${index + 1}`}
                  />
                ))}
              </div>

              {/* Mobile Navigation Buttons */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0.5rem',
                transform: 'translateY(-50%)'
              }}>
                <button
                  onClick={prevCard}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '2.5rem',
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    fontSize: '1.25rem'
                  }}
                >
                  ←
                </button>
              </div>
              
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '0.5rem',
                transform: 'translateY(-50%)'
              }}>
                <button
                  onClick={nextCard}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '2.5rem',
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    fontSize: '1.25rem'
                  }}
                >
                  →
                </button>
              </div>
            </div>
          ) : (
            /* Desktop Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {statsCards.map((card, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: `1px solid ${card.borderColor}`,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 35px 60px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        margin: 0,
                        marginBottom: '0.5rem'
                      }}>
                        {card.title}
                      </h3>
                      <div style={{
                        fontSize: '1.75rem',
                        fontWeight: 'bold',
                        color: card.color,
                        lineHeight: 1,
                        margin: 0
                      }}>
                        {card.value}
                      </div>
                      {card.subtitle && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          marginTop: '0.25rem'
                        }}>
                          {card.subtitle}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      opacity: 0.8
                    }}>
                      {card.icon}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: card.color
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>
                      {card.indicator}
                    </span>
                    {card.title === 'Total Saldo Akun' ? 'Saldo Real' : 'Dari Transaksi'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Accounts Summary */}
          {accounts.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              boxShadow: '0 25px 50px rgba(52, 211, 153, 0.1)',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>Ringkasan Akun</h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {accounts.map((account) => (
                  <div key={account.id} style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    border: '1px solid rgba(229, 231, 235, 0.3)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#111827'
                        }}>
                          {account.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          textTransform: 'capitalize'
                        }}>
                          {account.type}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: account.balance >= 0 ? '#059669' : '#dc2626'
                      }}>
                        {formatCurrency(account.balance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 25px 50px rgba(52, 211, 153, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>Quick Actions</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}>
              <button
                onClick={() => router.push('/transactions/add')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(5, 150, 105, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                <span>Add Transaction</span>
              </button>

              <button
                onClick={() => router.push('/transactions')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <span>View Transactions</span>
              </button>

              <button
                onClick={() => router.push('/budgets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                <span style={{ fontSize: '1.5rem' }}>🎯</span>
                <span>Manage Budgets</span>
              </button>

              <button
                onClick={() => router.push('/management')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(124, 58, 237, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                <span style={{ fontSize: '1.5rem' }}>🏦</span>
                <span>Manage Accounts</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          {transactions.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              boxShadow: '0 25px 50px rgba(52, 211, 153, 0.1)',
              padding: '1.5rem',
              marginTop: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>Recent Transactions</h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div
                    key={transaction.id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(229, 231, 235, 0.3)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.5rem',
                        background: transaction.type === 'income' ? 
                          'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {transaction.type === 'income' ? '📈' : '📉'}
                        </span>
                      </div>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#111827',
                          fontSize: '0.875rem'
                        }}>
                          {transaction.description || 'Transaction'}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {transaction.category}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontWeight: '700',
                      color: transaction.type === 'income' ? '#059669' : '#dc2626',
                      fontSize: '0.875rem'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => router.push('/transactions')}
                  style={{
                    color: '#059669',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'underline'
                  }}
                >
                  View All Transactions →
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    </ResponsiveLayout>
  )
}