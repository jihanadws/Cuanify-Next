'use client'

export default function TestStylingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Styling Page</h1>
          <p className="text-gray-600 mb-6">Testing if Tailwind CSS is working properly</p>
          
          {/* Test various Tailwind classes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Blue Card</h2>
              <p className="text-blue-700">This should be a blue-themed card</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-green-900 mb-2">Green Card</h2>
              <p className="text-green-700">This should be a green-themed card</p>
            </div>
          </div>
          
          {/* Test buttons */}
          <div className="flex gap-4 mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Primary Button
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Secondary Button
            </button>
          </div>
          
          {/* Test responsive design */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              If you can see styled colors, borders, and spacing, Tailwind CSS is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}