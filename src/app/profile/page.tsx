'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ResponsiveLayout from '@/components/ResponsiveLayout'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'
import { handleDatabaseError } from '@/lib/database-utils'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Fetch additional profile data if exists
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile({
            fullName: profileData.full_name || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            dateOfBirth: profileData.date_of_birth || ''
          })
        }
      }
      
      setLoading(false)
    }

    fetchUserData()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          date_of_birth: profile.dateOfBirth,
          updated_at: new Date().toISOString()
        })

      if (error) {
        const errorMessage = handleDatabaseError(error, 'update profile')
        alert(`${errorMessage}\n\nPlease check the console for setup instructions.`)
        return
      }
      
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Unexpected error updating profile:', error)
      alert('An unexpected error occurred. Please check the console and ensure database tables are created.')
    } finally {
      setIsUpdating(false)
    }
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
            }}>Loading profile...</div>
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
        `}</style>
        
        <div style={{
          padding: '1rem',
          maxWidth: '48rem',
          margin: '0 auto'
        }}>
          {/* Email Verification Banner */}
          <EmailVerificationBanner user={user} />
          
          {/* Header */}
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
              Profile Settings
            </h1>
            <p style={{
              color: '#374151',
              fontSize: '1rem'
            }}>
              Kelola informasi profile dan pengaturan akun Anda
            </p>
          </div>

          {/* Profile Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            overflow: 'hidden',
            marginBottom: '1.5rem'
          }}>
            {/* Profile Header */}
            <div style={{
              background: 'linear-gradient(135deg, #059669, #2563eb)',
              padding: '2rem',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                {user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.25rem'
              }}>
                {profile.fullName || 'User'}
              </h2>
              <p style={{
                fontSize: '0.875rem',
                opacity: 0.9
              }}>
                {user?.email}
              </p>
            </div>

            {/* Profile Form */}
            <div style={{
              padding: '2rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Personal Information
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    background: isEditing ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #059669, #047857)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div style={{
                display: 'grid',
                gap: '1.5rem'
              }}>
                {/* Full Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: 'rgba(255, 255, 255, 0.8)'
                      }}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(243, 244, 246, 0.5)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: '#374151'
                    }}>
                      {profile.fullName || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: 'rgba(255, 255, 255, 0.8)'
                      }}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(243, 244, 246, 0.5)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: '#374151'
                    }}>
                      {profile.phone || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: 'rgba(255, 255, 255, 0.8)'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(243, 244, 246, 0.5)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: '#374151'
                    }}>
                      {profile.dateOfBirth || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: 'rgba(255, 255, 255, 0.8)',
                        resize: 'vertical'
                      }}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(243, 244, 246, 0.5)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: '#374151',
                      minHeight: '3.5rem'
                    }}>
                      {profile.address || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    style={{
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      opacity: isUpdating ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            padding: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1.5rem'
            }}>
              Account Settings
            </h3>

            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(243, 244, 246, 0.5)',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Email Address
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {user?.email}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#059669',
                  background: 'rgba(5, 150, 105, 0.1)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  Verified
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(243, 244, 246, 0.5)',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Account Created
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </>
    </ResponsiveLayout>
  )
}