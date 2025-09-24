'use client'

export default function CSSTestPage() {
  return (
    <div>
      {/* Test custom CSS class */}
      <div className="css-debug-test mt-4">
        <h1>CUSTOM CSS TEST - Orange</h1>
        <p>Jika Anda melihat background orange, globals.css ter-load dengan baik</p>
      </div>

      {/* Test inline styles untuk memastikan React berfungsi */}
      <div style={{ backgroundColor: 'red', padding: '20px', color: 'white' }}>
        <h1>INLINE STYLE TEST - Merah</h1>
        <p>Jika Anda melihat background merah, React berfungsi dengan baik</p>
      </div>

      {/* Test Tailwind CSS classes */}
      <div className="bg-blue-500 text-white p-8 mt-4">
        <h1 className="text-3xl font-bold">TAILWIND CSS TEST - Biru</h1>
        <p className="text-blue-100">Jika Anda melihat background biru, Tailwind CSS berfungsi</p>
      </div>

      {/* Test berbagai Tailwind utilities */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-400 p-4 rounded-lg shadow-lg">
          <h3 className="text-green-900 font-bold text-xl">Green Card</h3>
          <p className="text-green-800">Test Tailwind green colors</p>
        </div>
        
        <div className="bg-yellow-400 p-4 rounded-lg shadow-lg">
          <h3 className="text-yellow-900 font-bold text-xl">Yellow Card</h3>
          <p className="text-yellow-800">Test Tailwind yellow colors</p>
        </div>
        
        <div className="bg-purple-400 p-4 rounded-lg shadow-lg">
          <h3 className="text-purple-900 font-bold text-xl">Purple Card</h3>
          <p className="text-purple-800">Test Tailwind purple colors</p>
        </div>
      </div>

      {/* Test responsive dan hover states */}
      <div className="mt-8">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
          Hover Button Test
        </button>
        
        <button className="ml-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
          Pink Button Test
        </button>
      </div>

      {/* Debugging info */}
      <div className="mt-8 bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">CSS Debug Info:</h3>
        <p className="text-sm">
          Jika Anda hanya melihat kotak merah (inline style) tetapi tidak melihat warna lain, 
          maka Tailwind CSS tidak ter-load dengan benar.
        </p>
        <p className="text-sm mt-2">
          Jika Anda melihat semua warna (merah, biru, hijau, kuning, ungu), 
          maka Tailwind CSS berfungsi dengan sempurna.
        </p>
      </div>
    </div>
  )
}