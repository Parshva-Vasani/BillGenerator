import { useState, useEffect } from 'react';
import { getProfile, saveProfile, UserProfile, getInvoices, InvoiceRecord, deleteInvoice } from '../lib/db';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Trash2, FileText } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    farmName: '',
    placeArea: '',
    mobileNo: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const pData = await getProfile();
    if (pData) setProfile(pData);

    const iData = await getInvoices();
    // Sort by most recent first
    iData.sort((a, b) => b.timestamp - a.timestamp);
    setInvoices(iData);
  };

  const handleSave = async () => {
    await saveProfile(profile);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice from your history?")) {
      await deleteInvoice(id);
      loadData(); // reload
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Profile & History</h2>
        <p className="text-gray-500">Manage your farm details and view past invoices.</p>
      </div>

      {/* Profile Section */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 h-24"></div>
        <div className="px-8 pb-8 relative">
          <div className="absolute -top-10 left-8 bg-white p-2 rounded-full shadow-md">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center text-blue-600">
              <User size={32} />
            </div>
          </div>

          <div className="mt-10 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Business Details</h3>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          {saveSuccess && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              Profile updated successfully!
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <User size={14} /> Farm Name
              </label>
              {isEditing ? (
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500 uppercase"
                  value={profile.farmName}
                  onChange={e => setProfile({...profile, farmName: e.target.value.toUpperCase()})}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 uppercase">{profile.farmName || 'Not Set'}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <MapPin size={14} /> Place / Area
              </label>
              {isEditing ? (
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
                  value={profile.placeArea}
                  onChange={e => setProfile({...profile, placeArea: e.target.value})}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{profile.placeArea || 'Not Set'}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Phone size={14} /> Mobile Number
              </label>
              {isEditing ? (
                <input 
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
                  value={profile.mobileNo}
                  maxLength={10}
                  onChange={e => setProfile({...profile, mobileNo: e.target.value.replace(/\D/g, '')})}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{profile.mobileNo || 'Not Set'}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Invoice History Section */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <FileText className="text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Saved Invoices</h3>
        </div>
        
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No invoices saved yet. Go to "New Invoice" to create one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Invoice #</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Receiver</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">#{inv.invoiceNumber}</td>
                    <td className="p-4 text-gray-600">{inv.date}</td>
                    <td className="p-4 text-gray-600 uppercase">{inv.receiverName}</td>
                    <td className="p-4 font-bold text-green-600">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <a 
                        href={`/invoice/${inv.id}`}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        title="Edit Invoice"
                      >
                        <FileText size={18} /> Edit
                      </a>
                      <button 
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Invoice Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
