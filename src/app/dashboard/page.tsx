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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
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
      }
      
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const calculateStats = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = Math.abs(transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0))

    const totalBalance = totalIncome - totalExpense
    const totalTransactions = transactions.length

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      totalTransactions
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
      title: 'Total Saldo',
      value: formatCurrency(currentStats.totalBalance),
      icon: '💰',
      color: currentStats.totalBalance >= 0 ? '#059669' : '#dc2626',
      bgColor: currentStats.totalBalance >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderColor: currentStats.totalBalance >= 0 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)',
      gradient: currentStats.totalBalance >= 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
      indicator: currentStats.totalBalance >= 0 ? '+💹' : '-📉'
    },
    {
      title: 'Pemasukan',
      value: formatCurrency(currentStats.totalIncome),
      icon: '📈',
      color: '#2563eb',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      indicator: currentStats.totalIncome > 0 ? '+📈' : '0%'
    },
    {
      title: 'Pengeluaran',
      value: formatCurrency(currentStats.totalExpense),
      icon: '📉',
      color: '#dc2626',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      indicator: currentStats.totalExpense > 0 ? '+📉' : '0%'
    },
    {
      title: 'Transaksi',
      value: currentStats.totalTransactions.toString(),
      icon: '📊',
      color: '#d97706',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      indicator: currentStats.totalTransactions > 0 ? '+📊' : '0%'
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
            }}>Loading dashboard...</div>
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
              color: 'transparent',
              marginBottom: '0.5rem'
            }}>
              Financial Dashboard
            </h1>
            <p style={{
              color: '#374151',
              fontSize: '1rem'
            }}>
              Kelola keuangan Anda dengan mudah dan efektif
            </p>
          </div>

          {/* Stats Cards - Mobile Carousel / Desktop Grid */}
          {isMobile ? (
            <div style={{
              marginBottom: '2rem'
            }}>
              {/* Mobile Carousel Container */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${statsCards[currentCardIndex].borderColor}`,
                boxShadow: `0 4px 15px ${statsCards[currentCardIndex].bgColor}`
              }}>
                {/* Carousel Content */}
                <div 
                  className="card-carousel"
                  style={{
                    transform: `translateX(-${currentCardIndex * 100}%)`
                  }}
                >
                  {statsCards.map((card, index) => (
                    <div
                      key={index}
                      className="card"
                      style={{
                        padding: '2rem 1.5rem',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          padding: '1rem',
                          background: card.gradient,
                          borderRadius: '1rem',
                          boxShadow: `0 4px 15px ${card.bgColor}`,
                          fontSize: '2rem'
                        }}>
                          {card.icon}
                        </div>
                      </div>
                      
                      <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.5rem'
                      }}>
                        {card.title}
                      </h3>
                      
                      <p style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: card.color,
                        marginBottom: '0.5rem'
                      }}>
                        {card.value}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: card.color,
                          background: card.bgColor,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem'
                        }}>
                          {card.indicator}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows - Glass Design */}
                <button
                  onClick={prevCard}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    width: '2.75rem',
                    height: '2.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.125rem',
                    color: 'rgba(55, 65, 81, 0.8)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                    zIndex: 10,
                    transition: 'all 0.2s ease',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
                >
                  ‹
                </button>

                <button
                  onClick={nextCard}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    width: '2.75rem',
                    height: '2.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.125rem',
                    color: 'rgba(55, 65, 81, 0.8)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                    zIndex: 10,
                    transition: 'all 0.2s ease',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
                >
                  ›
                </button>
              </div>

              {/* Dots Indicator - Glass Design */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '1.25rem'
              }}>
                {statsCards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCard(index)}
                    style={{
                      width: index === currentCardIndex ? '1.75rem' : '0.875rem',
                      height: '0.875rem',
                      borderRadius: '0.5rem',
                      border: index === currentCardIndex ? `1px solid ${statsCards[currentCardIndex].color}` : '1px solid rgba(255, 255, 255, 0.3)',
                      background: index === currentCardIndex 
                        ? `linear-gradient(135deg, ${statsCards[currentCardIndex].color}40, ${statsCards[currentCardIndex].color}60)` 
                        : 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: index === currentCardIndex 
                        ? `0 2px 8px ${statsCards[currentCardIndex].bgColor}, inset 0 1px 0 rgba(255, 255, 255, 0.5)` 
                        : '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (index !== currentCardIndex) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== currentCardIndex) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Desktop Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {statsCards.map((card, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: `1px solid ${card.borderColor}`,
                    boxShadow: `0 4px 15px ${card.bgColor}`,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 25px ${card.bgColor}`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 15px ${card.bgColor}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      padding: '0.75rem',
                      background: card.gradient,
                      borderRadius: '0.5rem',
                      boxShadow: `0 4px 15px ${card.bgColor}`
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: '1.25rem'
                      }}>
                        {card.icon}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: card.color,
                      background: card.bgColor,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '1rem'
                    }}>
                      {card.indicator}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem'
                  }}>
                    {card.title}
                  </h3>
                  <p style={{
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    color: card.color
                  }}>
                    {card.value}
                  </p>
                </div>
              ))}
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
                <span style={{ fontSize: '1.5rem' }}>➕</span>
                <span>Add Transaction</span>
              </button>

              <button
                onClick={() => router.push('/transactions')}
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
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <span>View History</span>
              </button>

              <button
                onClick={() => router.push('/budgets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
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
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                <span style={{ fontSize: '1.5rem' }}>🎯</span>
                <span>Manage Budgets</span>
              </button>

              <button
                onClick={() => router.push('/accounts')}
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
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      color: transaction.type === 'income' ? '#059669' : '#dc2626'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push('/transactions')}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(52, 211, 153, 0.1)',
                  color: '#047857',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(52, 211, 153, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(52, 211, 153, 0.1)'
                }}
              >
                View All Transactions
              </button>
            </div>
          )}
        </div>
      </>
    </ResponsiveLayout>
  )
}