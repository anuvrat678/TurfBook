import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import api from '../../services/api';
import { 
  LayoutDashboard,
  MapPin,
  Calendar,
  Users,
  BarChart,
  Settings,
  LogOut,
  Plus,
  Clock,
  IndianRupee,
  User
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/recent-bookings')
        ]);

        setStats(statsRes.data);
        setRecentBookings(bookingsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Revenue Chart Data
  const revenueData = {
    labels: stats?.revenueTrends.map(r => new Date(r._id).toLocaleDateString()),
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: stats?.revenueTrends.map(r => r.total),
      borderColor: 'rgb(22 163 74)',
      backgroundColor: 'rgba(22 163 74 / 0.2)',
      tension: 0.4
    }]
  };

  // Bookings Chart Data
  const bookingsData = {
    labels: stats?.bookingTrends.map(b => new Date(b._id).toLocaleDateString()),
    datasets: [{
      label: 'Daily Bookings',
      data: stats?.bookingTrends.map(b => b.count),
      backgroundColor: 'rgba(99 102 241 / 0.2)',
      borderColor: 'rgb(99 102 241)',
      tension: 0.4
    }]
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h2>
            <p className="text-gray-600">Here's what's happening with your turf grounds</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/listground')}
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Ground
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold mt-2">₹{stats?.totalRevenue?.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IndianRupee className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Grounds</p>
                <p className="text-2xl font-bold mt-2">{stats?.totalGrounds}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Bookings</p>
                <p className="text-2xl font-bold mt-2">{stats?.activeBookings}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Registered Users</p>
                <p className="text-2xl font-bold mt-2">{stats?.totalUsers}</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-pink-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Revenue Overview (Last 30 Days)</h3>
            <div className="h-64">
              <Line 
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' }
                  }
                }}
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Booking Trends (Last 30 Days)</h3>
            <div className="h-64">
              <Bar 
                data={bookingsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Bookings (Last 7 Days)</h3>
            <button 
              onClick={() => navigate('/admin/bookings')}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              View All →
            </button>
          </div>
          <div className="p-6">
            {recentBookings.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No recent bookings</div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map(booking => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{booking.ground?.name}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString()} • {booking.timeSlots[0]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{booking.totalAmount.toFixed(2)}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        {booking.user?.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;