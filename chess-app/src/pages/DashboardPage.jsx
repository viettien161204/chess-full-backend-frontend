import React from 'react'

const DashboardPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-roboto">
      <div className="w-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center h-10 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2 p-3">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <div className="flex-1 px-3">
            <span className="bg-gray-200 py-1 px-4 rounded-t-xl text-sm text-gray-600">
              Game Mode
            </span>
          </div>
        </div>
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h1>
          <p className="text-lg text-gray-600 mb-2">Game mode is under development.</p>
          <p className="text-lg text-gray-600">Please check back later to experience it!</p>
          <div className="text-6xl mt-6">🔧</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage