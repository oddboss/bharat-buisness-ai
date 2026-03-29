import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, DollarSign, MoreVertical, Plus, Filter, Target, TrendingUp, MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  outstanding_balance: number;
  last_purchase: string;
  status: string;
  segment?: string;
}

const getSegment = (customer: Customer) => {
  const lastPurchaseDate = new Date(customer.last_purchase);
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (customer.total_spent > 50000 && diffDays <= 30) return 'Champion';
  if (customer.total_spent > 20000 && diffDays <= 90) return 'Loyal';
  if (diffDays > 90 && customer.total_spent > 10000) return 'At Risk';
  if (diffDays <= 15 && customer.total_orders <= 1) return 'New';
  if (diffDays > 180) return 'Hibernating';
  return 'Regular';
};

const getSegmentColor = (segment: string) => {
  switch (segment) {
    case 'Champion': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Loyal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'At Risk': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'New': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Hibernating': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-white/5 text-gray-400 border-white/10';
  }
};

export function CRMSystem() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSegment, setFilterSegment] = useState('All');
  const [isSending, setIsSending] = useState<string | null>(null);

  const sendWhatsAppReminder = async (customer: Customer) => {
    if (customer.outstanding_balance <= 0) {
      alert("No outstanding balance for this customer.");
      return;
    }

    setIsSending(customer.id);
    try {
      const message = `💳 *Payment Reminder from BharatMind*\n\nDear ${customer.customer_name},\n\nThis is a friendly reminder regarding your outstanding balance of *₹${customer.outstanding_balance.toLocaleString()}*.\n\nYour last purchase was on ${new Date(customer.last_purchase).toLocaleDateString()}.\n\nPlease process the payment at your earliest convenience. Thank you!`;
      
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: customer.phone,
          message: message
        })
      });

      if (res.ok) {
        alert(`WhatsApp reminder sent to ${customer.customer_name}!`);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('WhatsApp Error:', err);
      alert(`Error: ${err.message}. Ensure WhatsApp credentials are set in Secrets.`);
    } finally {
      setIsSending(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('API response not ok');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API did not return JSON');
        }
        const data = await res.json();
        
        if (data.length === 0) {
          const mockRes = await fetch('/customer_data.json');
          if (!mockRes.ok) throw new Error('Mock data not found');
          const mockData = await mockRes.json();
          setCustomers(mockData);
        } else {
          setCustomers(data);
        }
      } catch (err) {
        console.error("Failed to load customer data from API, trying fallback", err);
        try {
          const mockRes = await fetch('/customer_data.json');
          if (mockRes.ok) {
            const mockData = await mockRes.json();
            setCustomers(mockData);
          }
        } catch (fallbackErr) {
          console.error("Final fallback failed", fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || customer.status === filterStatus;
    const matchesSegment = filterSegment === 'All' || getSegment(customer) === filterSegment;
    return matchesSearch && matchesStatus && matchesSegment;
  });

  const statuses = ['All', 'Active', 'Inactive', 'Lead'];
  const segments = ['All', 'Champion', 'Loyal', 'At Risk', 'New', 'Hibernating', 'Regular'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CRM KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Customers</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{customers.length}</div>
          <div className="text-xs text-emerald-500 mt-2">+12% from last month</div>
        </div>
        
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Champions</span>
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-500">
            {customers.filter(c => getSegment(c) === 'Champion').length}
          </div>
          <div className="text-xs text-emerald-500 mt-2">Top 5% of customers</div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Customer Value</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹{(customers.reduce((acc, c) => acc + c.total_spent, 0) / customers.length).toFixed(0)}
          </div>
          <div className="text-xs text-emerald-500 mt-2">+5% YoY growth</div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Retention Rate</span>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-white">84%</div>
          <div className="text-xs text-emerald-500 mt-2">Industry leading</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111111] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input px-4 py-2 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select 
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
            className="glass-input px-4 py-2 text-sm"
          >
            {segments.map(segment => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Total Orders</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Outstanding</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Last Purchase</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.slice(0, 50).map((customer) => (
                <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                        {customer.customer_name.charAt(0)}
                      </div>
                      <div className="text-sm font-medium text-white">{customer.customer_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Mail className="w-3 h-3" /> {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Phone className="w-3 h-3" /> {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded",
                      customer.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" :
                      customer.status === 'Lead' ? "bg-orange-500/10 text-orange-500" :
                      "bg-gray-500/10 text-gray-500"
                    )}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border",
                      getSegmentColor(getSegment(customer))
                    )}>
                      {getSegment(customer)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{customer.total_orders}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">₹{(customer.total_spent || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-sm font-bold",
                      (customer.outstanding_balance || 0) > 0 ? "text-red-500" : "text-emerald-500"
                    )}>
                      ₹{(customer.outstanding_balance || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" /> {new Date(customer.last_purchase).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {customer.outstanding_balance > 0 && (
                        <button 
                          onClick={() => sendWhatsAppReminder(customer)}
                          disabled={isSending === customer.id}
                          className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-500 group/wa relative"
                          title="Send WhatsApp Reminder"
                        >
                          {isSending === customer.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MessageCircle className="w-4 h-4" />
                          )}
                          <span className="absolute bottom-full right-0 mb-2 hidden group-hover/wa:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap border border-white/10">
                            Send Reminder
                          </span>
                        </button>
                      )}
                      <button className="p-1 hover:bg-white/10 rounded transition-colors text-gray-500 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
