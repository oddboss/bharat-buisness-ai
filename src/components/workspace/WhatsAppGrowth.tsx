import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Send, 
  Zap, 
  CheckCircle2, 
  ArrowUpRight,
  Clock,
  MessageCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function WhatsAppGrowth() {
  const growthStats = [
    { label: "Active Contacts", value: "1,240", status: "+12% this week", color: "text-emerald-400" },
    { label: "Response Rate", value: "84%", status: "High Engagement", color: "text-blue-400" },
    { label: "Revenue from WhatsApp", value: "₹2,45,000", status: "Q1 Total", color: "text-emerald-400" },
  ];

  const recentCampaigns = [
    { title: "Summer Sale Blast", date: "Mar 24, 2026", reach: "850", conversion: "12%", status: "Completed" },
    { title: "Loyalty Reward Reminder", date: "Mar 20, 2026", reach: "420", conversion: "18%", status: "Completed" },
  ];

  const aiGrowthInsights = [
    { title: "Payment Reminder Opportunity", description: "₹1.2 Lakhs in overdue payments can be recovered via automated WhatsApp reminders.", action: "Send Reminders" },
    { title: "High-Value Customer Alert", description: "12 customers haven't ordered in 30 days. Send a personalized 'We Miss You' offer.", action: "Draft Message" },
  ];

  return (
    <div className="p-8 space-y-10 bg-[#020617] min-h-screen text-white font-sans selection:bg-emerald-500/30">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <MessageCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">AI Growth Engine Active</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">WhatsApp <span className="text-emerald-500">Growth Suite</span></h1>
          <p className="text-white/40 text-sm">Automated customer engagement and revenue recovery via WhatsApp.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 glass-card hover:bg-white/[0.05] text-white/70 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </button>
          <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <Send className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {growthStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 glass-card group hover:border-emerald-500/20 transition-all duration-500"
          >
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={cn("text-3xl font-bold tracking-tight", stat.color)}>{stat.value}</h3>
              <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-md">{stat.status}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Growth Insights */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white/20 uppercase tracking-[0.3em] px-2">AI Growth Insights</h3>
          <div className="space-y-4">
            {aiGrowthInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 glass-card border-l-4 border-l-emerald-500/50 group hover:bg-white/[0.02] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h4 className="font-bold text-white tracking-tight">{insight.title}</h4>
                  </div>
                  <button className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    {insight.action}
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white/20 uppercase tracking-[0.3em] px-2">Recent Campaigns</h3>
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm">Campaign History</span>
                </div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">March 2026</span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {recentCampaigns.map((campaign, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                      <span className="text-[10px] font-bold text-white/40 uppercase leading-none mb-1">Reach</span>
                      <span className="text-lg font-bold text-white leading-none">{campaign.reach}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white tracking-tight">{campaign.title}</h4>
                      <p className="text-xs text-white/30">{campaign.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{campaign.conversion} Conv.</span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{campaign.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <div className="flex items-center gap-3 text-white/40">
                <Users className="w-4 h-4" />
                <p className="text-[10px] font-medium leading-relaxed">
                  BharatMind AI uses your Tally sales data to segment customers and suggest the best times to send WhatsApp messages for maximum conversion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
