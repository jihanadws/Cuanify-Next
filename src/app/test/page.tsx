'use client'

export default function TestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #eff6ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '1rem',
        padding: '3rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          background: 'linear-gradient(135deg, #059669, #2563eb)',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)'
        }}>
          <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>₿</span>
        </div>
        
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #047857, #2563eb, #059669)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Cuanify
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#374151',
          fontWeight: '500',
          marginBottom: '2rem'
        }}>
          Kelola keuangan personal Anda dengan mudah dan efektif
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '1rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
          onFocus={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
          onBlur={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
          >
            💰 Get Started
          </button>
          
          <button style={{
            background: 'white',
            color: '#059669',
            padding: '0.75rem 2rem',
            borderRadius: '1rem',
            border: '2px solid #059669',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            (e.target as HTMLElement).style.background = '#ecfdf5';
            (e.target as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLElement).style.background = 'white';
            (e.target as HTMLElement).style.transform = 'translateY(0)';
          }}
          onFocus={(e) => {
            (e.target as HTMLElement).style.background = '#ecfdf5';
            (e.target as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            (e.target as HTMLElement).style.background = 'white';
            (e.target as HTMLElement).style.transform = 'translateY(0)';
          }}
          >
            🔐 Sign In
          </button>
        </div>
        
        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
            }}>
              <span style={{ color: 'white', fontSize: '1.2rem' }}>📊</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>Budget Tracking</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Pantau anggaran dan pengeluaran Anda secara real-time</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)'
            }}>
              <span style={{ color: 'white', fontSize: '1.2rem' }}>📈</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>Smart Analytics</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Analisis mendalam untuk keputusan finansial yang lebih baik</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #f59e0b, #eab308)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
            }}>
              <span style={{ color: 'white', fontSize: '1.2rem' }}>🔒</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>Secure & Private</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Data keuangan Anda aman dengan enkripsi tingkat bank</p>
          </div>
        </div>
      </div>
    </div>
  )
}