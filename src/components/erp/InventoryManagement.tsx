import React, { useState, useEffect, useCallback } from 'react';
import { Package, Search, Filter, AlertTriangle, ArrowUpRight, ArrowDownRight, MoreVertical, Plus, Bell, X, Send, MessageSquare, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client';

const socket = io();

interface InventoryItem {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  stock_quantity: number;
  cost_price: number;
  selling_price: number;
  supplier: string;
  warehouse: string;
  reorder_level: number;
  last_updated: string;
}

export function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeAlert, setActiveAlert] = useState<{ count: number; items: string[] } | null>(null);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [lastAlertSent, setLastAlertSent] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('API response not ok');
      const data = await res.json();
      
      if (data.length === 0) {
        const mockRes = await fetch('/inventory_data.json');
        if (mockRes.ok) {
          const mockData = await mockRes.json();
          setItems(mockData);
          const lowStock = mockData.filter((i: any) => i.stock_quantity <= i.reorder_level);
          if (lowStock.length > 0) {
            setActiveAlert({ count: lowStock.length, items: lowStock.slice(0, 3).map((i: any) => i.product_name) });
          }
        }
      } else {
        setItems(data);
        const lowStock = data.filter((i: any) => i.stock_quantity <= i.reorder_level);
        if (lowStock.length > 0) {
          setActiveAlert({ count: lowStock.length, items: lowStock.slice(0, 3).map((i: any) => i.product_name) });
        }
      }
    } catch (err) {
      console.error("Failed to load inventory data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    socket.on('low_stock_alert', (data) => {
      console.log('Real-time low stock alert:', data);
      setActiveAlert(data);
      // Automatically refresh data to show latest stock
      loadData();
    });

    return () => {
      socket.off('low_stock_alert');
    };
  }, [loadData]);

  const sendAlertToManager = async (type: 'WhatsApp' | 'Email') => {
    setIsSendingAlert(true);
    try {
      const lowStockNames = items
        .filter(item => item.stock_quantity <= item.reorder_level)
        .map(item => `${item.product_name} (SKU: ${item.sku})`)
        .join(', ');

      const res = await fetch('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          recipient: type === 'WhatsApp' ? '+91 98765 43210' : 'manager@bharatbusiness.com',
          message: `Low Stock Alert: The following items are below reorder levels: ${lowStockNames}`
        })
      });

      if (res.ok) {
        setLastAlertSent(type);
        setTimeout(() => setLastAlertSent(null), 3000);
      }
    } catch (err) {
      console.error('Failed to send alert:', err);
    } finally {
      setIsSendingAlert(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(item => item.stock_quantity <= item.reorder_level);
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Alert Banner */}
      {activeAlert && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-red-500/20 rounded-full">
              <Bell className="w-5 h-5 text-red-500 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Critical Low Stock Alert</h4>
              <p className="text-xs text-red-400">
                {activeAlert.count} items are currently below reorder levels. 
                <span className="ml-1 font-medium text-red-300">({activeAlert.items.join(', ')}...)</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => sendAlertToManager('WhatsApp')}
              disabled={isSendingAlert}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 rounded-lg text-xs font-bold transition-all border border-emerald-500/20"
            >
              {lastAlertSent === 'WhatsApp' ? 'Sent!' : <><MessageSquare className="w-3.5 h-3.5" /> WhatsApp Manager</>}
            </button>
            <button 
              onClick={() => sendAlertToManager('Email')}
              disabled={isSendingAlert}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 rounded-lg text-xs font-bold transition-all border border-blue-500/20"
            >
              {lastAlertSent === 'Email' ? 'Sent!' : <><Mail className="w-3.5 h-3.5" /> Email Manager</>}
            </button>
            <button 
              onClick={() => setActiveAlert(null)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Items</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{items.length}</div>
          <div className="text-xs text-gray-500 mt-2">Across {categories.length - 1} categories</div>
        </div>
        
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Low Stock Alerts</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-500">{lowStockItems.length}</div>
          <div className="text-xs text-red-500/50 mt-2">Requires immediate attention</div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Value</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹{(items.reduce((acc, item) => acc + (item.stock_quantity * item.cost_price), 0) / 100000).toFixed(2)}L
          </div>
          <div className="text-xs text-gray-500 mt-2">Estimated inventory cost</div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Warehouse Capacity</span>
            <ArrowDownRight className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-white">78%</div>
          <div className="text-xs text-gray-500 mt-2">Across 6 locations</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111111] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="glass-input px-4 py-2 text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={() => {
              setActiveAlert({ count: 5, items: ['Industrial Motor', 'Steel Sheets', 'Copper Wire'] });
            }}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shrink-0 border border-red-500/20"
          >
            <AlertTriangle className="w-4 h-4" /> Simulate Alert
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Price (₹)</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Warehouse</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.slice(0, 50).map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className={cn(
                      "text-sm font-medium flex items-center gap-2",
                      item.stock_quantity <= item.reorder_level ? "text-red-500" : "text-white"
                    )}>
                      {item.stock_quantity <= item.reorder_level && (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      )}
                      {item.product_name}
                    </div>
                    <div className="text-xs text-gray-500">{item.supplier}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">{item.sku}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "text-sm font-semibold",
                      item.stock_quantity <= item.reorder_level ? "text-red-500" : "text-white"
                    )}>
                      {item.stock_quantity}
                    </div>
                    <div className="text-[10px] text-gray-500">Min: {item.reorder_level}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">₹{(item.selling_price || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500">Cost: ₹{(item.cost_price || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.warehouse}</td>
                  <td className="px-6 py-4">
                    {item.stock_quantity <= item.reorder_level ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-white/10 rounded transition-colors text-gray-500 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length > 50 && (
          <div className="p-4 border-t border-white/5 text-center">
            <button className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">
              View All {filteredItems.length} Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
