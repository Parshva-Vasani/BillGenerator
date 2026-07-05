import { useState } from 'react';
import { motion } from 'framer-motion';

interface OnboardingProps {
  onComplete: (data: { farmName: string; placeArea: string; mobileNo: string }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [farmName, setFarmName] = useState('');
  const [placeArea, setPlaceArea] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim() || !placeArea.trim() || !mobileNo.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!/^\d{10}$/.test(mobileNo.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    onComplete({
      farmName: farmName.trim().toUpperCase(),
      placeArea: placeArea.trim(),
      mobileNo: mobileNo.trim()
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-blue-100"
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Fruits Billing & Analytics</h1>
        <p className="text-gray-500 mt-2">Please set up your farm profile to generate invoices.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition uppercase"
            placeholder="e.g., MY FARM NAME"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value.toUpperCase())}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Place / Area</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="e.g., Vadva kanya, Gujarat"
            value={placeArea}
            onChange={(e) => setPlaceArea(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
          <input
            type="tel"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="e.g., 8469329782"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
            maxLength={10}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-4"
        >
          Save Profile & Continue
        </button>
      </form>
    </motion.div>
  );
}
