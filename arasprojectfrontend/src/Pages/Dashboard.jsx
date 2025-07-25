import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import Report from '../Components/Report';

const Dashboard = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [partNumber, setPartNumber] = useState('');
  const [level, setLevel] = useState('');

  return (
    <div className="relative min-h-screen bg-gray-100 p-6">
        <Navbar />
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md z-20">
            <h3 className="text-lg font-semibold mb-4 text-center">Search Part</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter Part Number"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring"
              />
              <input
                type="text"
                placeholder="Enter Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="w-full bg-yellow-500 text-white font-semibold py-2 rounded-md hover:bg-yellow-600"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
      <Report />

    </div>
  );
};

export default Dashboard;
