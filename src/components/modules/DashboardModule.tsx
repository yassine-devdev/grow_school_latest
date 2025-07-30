
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../ui/StatCard';
import { Icons } from '../icons';
import './dashboard-module.css';
import '../ui/chart-tooltip.css';

// Define interfaces for the props
interface DashboardStats {
  totalStudents?: number;
  revenue?: string;
  newEnrollments?: number;
  activeCourses?: number;
}

interface ChartDataPoint {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

interface AiInsight {
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
}

interface DashboardModuleProps {
  initialStats?: DashboardStats;
  initialChartData?: ChartDataPoint[];
  initialInsights?: AiInsight[];
}

const data = [
  { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

const DashboardModule: React.FC<DashboardModuleProps> = ({
  initialStats = {},
  initialChartData = data,
  initialInsights = []
}) => {
  // Use the provided data or fall back to defaults
  const stats = {
    totalStudents: initialStats.totalStudents || 1284,
    revenue: initialStats.revenue || '$48.k',
    newEnrollments: initialStats.newEnrollments || 97,
    activeCourses: initialStats.activeCourses || 42
  };

  const chartData = initialChartData.length > 0 ? initialChartData : data;
  const insights = initialInsights;
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Top row of stats */}
      <div className="grid grid-cols-4 gap-4 h-1/3">
        <StatCard title="Total Students" value={stats.totalStudents.toLocaleString()} icon={Icons.Students} trend="+12% this month" trendColor="text-green-400" />
        <StatCard title="Revenue" value={stats.revenue} icon={Icons.Finance} trend="+8.5% this month" trendColor="text-green-400" />
        <StatCard title="New Enrollments" value={stats.newEnrollments.toString()} icon={Icons.School} trend="-5% this week" trendColor="text-red-400" />
        <StatCard title="Active Courses" value={stats.activeCourses.toString()} icon={Icons.KnowledgeBase} trend="+2 this month" trendColor="text-green-400" />
      </div>
      {/* Bottom section with chart */}
      <div className="chart-container-bordered flex-1 bg-white/5 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl shadow-black/40 flex flex-col">
        <h3 className="font-orbitron text-lg text-white mb-4 shrink-0">Engagement Overview</h3>
        <div className="flex-grow min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                wrapperClassName="chart-tooltip-wrapper"
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 20, 0.8)',
                  backdropFilter: 'blur(4px)',
                }}
                labelStyle={{ color: '#f5f5f5', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}}/>
              <Line type="monotone" dataKey="pv" name="Page Views" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="uv" name="Unique Visitors" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights Section */}
      {insights.length > 0 && (
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl shadow-black/40">
          <h3 className="font-orbitron text-lg text-white mb-4">AI Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <h4 className="text-white font-medium mb-2">{insight.title}</h4>
                <p className="text-gray-300 text-sm">{insight.description}</p>
                {insight.priority && (
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                    insight.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {insight.priority} priority
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardModule;