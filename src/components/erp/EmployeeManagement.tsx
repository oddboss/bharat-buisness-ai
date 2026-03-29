import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Mail, Phone, MapPin, Briefcase, Clock, MoreVertical, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  status: 'Active' | 'On Leave' | 'Remote';
  joinDate: string;
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'Arjun Mehta', role: 'Operations Manager', department: 'Operations', email: 'arjun.m@bharatmind.ai', phone: '+91 98765 43210', location: 'Mumbai', status: 'Active', joinDate: '2023-01-15' },
  { id: '2', name: 'Priya Sharma', role: 'Senior Developer', department: 'Engineering', email: 'priya.s@bharatmind.ai', phone: '+91 98765 43211', location: 'Bangalore', status: 'Active', joinDate: '2023-03-20' },
  { id: '3', name: 'Rahul Verma', role: 'Sales Lead', department: 'Sales', email: 'rahul.v@bharatmind.ai', phone: '+91 98765 43212', location: 'Delhi', status: 'Remote', joinDate: '2023-05-10' },
  { id: '4', name: 'Ananya Iyer', role: 'HR Specialist', department: 'Human Resources', email: 'ananya.i@bharatmind.ai', phone: '+91 98765 43213', location: 'Chennai', status: 'On Leave', joinDate: '2023-02-28' },
  { id: '5', name: 'Vikram Singh', role: 'Data Scientist', department: 'Engineering', email: 'vikram.s@bharatmind.ai', phone: '+91 98765 43214', location: 'Hyderabad', status: 'Active', joinDate: '2023-08-15' },
];

export function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', 'Engineering', 'Operations', 'Sales', 'Human Resources'];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Headcount</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{mockEmployees.length}</div>
          <div className="text-xs text-gray-500 mt-2">Full-time employees</div>
        </div>
        
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Now</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-500">
            {mockEmployees.filter(e => e.status === 'Active').length}
          </div>
          <div className="text-xs text-gray-500 mt-2">Currently clocked in</div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">On Leave</span>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-500">
            {mockEmployees.filter(e => e.status === 'On Leave').length}
          </div>
          <div className="text-xs text-gray-500 mt-2">Returning this week</div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Open Positions</span>
            <UserPlus className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-white">4</div>
          <div className="text-xs text-emerald-500 mt-2">Hiring in Engineering</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111111] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="glass-input px-4 py-2 text-sm"
            >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shrink-0">
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{emp.name}</h3>
                  <p className="text-xs text-gray-500">{emp.role}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-white/10 rounded transition-colors text-gray-500">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <Briefcase className="w-3.5 h-3.5 text-gray-600" /> {emp.department}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <Mail className="w-3.5 h-3.5 text-gray-600" /> {emp.email}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <Phone className="w-3.5 h-3.5 text-gray-600" /> {emp.phone}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <MapPin className="w-3.5 h-3.5 text-gray-600" /> {emp.location}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className={cn(
                "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded",
                emp.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" :
                emp.status === 'On Leave' ? "bg-orange-500/10 text-orange-500" :
                "bg-blue-500/10 text-blue-500"
              )}>
                {emp.status}
              </span>
              <span className="text-[10px] text-gray-600">Joined {new Date(emp.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
