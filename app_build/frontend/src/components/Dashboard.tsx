import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { getInvoices, InvoiceRecord } from '../lib/db';
import { TrendingUp, FileText, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getInvoices();
    setInvoices(data);
    processChartData(data);
  };

  const processChartData = (data: InvoiceRecord[]) => {
    // Group by month
    const grouped = data.reduce((acc: any, inv) => {
      // Assuming invoice.date is like "DD-MM-YYYY" or standard date string
      // Let's just use the month-year for simplicity
      const parts = inv.date.split('-'); // 12-05-2026
      const monthYear = parts.length === 3 ? `${parts[1]}/${parts[2].substring(2)}` : 'N/A';
      
      if (!acc[monthYear]) {
        acc[monthYear] = { name: monthYear, totalSales: 0, bills: 0 };
      }
      acc[monthYear].totalSales += inv.totalAmount;
      acc[monthYear].bills += 1;
      return acc;
    }, {});

    const sortedData = Object.values(grouped).sort((a: any, b: any) => {
      return a.name.localeCompare(b.name);
    });

    setChartData(sortedData);
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalBills = invoices.length;
  const avgBill = totalBills > 0 ? totalRevenue / totalBills : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500">Analyze your recent sales and billing data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><IndianRupee size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">₹ {totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl"><FileText size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{totalBills}</p>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Average Bill Value</p>
            <p className="text-2xl font-bold text-gray-900">₹ {avgBill.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (Monthly)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="totalSales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">No data available. Generate an invoice first.</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Invoices Generated</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="bills" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">No data available. Generate an invoice first.</div>
          )}
        </div>
      </div>
    </div>
  );
}
