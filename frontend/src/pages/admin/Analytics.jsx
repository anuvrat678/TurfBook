import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Users, IndianRupee, Calendar, MapPin } from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loader from '../../components/Loader';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-gray-600">Key performance metrics and trends</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold mt-2 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {stats.totalRevenue?.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IndianRupee className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold mt-2">{stats.totalBookings}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Grounds</p>
                <p className="text-2xl font-bold mt-2">{stats.activeGrounds}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New Users</p>
                <p className="text-2xl font-bold mt-2">{stats.newUsers}</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-pink-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Booking Distribution (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.bookingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1  bg-grey md:grid-cols-1 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Top Performing Grounds</h3>
            <div className="space-y-4">
              {stats.topGrounds.map(ground => (
                <div key={ground._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img 
                      src={ground.cover} 
                      alt={ground.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <span>{ground.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{ground.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{ground.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {stats.recentActivity.map(activity => (
                <div key={activity._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    activity.type === 'booking' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'payment' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;