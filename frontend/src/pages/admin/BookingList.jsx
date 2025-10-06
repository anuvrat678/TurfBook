import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Calendar as CalendarIcon,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loader from '../../components/Loader';

const Bookinglist = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const statusStyles = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const statusTextMap = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled'
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings', {
          params: {
            search: searchTerm,
            status: statusFilter
          }
        });
        // Sort by latest first
        const sortedData = data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sortedData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [searchTerm, statusFilter]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manage Bookings</h2>
            <p className="text-gray-600">{bookings.length} total bookings</p>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
          <select
            className="p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            {/* <option value="pending">Pending</option> */}
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User & Ground</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map(booking => (
                <motion.tr 
                  key={booking._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={booking.ground?.cover} 
                        alt={booking.ground?.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium">{booking.user?.name || 'User not found'}</p>
                        <p className="text-sm text-gray-500">
                          {booking.ground?.name || 'Ground not found'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(booking.date).toLocaleDateString('en-IN')}
                      </span>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-sm">
                        {booking.timeSlots.join(', ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                      <span className="font-medium">
                        {booking.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[booking.status]}`}>
                      {statusTextMap[booking.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          className="text-green-600 hover:text-green-700"
                          title="Confirm Booking"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      {(booking.status === 'confirmed' && new Date(booking.date) > new Date()) && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          className="text-red-600 hover:text-red-700"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          className="text-red-600 hover:text-red-700"
                          title="Reject Booking"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {bookings.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No bookings found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookinglist;