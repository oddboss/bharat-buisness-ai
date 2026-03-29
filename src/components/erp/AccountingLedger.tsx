import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, FileText, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

export function AccountingLedger() {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/accounting/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(txn => 
    txn.account?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssets = transactions.reduce((acc, curr) => acc + (curr.debit || 0), 150000);
  const totalLiabilities = transactions.reduce((acc, curr) => acc + (curr.credit || 0), 45000);
  const netIncome = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Assets</p>
          <h3 className="text-2xl font-bold text-white">₹ {totalAssets.toLocaleString()}</h3>
          <p className="text-emerald-500 flex items-center text-xs mt-2"><ArrowUpRight className="w-3 h-3 mr-1" /> +12% this month</p>
        </div>
        <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Liabilities</p>
          <h3 className="text-2xl font-bold text-white">₹ {totalLiabilities.toLocaleString()}</h3>
          <p className="text-red-500 flex items-center text-xs mt-2"><ArrowUpRight className="w-3 h-3 mr-1" /> +5% this month</p>
        </div>
        <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Net Income (YTD)</p>
          <h3 className="text-2xl font-bold text-white">₹ {netIncome.toLocaleString()}</h3>
          <p className="text-emerald-500 flex items-center text-xs mt-2"><ArrowUpRight className="w-3 h-3 mr-1" /> +18% this month</p>
        </div>
        <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Pending GST</p>
          <h3 className="text-2xl font-bold text-white">₹ 12,500</h3>
          <p className="text-yellow-500 flex items-center text-xs mt-2">Due in 5 days</p>
        </div>
      </div>

      {/* Ledger Actions */}
      <div className="flex items-center justify-between bg-[#111111] p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="glass-input pl-9 pr-4 py-2 text-sm w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1c23] border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1c23] border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4" /> New Voucher
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1a1c23]">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            General Ledger
          </h3>
          <span className="text-xs text-gray-400">Showing last 30 days</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1a1c23]/50 text-gray-400 border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Vch No.</th>
                  <th className="px-4 py-3 font-medium">Particulars</th>
                  <th className="px-4 py-3 font-medium">Vch Type</th>
                  <th className="px-4 py-3 font-medium text-right">Debit (₹)</th>
                  <th className="px-4 py-3 font-medium text-right">Credit (₹)</th>
                  <th className="px-4 py-3 font-medium text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((txn, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-gray-300">{new Date(txn.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-400">{txn.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{txn.account}</p>
                      <p className="text-xs text-gray-500">{txn.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10">
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                      {txn.debit > 0 ? txn.debit.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-red-400 font-medium">
                      {txn.credit > 0 ? txn.credit.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      {txn.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
